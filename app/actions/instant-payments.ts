"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { 
  ACCOUNTPE_API_URL, 
  ACCOUNTPE_MERCHANT_ID, 
  ACCOUNTPE_CREDENTIALS, 
  ACCOUNTPE_API_KEY, 
  APP_URL, 
  parseCredentials 
} from "@/lib/config"
import { convertXAFtoUSD } from "@/lib/currency"
import { toast } from "sonner"

interface CreateInstantPaymentParams {
  userId: string
  amount: number
  email: string
  phone: string
  userName: string
}

interface PaymentResponse {
  success: boolean
  paymentLink?: string
  transactionId?: string
  error?: string
}

// Get JWT token from AccountPe authentication endpoint
async function getAccountPeJWT(): Promise<string | null> {
  try {
    console.log("[v0] Parsing AccountPe credentials...")
    const creds = parseCredentials(ACCOUNTPE_CREDENTIALS)
    
    if (!creds) {
      console.error("[v0] Credentials parsing failed - format invalid")
      console.error("[v0] ACCOUNTPE_CREDENTIALS value:", ACCOUNTPE_CREDENTIALS ? "SET" : "NOT SET")
      return null
    }

    console.log("[v0] Credentials parsed:", {
      email: creds.email,
      passwordLength: creds.password?.length,
    })

    // Try multiple auth endpoints as AccountPe may use different ones
    const authEndpoints = [
      `${ACCOUNTPE_API_URL}/admin/auth`,
      `https://api.accountpe.com/api/auth`,
      `https://api.accountpe.com/auth`,
    ]

    for (const authUrl of authEndpoints) {
      console.log("[v0] Trying auth endpoint:", authUrl)
      
      try {
        const response = await fetch(authUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: creds.email,
            password: creds.password,
          }),
        })

        console.log("[v0] Auth response status:", response.status, "from", authUrl)

        if (response.ok) {
          const data = await response.json()
          const token = data.token || data.access_token || data.jwt || data.data?.token
          if (token) {
            console.log("[v0] JWT token received successfully from:", authUrl)
            return token
          }
        }
      } catch (endpointError) {
        console.log("[v0] Endpoint failed:", authUrl, endpointError)
        continue
      }
    }

    // If all auth endpoints fail, try using API key directly as bearer token
    console.log("[v0] All auth endpoints failed, using API key as bearer token")
    return ACCOUNTPE_API_KEY || null
  } catch (error) {
    console.error("[v0] JWT token fetch error:", error)
    // Fallback to using API key directly
    return ACCOUNTPE_API_KEY || null
  }
}

export async function fetchPendingUsers(): Promise<PendingUser[]> {
  try {
    const supabase = createAdminClient()

    // Get all pending transactions grouped by user
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("user_id, amount, id")
      .eq("status", "pending")
      .eq("type", "deposit")
      .eq("payment_method", "instant_xaf")

    if (error) {
      console.error("[v0] Error fetching pending transactions:", error)
      return []
    }

    // Group by user and aggregate
    const userMap = new Map<string, any>()

    for (const tx of transactions || []) {
      if (!userMap.has(tx.user_id)) {
        userMap.set(tx.user_id, {
          userId: tx.user_id,
          pendingAmount: 0,
          pendingCount: 0,
        })
      }
      const user = userMap.get(tx.user_id)
      user.pendingAmount += tx.amount || 0
      user.pendingCount += 1
    }

    // Now fetch user details for each pending user
    const pendingUsers: PendingUser[] = []

    for (const [userId, data] of userMap) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email, username, full_name")
        .eq("id", userId)
        .single()

      if (!userError && userData) {
        pendingUsers.push({
          userId,
          userEmail: userData.email || "",
          userName: userData.username || userData.full_name || userId,
          pendingAmount: data.pendingAmount,
          pendingCount: data.pendingCount,
        })
      }
    }

    console.log("[v0] Fetched pending users:", pendingUsers.length)
    return pendingUsers.sort((a, b) => b.pendingAmount - a.pendingAmount)
  } catch (error) {
    console.error("[v0] Error fetching pending users:", error)
    return []
  }
}

