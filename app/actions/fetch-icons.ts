'use server'

import { createAdminClient } from "@/lib/supabase/admin"

export async function fetchIconsData() {
  const supabase = createAdminClient()

  const [{ data: servicesData }, { data: categoriesData }] = await Promise.all([
    supabase.from("services").select("id, name, icon, service_categories(name)"),
    supabase.from("service_categories").select("id, name, icon"),
  ])

  return {
    services: servicesData || [],
    categories: categoriesData || [],
  }
}
