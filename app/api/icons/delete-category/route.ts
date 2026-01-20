import { createAdminClient } from '@/lib/supabase/admin'
import { revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  try {
    const { categoryName } = await request.json()

    if (!categoryName) {
      return Response.json({ error: 'Missing categoryName' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Find the main category
    const { data: mainCategory, error: categoryError } = await supabase
      .from('service_categories')
      .select('id')
      .eq('name', categoryName)
      .single()

    if (categoryError || !mainCategory) {
      return Response.json({ error: `Category "${categoryName}" not found` }, { status: 404 })
    }

    // 2. Delete icon from the category (set to null)
    await supabase
      .from('service_categories')
      .update({ icon: null })
      .eq('id', mainCategory.id)

    // 3. Delete icon from all services under this category
    await supabase
      .from('services')
      .update({ icon: null })
      .eq('category_id', mainCategory.id)

    // 4. Also delete from any OTHER categories with the same name
    await supabase
      .from('service_categories')
      .update({ icon: null })
      .eq('name', categoryName)

    // Revalidate pages
    revalidateTag('services')
    revalidateTag('categories')
    revalidateTag('icons')

    return Response.json({
      success: true,
      message: `Deleted ${categoryName} icon from all services and categories`,
    })
  } catch (error: any) {
    console.error('[v0] Error deleting icon:', error)
    return Response.json({ error: error.message || 'Failed to delete icon' }, { status: 500 })
  }
}
