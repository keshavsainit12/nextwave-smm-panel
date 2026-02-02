import { NextRequest, NextResponse } from "next/server"
import { verifyRecaptcha } from "@/app/actions/auth"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, error: "Token required" }, { status: 400 })
    }

    const result = await verifyRecaptcha(token)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] reCAPTCHA verification route error:", error)
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    )
  }
}
