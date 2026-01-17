"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function replyToTicket(ticketId: string, message: string) {
  try {
    const supabase = createAdminClient()

    // Get current admin user - use service role to bypass RLS
    const { data: ticket } = await supabase.from("support_tickets").select("user_id").eq("id", ticketId).single()

    if (!ticket) {
      return { error: "Ticket not found" }
    }

    // Insert admin reply message
    const { error: messageError } = await supabase.from("ticket_messages").insert({
      ticket_id: ticketId,
      user_id: ticket.user_id, // Use ticket owner's user_id for now
      message,
      is_admin: true,
    })

    if (messageError) {
      console.error("[v0] Reply ticket message error:", messageError)
      return { error: messageError.message }
    }

    // Update ticket status to "replied"
    const { error: updateError } = await supabase
      .from("support_tickets")
      .update({ status: "replied", updated_at: new Date().toISOString() })
      .eq("id", ticketId)

    if (updateError) {
      console.error("[v0] Update ticket status error:", updateError)
      return { error: updateError.message }
    }

    revalidatePath("/dashboard/tickets")
    revalidatePath("/admin-panel-2024/support")
    revalidatePath("/admin-panel-2024/tickets")

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Reply to ticket error:", error)
    return { error: error.message || "Failed to reply to ticket" }
  }
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from("support_tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", ticketId)

  if (error) throw error

  revalidatePath("/admin-panel-2024/support")
  revalidatePath("/admin-panel-2024/tickets")
  return { success: true }
}

export async function closeTicket(ticketId: string) {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from("support_tickets")
    .update({ status: "closed", updated_at: new Date().toISOString() })
    .eq("id", ticketId)

  if (error) throw error

  revalidatePath("/admin-panel-2024/support")
  revalidatePath("/admin-panel-2024/tickets")
  return { success: true }
}
