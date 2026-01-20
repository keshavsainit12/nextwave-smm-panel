import { createAdminClient } from '@/lib/supabase/admin'
import { revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  try {
    const { categoryName, iconUrl } = await request.json()

    if (!categoryName || !iconUrl) {
      return Response.json({ error: 'Missing categoryName or iconUrl' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Find the main category by name
    const { data: mainCategory, error: categoryError } = await supabase
      .from('service_categories')
      .select('id')
      .eq('name', categoryName)
      .single()

    if (categoryError || !mainCategory) {
      return Response.json({ error: `Category "${categoryName}" not found` }, { status: 404 })
    }

    // 2. Update the main category icon
    await supabase
      .from('service_categories')
      .update({ icon: iconUrl })
      .eq('id', mainCategory.id)

    // 3. Update all services under this category with the same icon
    await supabase
      .from('services')
      .update({ icon: iconUrl })
      .eq('category_id', mainCategory.id)

    // 4. Also update any OTHER categories with the same name (in case there are duplicates)
    await supabase
      .from('service_categories')
      .update({ icon: iconUrl })
      .eq('name', categoryName)

    // Revalidate pages to show updated icons
    revalidateTag('services')
    revalidateTag('categories')
    revalidateTag('icons')

    return Response.json({
      success: true,
      message: `Updated ${categoryName} icon for all services and categories`,
    })
  } catch (error: any) {
    console.error('[v0] Error updating icon:', error)
    return Response.json({ error: error.message || 'Failed to update icon' }, { status: 500 })
  }
}
