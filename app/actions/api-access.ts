"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

export async function generateApiKey() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("[v0] Not authenticated")
      throw new Error("Not authenticated")
    }

    // Generate a random API key with format: nw_[random]_[timestamp]
    const timestamp = Date.now()
    const random = crypto.randomBytes(32).toString("hex")
    const apiKey = `nw_${random}_${timestamp}`

    console.log("[v0] Generating API key for user:", user.id)

    const { error } = await supabase.from("users").update({ api_key: apiKey }).eq("id", user.id)

    if (error) {
      console.error("[v0] API key generation error:", error.message)
      throw new Error(error.message || "Failed to generate API key")
    }

    revalidatePath("/dashboard/api")
    console.log("[v0] API key generated successfully")
    return { success: true, apiKey }
  } catch (error: any) {
    console.error("[v0] Generate API key error:", error?.message)
    throw error
  }
}

export async function regenerateApiKey() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    // Generate new API key
    const timestamp = Date.now()
    const random = crypto.randomBytes(32).toString("hex")
    const apiKey = `nw_${random}_${timestamp}`

    console.log("[v0] Regenerating API key for user:", user.id)

    const { error } = await supabase.from("users").update({ api_key: apiKey }).eq("id", user.id)

    if (error) {
      console.error("[v0] API key regeneration error:", error.message)
      throw new Error(error.message || "Failed to regenerate API key")
    }

    revalidatePath("/dashboard/api")
    console.log("[v0] API key regenerated successfully")
    return { success: true, apiKey }
  } catch (error: any) {
    console.error("[v0] Regenerate API key error:", error?.message)
    throw error
  }
}

export async function revokeApiKey() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    console.log("[v0] Revoking API key for user:", user.id)

    const { error } = await supabase.from("users").update({ api_key: null }).eq("id", user.id)

    if (error) {
      console.error("[v0] API key revoke error:", error.message)
      throw new Error(error.message || "Failed to revoke API key")
    }

    revalidatePath("/dashboard/api")
    console.log("[v0] API key revoked successfully")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Revoke API key error:", error?.message)
    throw error
  }
}