interface PendingUser {
  userId: string
  userEmail: string
  userName: string
  pendingAmount: number
  pendingCount: number
}

export async function createInstantPayment(params: CreateInstantPaymentParams): Promise<PaymentResponse> {
  try {
    // Convert XAF amount to USD for internal storage
    // The platform's base currency is USD, but user pays in XAF
    const amountInXAF = params.amount
    const amountInUSD = convertXAFtoUSD(amountInXAF)
    
    console.log("[v0] Creating instant payment with params:", {
      userId: params.userId,
      amountInXAF: amountInXAF,
      amountInUSD: amountInUSD,
      email: params.email,
    })

    // Check if credentials are configured
    if (!ACCOUNTPE_CREDENTIALS) {
      console.error("[v0] CRITICAL: AccountPe credentials NOT configured")
      console.error("[v0] Please set ACCOUNTPE_API_KEY in Vars section with format: email:password")
      return {
        success: false,
        error: "Payment service not configured. Please set ACCOUNTPE_API_KEY (format: email:password) in Vars section.",
      }
    }

    // Validate credential format
    const creds = parseCredentials(ACCOUNTPE_CREDENTIALS)
    if (!creds) {
      console.error("[v0] Invalid credential format")
      return {
        success: false,
        error: "Invalid API key format. Expected: email:password",
      }
    }

    console.log("[v0] Credentials valid, attempting JWT authentication...")
    console.log("[v0] Using email:", creds.email)

    // Get JWT token
    const jwtToken = await getAccountPeJWT()
    if (!jwtToken) {
      console.error("[v0] JWT token retrieval failed")
      return {
        success: false,
        error: "Authentication failed - Check API credentials (email:password format)",
      }
    }

    console.log("[v0] JWT token obtained successfully")

    const supabase = await createClient()

    // Get current user balance
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("balance")
      .eq("id", params.userId)
      .single()

    if (userError || !userData) {
      throw new Error("User not found")
    }

    const balanceBefore = userData.balance || 0

    // Create transaction record - with payment_id field for webhook to find it later
    // IMPORTANT: Store USD amount (converted from XAF) since platform base currency is USD
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: params.userId,
        amount: amountInUSD, // Store USD amount (converted)
        type: "deposit",
        payment_method: "instant_xaf",
        status: "pending",
        notes: `XAF Payment - ${params.userName} [${amountInXAF} XAF = $${amountInUSD} USD]`,
        balance_before: balanceBefore,
        balance_after: balanceBefore + amountInUSD, // Add USD amount to balance
        payment_id: "", // Will be set after AccountPe API call
      })
      .select()
      .single()

    if (txError) {
      console.error("[v0] Transaction creation error:", txError)
      throw new Error("Failed to create transaction")
    }

    console.log("[v0] Transaction created successfully:", {
      transactionId: transaction.id,
      amountInUSD: transaction.amount,
      amountInXAF: amountInXAF,
    })

    // Call AccountPe API to create payment link
    // IMPORTANT: Send XAF amount to payment gateway (they charge in XAF)
    console.log("[v0] Calling AccountPe API with:", {
      url: `${ACCOUNTPE_API_URL}/create_payment_links`,
      merchantId: ACCOUNTPE_MERCHANT_ID,
      amountInXAF: amountInXAF, // Payment gateway receives XAF amount
      amountInUSD: amountInUSD, // We store USD amount internally
      email: params.email,
    })

    const response = await fetch(`${ACCOUNTPE_API_URL}/create_payment_links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`,
        "Idempotency-Key": transaction.id,
      },
      body: JSON.stringify({
        country_code: "CM",
        name: params.userName,
        email: params.email,
        mobile: params.phone || "",
        amount: amountInXAF, // Send original XAF amount to payment gateway
        currency: "XAF",
        transaction_id: transaction.id,
        pass_digital_charge: true,
        callback_url: `${APP_URL}/api/webhooks/instant-payment`,
      }),
    })

    console.log("[v0] AccountPe API response status:", response.status)

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("[v0] AccountPe API error response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      })
      
      // Return more specific error based on status code
      let errorMessage = "Payment service unavailable"
      if (response.status === 401) {
        errorMessage = "Authentication failed - Check API credentials"
      } else if (response.status === 404) {
        errorMessage = "Payment endpoint not found"
      } else if (response.status === 500) {
        errorMessage = "Payment service error - Please try again"
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log("[v0] AccountPe API response data:", data)

    if (data.data?.payment_link) {
      // Payment link successfully created - use it directly
      const paymentLink = data.data.payment_link
      const accountPeTransactionId = data.data.transaction_id || data.data.id
      
      // Update transaction with payment link and AccountPe transaction ID
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ 
          payment_id: accountPeTransactionId,
          notes: `XAF Payment - ${params.userName} [${amountInXAF} XAF = $${amountInUSD} USD] [AccountPe: ${accountPeTransactionId}]`
        })
        .eq("id", transaction.id)

      if (updateError) {
        console.error("[v0] Transaction update error:", updateError)
      }

      console.log("[v0] Payment link created successfully:", {
        paymentLink: paymentLink,
        accountPeTransactionId: accountPeTransactionId,
        ourTransactionId: transaction.id,
      })
      
      return {
        success: true,
        paymentLink: paymentLink,
        transactionId: transaction.id,
      }
    } else if (data.data?.id) {
      // If API returns transaction ID but no direct link, construct payment link like Swycher
      // Format: https://app.swychrconnect.com/payment/{transaction_id}
      const paymentLink = `https://app.accountpe.com/payin/payment/${data.data.id}`
      
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ 
          payment_id: data.data.id,
          notes: `XAF Payment - ${params.userName} [${amountInXAF} XAF = $${amountInUSD} USD] [AccountPe: ${data.data.id}]`
        })
        .eq("id", transaction.id)

      if (updateError) {
        console.error("[v0] Transaction update error:", updateError)
      }

      console.log("[v0] Payment link constructed:", {
        paymentLink: paymentLink,
        accountPeTransactionId: data.data.id,
        ourTransactionId: transaction.id,
      })
      
      return {
        success: true,
        paymentLink: paymentLink,
        transactionId: transaction.id,
      }
    } else {
      console.error("[v0] No payment ID in response:", data)
      throw new Error(data.message || "Payment link creation failed")
    }
  } catch (error) {
    console.error("[v0] Instant payment error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment processing failed"
    };
  }
}

