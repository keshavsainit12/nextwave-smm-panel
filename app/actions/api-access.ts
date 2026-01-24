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
      throw new Error("Not authenticated")
    }

    // Generate a random API key with format: nw_[random]_[timestamp]
    const timestamp = Date.now()
    const random = crypto.randomBytes(32).toString("hex")
    const apiKey = `nw_${random}_${timestamp}`

    const { error } = await supabase.from("users").update({ api_key: apiKey }).eq("id", user.id)

    if (error) {
      throw new Error(error.message || "Failed to generate API key")
    }

    revalidatePath("/dashboard/api")
    return { success: true, apiKey }
  } catch (error: any) {
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

    const { error } = await supabase.from("users").update({ api_key: apiKey }).eq("id", user.id)

    if (error) {
      throw new Error(error.message || "Failed to regenerate API key")
    }

    revalidatePath("/dashboard/api")
    return { success: true, apiKey }
  } catch (error: any) {
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

    const { error } = await supabase.from("users").update({ api_key: null }).eq("id", user.id)

    if (error) {
      throw new Error(error.message || "Failed to revoke API key")
    }

    revalidatePath("/dashboard/api")
    return { success: true }
  } catch (error: any) {
    throw error
  }
}
