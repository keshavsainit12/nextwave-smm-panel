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
    // Test database connection
    console.log(`[SimpleBulk] Testing database connection...`)
    const supabase = await createClient()
    console.log(`[SimpleBulk] Database client created successfully`)
    
    // 1. Fetch all services
    console.log(`[SimpleBulk] Fetching all services from database...`)
    const { data: services, error: fetchError } = await supabase
      .from("services")
      .select("id, base_price")
    
    if (fetchError) {
      console.error(`[SimpleBulk] ❌ Fetch error:`, JSON.stringify(fetchError, null, 2))
      console.error(`[SimpleBulk] Error code:`, fetchError.code)
      console.error(`[SimpleBulk] Error message:`, fetchError.message)
      console.error(`[SimpleBulk] Error details:`, fetchError.details)
      return { 
        success: false, 
        error: `Failed to fetch services: ${fetchError.message}`, 
        updated: 0, 
        total: 0 
      }
    }
    
    if (!services || services.length === 0) {
      console.log(`[SimpleBulk] ⚠️ No services found in database`)
      return { success: false, error: "No services found in database", updated: 0, total: 0 }
    }
    
    console.log(`[SimpleBulk] ✅ Successfully fetched ${services.length} services`)
    console.log(`[SimpleBulk] Starting individual service updates...`)
    
    // 2. Update each service individually
    let updated = 0
    const failedServices: Array<{id: string, error: string}> = []
    
    for (let i = 0; i < services.length; i++) {
      const service = services[i]
      const currentPrice = service.base_price || 0
      const adjustment = 1 + (percentage / 100)
      const newPrice = Math.max(0.01, currentPrice * adjustment)
      
      console.log(`[SimpleBulk] [${i+1}/${services.length}] Service ${service.id}: ${currentPrice.toFixed(4)} → ${newPrice.toFixed(4)}`)
      
      // Update this service
      const { error: updateError } = await supabase
        .from("services")
        .update({ base_price: newPrice })
        .eq("id", service.id)
      
      if (updateError) {
        console.error(`[SimpleBulk] ❌ Failed to update service ${service.id}:`)
        console.error(`[SimpleBulk]    Error code:`, updateError.code)
        console.error(`[SimpleBulk]    Error message:`, updateError.message)
        console.error(`[SimpleBulk]    Error details:`, JSON.stringify(updateError, null, 2))
        failedServices.push({id: service.id, error: updateError.message})
      } else {
        updated++
        console.log(`[SimpleBulk] ✓ Successfully updated service ${service.id}`)
      }
    }
    
    console.log(`[SimpleBulk] ===== UPDATE SUMMARY =====`)
    console.log(`[SimpleBulk] Total services: ${services.length}`)
    console.log(`[SimpleBulk] Successfully updated: ${updated}`)
    console.log(`[SimpleBulk] Failed: ${failedServices.length}`)
    
    if (failedServices.length > 0) {
      console.error(`[SimpleBulk] ❌ Failed services details:`, JSON.stringify(failedServices, null, 2))
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
      failed: failedServices.length,
      failedDetails: failedServices
    }
    
  } catch (error) {
    console.error(`[SimpleBulk] ❌❌❌ EXCEPTION CAUGHT ❌❌❌`)
    console.error(`[SimpleBulk] Exception type:`, error instanceof Error ? 'Error' : typeof error)
    console.error(`[SimpleBulk] Exception message:`, error instanceof Error ? error.message : String(error))
    console.error(`[SimpleBulk] Exception stack:`, error instanceof Error ? error.stack : 'N/A')
    console.error(`[SimpleBulk] Exception object:`, JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      updated: 0,
      total: 0
    }
  }
}