export async function verifyInstantPayment(transactionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single()

    if (txError || !transaction) {
      return { success: false, error: "Transaction not found" }
    }

    // Call AccountPe API to verify payment
    const response = await fetch(`${ACCOUNTPE_API_URL}/payment/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCOUNTPE_API_KEY}`,
      },
      body: JSON.stringify({
        merchantId: ACCOUNTPE_MERCHANT_ID,
        transactionId: transaction.payment_id,
      }),
    })

    const data = await response.json()

    if (data.status === 1) {
      // Payment successful - update transaction
      await supabase.from("transactions").update({ status: "completed" }).eq("id", transactionId)

      // Update user balance
      const { data: user } = await supabase
        .from("users")
        .select("balance")
        .eq("id", transaction.user_id)
        .single()

      if (user) {
        const newBalance = (user.balance || 0) + transaction.amount
        await supabase.from("users").update({ balance: newBalance }).eq("id", transaction.user_id)
      }

      return { success: true }
    } else if (data.status === -1) {
      // Payment failed
      await supabase.from("transactions").update({ status: "failed" }).eq("id", transactionId)
      return { success: false, error: "Payment failed" }
    } else {
      // Payment pending
      return { success: false, error: "Payment pending" }
    }
  } catch (error) {
    console.error("[v0] Verification error:", error)
    return { success: false, error: "Verification failed" }
  }
}
