import { createAdminClient } from '@/lib/supabase/admin'
import { revalidateTag, revalidatePath } from 'next/cache'

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
    const { error: updateCategoryError } = await supabase
      .from('service_categories')
      .update({ icon: null })
      .eq('id', mainCategory.id)

    if (updateCategoryError) {
      console.error('[v0] Category icon delete error:', updateCategoryError)
      throw new Error('Failed to delete category icon')
    }

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

    // Revalidate all relevant pages
    revalidateTag('services')
    revalidateTag('categories')
    revalidateTag('icons')
    
    // Revalidate specific paths
    revalidatePath('/admin-panel-2024/icon-manager')
    revalidatePath('/admin-panel-2024/manage-icons')
    revalidatePath('/admin-panel-2024/services')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/new-order')

    console.log(`[v0] Successfully deleted ${categoryName} icon`)

    return Response.json({
      success: true,
      message: `Deleted ${categoryName} icon from all services and categories`,
    })
  } catch (error: any) {
    console.error('[v0] Error deleting icon:', error)
    return Response.json({ error: error.message || 'Failed to delete icon' }, { status: 500 })
  }
}
