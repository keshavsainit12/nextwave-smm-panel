import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ status: "error", message: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Create ticket in database
    const { data, error } = await supabase
      .from("support_tickets")
      .insert([
        {
          name,
          email,
          subject,
          message,
          status: "open",
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Error creating ticket:", error)
      return NextResponse.json({ status: "error", message: "Failed to create ticket" }, { status: 500 })
    }

    return NextResponse.json({
      status: "success",
      message: "Ticket created successfully",
      ticket_id: data?.[0]?.id,
    })
  } catch (error) {
    console.error("[v0] Contact API error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}
