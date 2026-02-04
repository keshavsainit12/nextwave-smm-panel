"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * NEW Simple Bulk Pricing System
 * Updates services one by one for reliability
 */
export async function simpleBulkPricing(percentage: number) {
  console.log(`[SimpleBulk] ===== START: ${percentage}% adjustment =====`)
  
  try {
    const supabase = await createClient()
    
    // 1. Fetch all services
    console.log(`[SimpleBulk] Fetching all services...`)
    const { data: services, error: fetchError } = await supabase
      .from("services")
      .select("id, base_price")
    
    if (fetchError) {
      console.error(`[SimpleBulk] Fetch error:`, fetchError)
      return { success: false, error: "Failed to fetch services", updated: 0, total: 0 }
    }
    
    if (!services || services.length === 0) {
      console.log(`[SimpleBulk] No services found`)
      return { success: false, error: "No services found", updated: 0, total: 0 }
    }
    
    console.log(`[SimpleBulk] Found ${services.length} services`)
    
    // 2. Update each service individually
    let updated = 0
    const errors: string[] = []
    
    for (const service of services) {
      const currentPrice = service.base_price || 0
      const adjustment = 1 + (percentage / 100)
      const newPrice = Math.max(0.01, currentPrice * adjustment)
      
      console.log(`[SimpleBulk] Service ${service.id}: ${currentPrice} → ${newPrice}`)
      
      // Update this service
      const { error: updateError } = await supabase
        .from("services")
        .update({ base_price: newPrice })
        .eq("id", service.id)
      
      if (updateError) {
        console.error(`[SimpleBulk] Failed to update ${service.id}:`, updateError)
        errors.push(service.id)
      } else {
        updated++
        console.log(`[SimpleBulk] ✓ Updated ${service.id}`)
      }
    }
    
    console.log(`[SimpleBulk] Updated ${updated}/${services.length} services`)
    
    if (errors.length > 0) {
      console.error(`[SimpleBulk] Failed services:`, errors)
    }
    
    // 3. Revalidate all paths
    console.log(`[SimpleBulk] Revalidating paths...`)
    revalidatePath("/admin-panel-2024/services")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/new-order")
    revalidatePath("/")
    
    console.log(`[SimpleBulk] ===== END: Success =====`)
    
    return {
      success: true,
      updated,
      total: services.length,
      failed: errors.length
    }
    
  } catch (error) {
    console.error(`[SimpleBulk] EXCEPTION:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      updated: 0,
      total: 0
    }
  }
}
