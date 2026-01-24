'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function processUserPayment(userId: string, amount: number) {
  try {
    const supabase = createAdminClient()

    console.log(`[v0] Processing payment for user: ${userId}, amount: ${amount}`)

    // Get user's pending transactions
    const { data: pendingTransactions, error: fetchError } = await supabase
      .from('transactions')
      .select('id, amount, user_id')
      .eq('user_id', userId)
      .eq('type', 'deposit')
      .eq('payment_method', 'instant_xaf')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('[v0] Fetch error:', fetchError.message)
      return { success: false, error: 'Failed to fetch transactions' }
    }

    if (!pendingTransactions || pendingTransactions.length === 0) {
      return { success: false, error: 'No pending transactions for this user' }
    }

    // Get current user balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('balance, email')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      return { success: false, error: 'User not found' }
    }

    const balanceBefore = Number(userData.balance) || 0
    const balanceAfter = balanceBefore + amount

    // Update all pending transactions for this user to completed
    const { error: txUpdateError } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        balance_before: balanceBefore,
        balance_after: balanceAfter,
      })
      .eq('user_id', userId)
      .eq('status', 'pending')
      .eq('type', 'deposit')
      .eq('payment_method', 'instant_xaf')

    if (txUpdateError) {
      console.error('[v0] Transaction update error:', txUpdateError.message)
      return { success: false, error: 'Failed to update transactions' }
    }

    // Update user balance
    const { error: balanceError } = await supabase
      .from('users')
      .update({ balance: balanceAfter })
      .eq('id', userId)

    if (balanceError) {
      console.error('[v0] Balance update error:', balanceError.message)
      return { success: false, error: 'Failed to update balance' }
    }

    // Revalidate paths
    revalidatePath('/admin-panel-2024/process-payments')
    revalidatePath('/admin-panel-2024')
    revalidatePath('/dashboard')

    console.log(`[v0] ✅ User payment processed successfully:`, {
      userId,
      userEmail: userData.email,
      amount,
      balanceBefore,
      balanceAfter,
    })

    return {
      success: true,
      message: `Payment of $${amount.toFixed(2)} processed for ${userData.email}`,
    }
  } catch (error) {
    console.error('[v0] Process user payment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process payment',
    }
  }
}

export async function processPendingInstantPayments() {
  try {
    const supabase = createAdminClient()

    console.log('[v0] Fetching pending instant payments...')

    // Get all pending instant payment transactions
    const { data: pendingTransactions, error: fetchError } = await supabase
      .from('transactions')
      .select('id, user_id, amount, status, payment_method, type, created_at')
      .eq('type', 'deposit')
      .eq('payment_method', 'instant_xaf')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(100)

    if (fetchError) {
      console.error('[v0] Fetch error:', fetchError.message)
      return { success: false, error: 'Failed to fetch transactions', processed: 0 }
    }

    if (!pendingTransactions || pendingTransactions.length === 0) {
      console.log('[v0] No pending instant payments found')
      return { success: true, message: 'No pending payments to process', processed: 0 }
    }

    console.log(`[v0] Found ${pendingTransactions.length} pending instant payments`)

    let processedCount = 0
    const results = []

    // Process each pending transaction
    for (const transaction of pendingTransactions) {
      try {
        console.log(`[v0] Processing transaction: ${transaction.id}`)

        // Get current user balance
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('balance, email')
          .eq('id', transaction.user_id)
          .single()

        if (userError || !userData) {
          console.error(`[v0] User not found: ${transaction.user_id}`)
          results.push({
            transactionId: transaction.id,
            status: 'failed',
            error: 'User not found',
          })
          continue
        }

        const balanceBefore = Number(userData.balance) || 0
        const amountToAdd = Number(transaction.amount) || 0
        const balanceAfter = balanceBefore + amountToAdd

        // Update transaction status to completed
        const { error: txUpdateError } = await supabase
          .from('transactions')
          .update({
            status: 'completed',
            balance_before: balanceBefore,
            balance_after: balanceAfter,
          })
          .eq('id', transaction.id)

        if (txUpdateError) {
          console.error(`[v0] Transaction update error: ${txUpdateError.message}`)
          results.push({
            transactionId: transaction.id,
            status: 'failed',
            error: 'Failed to update transaction',
          })
          continue
        }

        // Update user balance
        const { error: balanceError } = await supabase
          .from('users')
          .update({ balance: balanceAfter })
          .eq('id', transaction.user_id)

        if (balanceError) {
          console.error(`[v0] Balance update error: ${balanceError.message}`)
          results.push({
            transactionId: transaction.id,
            status: 'failed',
            error: 'Failed to update balance',
          })
          continue
        }

        console.log(`[v0] ✅ Transaction processed successfully`, {
          transactionId: transaction.id,
          user: userData.email,
          amount: amountToAdd,
          balanceBefore,
          balanceAfter,
        })

        results.push({
          transactionId: transaction.id,
          status: 'completed',
          userEmail: userData.email,
          amount: amountToAdd,
          balanceBefore,
          balanceAfter,
        })

        processedCount++
      } catch (error) {
        console.error(`[v0] Error processing transaction ${transaction.id}:`, error)
        results.push({
          transactionId: transaction.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Revalidate pages after processing
    try {
      revalidatePath('/admin-panel-2024')
      revalidatePath('/admin-panel-2024/transaction-history')
      revalidatePath('/dashboard')
      revalidatePath('/dashboard/deposit')
      console.log('[v0] Pages revalidated after processing pending payments')
    } catch (err) {
      console.log('[v0] Note: Could not revalidate pages:', err)
    }

    console.log(`[v0] Batch processing complete: ${processedCount} of ${pendingTransactions.length} transactions processed`)

    return {
      success: true,
      message: `Processed ${processedCount} pending instant payments`,
      processed: processedCount,
      total: pendingTransactions.length,
      results,
    }
  } catch (error) {
    console.error('[v0] Process pending payments error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      processed: 0,
    }
  }
}
