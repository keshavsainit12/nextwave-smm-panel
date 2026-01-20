'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Upload, Trash2, RefreshCw } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

export default function IconManagerPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [urls, setUrls] = useState<Record<string, string>>({})

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name, icon, display_order')
        .order('display_order', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error: any) {
      console.error('[v0] Error loading categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  async function updateCategoryIcon(categoryId: string, iconUrl: string) {
    if (!iconUrl.trim()) {
      toast.error('Please enter a URL')
      return
    }

    setUpdating(categoryId)
    try {
      // 1. Update category icon
      const { error: categoryError } = await supabase
        .from('service_categories')
        .update({ icon: iconUrl })
        .eq('id', categoryId)

      if (categoryError) throw categoryError

      // 2. Automatically update all services in this category with the same icon
      const { error: servicesError } = await supabase
        .from('services')
        .update({ icon: iconUrl })
        .eq('category_id', categoryId)

      if (servicesError) throw servicesError

      toast.success('Icon updated! All services in this category now have the new icon.')
      
      // Refresh categories and clear input
      await loadCategories()
      setUrls(prev => ({ ...prev, [categoryId]: '' }))
    } catch (error: any) {
      console.error('[v0] Error updating icon:', error)
      toast.error(error.message || 'Failed to update icon')
    } finally {
      setUpdating(null)
    }
  }

  async function deleteIcon(categoryId: string) {
    setUpdating(categoryId)
    try {
      // 1. Remove category icon
      const { error: categoryError } = await supabase
        .from('service_categories')
        .update({ icon: null })
        .eq('id', categoryId)

      if (categoryError) throw categoryError

      // 2. Remove icons from all services in this category
      const { error: servicesError } = await supabase
        .from('services')
        .update({ icon: null })
        .eq('category_id', categoryId)

      if (servicesError) throw servicesError

      toast.success('Icon deleted from category and all related services!')
      await loadCategories()
    } catch (error: any) {
      console.error('[v0] Error deleting icon:', error)
      toast.error(error.message || 'Failed to delete icon')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold">Icon Manager</h1>
        <p className="text-gray-600 mt-2">
          Update category icons. All services in the category will automatically get the same icon.
        </p>
      </div>

      <div className="grid gap-4">
        {categories && categories.length > 0 ? (
          categories.map(category => (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {category.icon && (
                      <div className="p-3 bg-muted rounded-lg">
                        <img
                          src={category.icon || "/placeholder.svg"}
                          alt={category.name}
                          className="h-10 w-10 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                      {category.icon ? (
                        <Badge className="mt-2 bg-green-100 text-green-700">✓ Icon Set</Badge>
                      ) : (
                        <Badge variant="secondary" className="mt-2">No Icon</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`url-${category.id}`}>GIF URL from Vercel Blob</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`url-${category.id}`}
                      placeholder="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icons8-instagram-Y6Ka1ocAALzf5J8Hu64Toiy50JdPFd.gif"
                      value={urls[category.id] || ''}
                      onChange={(e) => setUrls(prev => ({ ...prev, [category.id]: e.target.value }))}
                      disabled={updating === category.id}
                    />
                    <Button
                      onClick={() => updateCategoryIcon(category.id, urls[category.id] || '')}
                      disabled={updating === category.id || !urls[category.id]?.trim()}
                      className="gap-2"
                    >
                      {updating === category.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Update Icon
                        </>
                      )}
                    </Button>
                    {category.icon && (
                      <Button
                        variant="destructive"
                        onClick={() => deleteIcon(category.id)}
                        disabled={updating === category.id}
                        className="gap-2"
                      >
                        {updating === category.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {urls[category.id] && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="p-4 bg-muted rounded-lg flex items-center justify-center h-24">
                      <img
                        src={urls[category.id] || "/placeholder.svg"}
                        alt="Preview"
                        className="h-16 w-16 object-contain"
                        onError={() => toast.error('Invalid image URL')}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No categories found
          </div>
        )}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold mb-1">1. Upload GIF to Vercel Blob</p>
            <p className="text-muted-foreground">Upload your animated GIF and copy its CDN URL</p>
          </div>
          <div>
            <p className="font-semibold mb-1">2. Paste URL Here</p>
            <p className="text-muted-foreground">Paste the Blob URL in the input field above</p>
          </div>
          <div>
            <p className="font-semibold mb-1">3. Click Update Icon</p>
            <p className="text-muted-foreground">The category icon and ALL services in this category get updated automatically</p>
          </div>
          <div>
            <p className="font-semibold mb-1">4. Users See It Instantly</p>
            <p className="text-muted-foreground">Icons appear in service cards, tabs, dropdowns, and orders immediately</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
