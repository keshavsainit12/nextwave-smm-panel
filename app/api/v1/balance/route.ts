import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ status: "error", message: "Missing API key" }, { status: 401 })
    }

    const apiKey = authHeader.replace("Bearer ", "")
    const supabase = await createClient()

    // Find user by API key
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, balance")
      .eq("api_key", apiKey)
      .single()

    if (userError) {
      console.error("[v0] Balance API - User lookup error:", userError)
      return NextResponse.json({ status: "error", message: "Invalid API key" }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ status: "error", message: "Invalid API key" }, { status: 401 })
    }

    return NextResponse.json({
      status: "success",
      balance: user.balance || 0,
    })
  } catch (error) {
    console.error("[v0] Balance API error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}
