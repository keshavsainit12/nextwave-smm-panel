"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function addCryptoCurrency(formData: FormData) {
  const supabase = createAdminClient()

  console.log("[v0] Adding crypto currency with data:", {
    name: formData.get("name"),
    symbol: formData.get("symbol"),
    network: formData.get("network"),
    wallet_address: formData.get("wallet_address"),
  })

  const { data, error } = await supabase
    .from("crypto_currencies")
    .insert({
      name: formData.get("name") as string,
      symbol: formData.get("symbol") as string,
      network: formData.get("network") as string,
      wallet_address: formData.get("wallet_address") as string,
      minimum_deposit: Number(formData.get("minimum_deposit")),
      is_active: formData.get("is_active") === "on",
    })
    .select()

  if (error) {
    console.error("[v0] Crypto add error:", error)
    return { success: false, error: error.message }
  }

  console.log("[v0] Crypto currency added successfully:", data)

  revalidatePath("/admin-panel-2024/crypto")
  revalidatePath("/dashboard/deposit")

  return { success: true, data }
}

export async function updateCryptoCurrency(id: string, formData: FormData) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("crypto_currencies")
    .update({
      name: formData.get("name") as string,
      symbol: formData.get("symbol") as string,
      network: formData.get("network") as string,
      wallet_address: formData.get("wallet_address") as string,
      minimum_deposit: Number(formData.get("minimum_deposit")),
      is_active: formData.get("is_active") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("[v0] Crypto update error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin-panel-2024/crypto")
  revalidatePath("/dashboard/deposit")

  return { success: true }
}

export async function deleteCryptoCurrency(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("crypto_currencies").delete().eq("id", id)

  if (error) throw error

  revalidatePath("/admin-panel-2024/crypto")
}
