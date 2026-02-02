import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { placeOrder } from "@/app/actions/orders"

export async function POST(request: Request) {
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
      .select("id")
      .eq("api_key", apiKey)
      .single()

    if (userError) {
      console.error("[v0] Order API - User lookup error:", userError)
      return NextResponse.json({ status: "error", message: "Invalid API key" }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ status: "error", message: "Invalid API key" }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ status: "error", message: "Invalid JSON body" }, { status: 400 })
    }

    const { service_id, link, quantity } = body

    if (!service_id || !link || !quantity) {
      return NextResponse.json({
        status: "error",
        message: "Missing required fields: service_id, link, quantity",
      }, { status: 400 })
    }

    // Place order using existing action (which applies tier pricing)
    const result = await placeOrder(service_id, link, Number(quantity))

    if (result.error) {
      console.error("[v0] Order placement error:", result.error)
      return NextResponse.json({ status: "error", message: result.error }, { status: 400 })
    }

    // Get order details for response
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, price, status")
      .eq("id", result.orderId)
      .single()

    if (orderError) {
      console.error("[v0] Order fetch error:", orderError)
      return NextResponse.json({
        status: "success",
        order_id: result.orderId,
        message: "Order created but details unavailable",
      })
    }

    return NextResponse.json({
      status: "success",
      order_id: order?.id,
      charge: order?.price,
      order_status: order?.status,
    })
  } catch (error) {
    console.error("[v0] Order API error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ status: "error", message: "Missing API key" }, { status: 401 })
    }

    const apiKey = authHeader.replace("Bearer ", "")
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("order_id")

    if (!orderId) {
      return NextResponse.json({ status: "error", message: "Missing order_id parameter" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify API key
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("api_key", apiKey)
      .single()

    if (userError) {
      console.error("[v0] Order GET - User lookup error:", userError)
      return NextResponse.json({ status: "error", message: "Invalid API key" }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ status: "error", message: "Invalid API key" }, { status: 401 })
    }

    // Get order (ensure it belongs to this user)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, quantity, start_count, remains, link")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single()

    if (orderError) {
      console.error("[v0] Order GET error:", orderError)
      return NextResponse.json({ status: "error", message: "Order not found" }, { status: 404 })
    }

    if (!order) {
      return NextResponse.json({ status: "error", message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      status: "success",
      order: {
        id: order.id,
        status: order.status,
        quantity: order.quantity,
        start_count: order.start_count || 0,
        remains: order.remains || 0,
        link: order.link,
      },
    })
  } catch (error) {
    console.error("[v0] Order GET exception:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}
