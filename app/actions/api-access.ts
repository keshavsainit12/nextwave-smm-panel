"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

export async function generateApiKey() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Generate a random API key
  const apiKey = `nw_${crypto.randomBytes(32).toString("hex")}`

  const { error } = await supabase.from("users").update({ api_key: apiKey }).eq("id", user.id)

  if (error) throw error

  revalidatePath("/dashboard/api")
}
