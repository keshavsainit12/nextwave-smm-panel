"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createTicket(formData: FormData) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        user_id: user.id,
        subject: formData.get("subject") as string,
        priority: formData.get("priority") as string,
        status: "open",
        order_id: formData.get("order_id") as string | null,
      })
      .select()
      .single()

    if (ticketError) {
      return { success: false, error: ticketError.message }
    }

    const { error: messageError } = await supabase.from("ticket_messages").insert({
      ticket_id: ticket.id,
      user_id: user.id,
      message: formData.get("message") as string,
      is_admin: false,
    })

    if (messageError) {
      return { success: false, error: messageError.message }
    }

    revalidatePath("/dashboard/tickets")

    return { success: true, ticketId: ticket.id }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function addTicketMessage(ticketId: string, message: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const { error: insertError } = await supabase.from("ticket_messages").insert({
      ticket_id: ticketId,
      user_id: user.id,
      message,
      is_admin: false,
    })

    if (insertError) {
      throw insertError
    }

    const { error: updateError } = await supabase
      .from("support_tickets")
      .update({ status: "replied", updated_at: new Date().toISOString() })
      .eq("id", ticketId)

    if (updateError) {
      throw updateError
    }

    revalidatePath(`/dashboard/tickets/${ticketId}`)
    revalidatePath("/dashboard/tickets")
    revalidatePath("/admin-panel-2024/tickets")
  } catch (error) {
    throw error
  }
}
