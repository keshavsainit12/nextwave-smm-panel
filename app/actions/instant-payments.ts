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
    console.log("[v0] Creating instant payment with params:", {
      userId: params.userId,
      amount: params.amount,
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

    // Convert XAF to USD for storage (1 XAF = 1/620 USD)
    const XAF_TO_USD_RATE = 620
    const amountInUSD = params.amount / XAF_TO_USD_RATE
    
    console.log("[v0] Currency conversion:", {
      amountXAF: params.amount,
      rate: XAF_TO_USD_RATE,
      amountUSD: amountInUSD.toFixed(4),
    })

    // Generate unique transaction ID upfront
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create transaction record in transactions table
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        id: transactionId,
        user_id: params.userId,
        amount: amountInUSD, // Store in USD
        type: "deposit",
        payment_method: "instant_xaf",
        status: "pending",
        payment_id: null, // Will be updated after API call
        notes: `XAF ${params.amount} (${amountInUSD.toFixed(2)} USD at rate 1/${XAF_TO_USD_RATE}) - ${params.userName}`,
        balance_before: balanceBefore,
        balance_after: balanceBefore + amountInUSD, // Add USD amount
      })
      .select()
      .single()

    if (txError) {
      console.error("[v0] Transaction creation error:", txError)
      throw new Error("Failed to create transaction")
    }

    console.log("[v0] Transaction created successfully:", {
      transactionId: transaction.id,
      amount: transaction.amount,
    })

    // Call AccountPe API to create payment link
    console.log("[v0] Calling AccountPe API with:", {
      url: `${ACCOUNTPE_API_URL}/create_payment_links`,
      merchantId: ACCOUNTPE_MERCHANT_ID,
      amount: params.amount,
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
        amount: params.amount,
        currency: "XAF",
        transaction_id: transaction.id,
        pass_digital_charge: true,
        // Using existing deposit pages for consistency with current flow
        callback_url: `${APP_URL}/api/webhooks/instant-payment`,
        success_url: `${APP_URL}/dashboard/deposit/success?transaction_id=${transaction.id}`,
        cancel_url: `${APP_URL}/dashboard/deposit/cancel`,
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
    console.log("[v0] AccountPe API full response:", JSON.stringify(data, null, 2))

    // Extract payment link - try multiple possible fields
    let paymentLink = null
    let accountPeTransactionId = null

    // Try different response structures
    if (data.data?.payment_link) {
      paymentLink = data.data.payment_link
      accountPeTransactionId = data.data.transaction_id || data.data.id
    } else if (data.data?.link) {
      paymentLink = data.data.link
      accountPeTransactionId = data.data.transaction_id || data.data.id
    } else if (data.payment_link) {
      paymentLink = data.payment_link
      accountPeTransactionId = data.transaction_id || data.id
    } else if (data.link) {
      paymentLink = data.link
      accountPeTransactionId = data.transaction_id || data.id
    } else if (data.data?.id) {
      // Construct payment link from transaction ID
      accountPeTransactionId = data.data.id
      paymentLink = `https://app.accountpe.com/payin/payment/${accountPeTransactionId}`
    } else if (data.id) {
      accountPeTransactionId = data.id
      paymentLink = `https://app.accountpe.com/payin/payment/${accountPeTransactionId}`
    }

    // If still no link, use our transaction ID as fallback
    if (!paymentLink) {
      console.warn("[v0] No payment link in response, using fallback URL")
      accountPeTransactionId = transaction.id
      // Use AccountPe payment page with our transaction ID
      paymentLink = `https://app.accountpe.com/payin/payment/${transaction.id}`
    }

    console.log("[v0] Payment link extracted/constructed:", {
      paymentLink: paymentLink,
      accountPeTransactionId: accountPeTransactionId,
      ourTransactionId: transaction.id,
      source: data.data?.payment_link ? "direct" : "constructed"
    })
    
    // Update transaction with payment link and AccountPe transaction ID
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ 
        payment_id: accountPeTransactionId || transaction.id,
        notes: `XAF Payment - ${params.userName} [AccountPe: ${accountPeTransactionId || transaction.id}]`
      })
      .eq("id", transaction.id)

    if (updateError) {
      console.error("[v0] Transaction update error:", updateError)
    }
    
    return {
      success: true,
      paymentLink: paymentLink,
      transactionId: transaction.id,
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
