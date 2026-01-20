import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createAdminClient()

    const [{ data: services }, { data: categories }] = await Promise.all([
      supabase.from('services').select('id, name, icon, service_categories(name)'),
      supabase.from('service_categories').select('id, name, icon'),
    ])

    return NextResponse.json({
      services: services || [],
      categories: categories || [],
    })
  } catch (error) {
    console.error('[v0] Error fetching icons:', error)
    return NextResponse.json({ services: [], categories: [] }, { status: 500 })
  }
}
