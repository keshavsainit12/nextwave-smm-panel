"use server"

import { createClient } from "@/lib/supabase/server"
import { toast } from "sonner"

const ACCOUNTPE_API_URL = "https://api.accountpe.com/api/payin"
const ACCOUNTPE_MERCHANT_ID = "nextwavedigitalsolutions1"
const ACCOUNTPE_API_KEY = process.env.ACCOUNTPE_API_KEY || "FMdbnds53@@"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nextwavesmm.vercel.app"

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

export async function createInstantPayment(params: CreateInstantPaymentParams): Promise<PaymentResponse> {
  try {
    const supabase = await createClient()

    // Get current user balance
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("balance")
      .eq("id", params.userId)
      .single()

    if (userError || !userData) {
      return { success: false, error: "User not found" }
    }

    const balanceBefore = userData.balance || 0

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: params.userId,
        amount: params.amount,
        type: "deposit",
        payment_method: "instant_xaf",
        status: "pending",
        notes: `XAF Payment - ${params.userName}`,
        balance_before: balanceBefore,
        balance_after: balanceBefore + params.amount,
      })
      .select()
      .single()

    if (txError) {
      console.error("[v0] Transaction creation error:", txError)
      return { success: false, error: "Failed to create transaction" }
    }

    // Call AccountPe API to create payment link
    const response = await fetch(`${ACCOUNTPE_API_URL}/create_payment_links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCOUNTPE_API_KEY}`,
      },
      body: JSON.stringify({
        country_code: "CM",
        name: params.userName,
        email: params.email,
        amount: params.amount,
        transaction_id: transaction.id,
        pass_digital_charge: true,
        notify_url: `${APP_URL}/api/webhooks/instant-payment`,
        redirect_url: `${APP_URL}/dashboard/deposit?status=success`,
      }),
    })

    if (!response.ok) {
      console.error("[v0] AccountPe API error:", response.status)
      return { success: false, error: "Payment service unavailable" }
    }

    const data = await response.json()

    if (data.data?.payment_link) {
      // Update transaction with payment link
      await supabase.from("transactions").update({ payment_id: data.data.transaction_id }).eq("id", transaction.id)

      return {
        success: true,
        paymentLink: data.data.payment_link,
        transactionId: transaction.id,
      }
    } else {
      return { success: false, error: data.message || "Payment link creation failed" }
    }
  } catch (error) {
    console.error("[v0] Instant payment error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Payment processing failed" }
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
