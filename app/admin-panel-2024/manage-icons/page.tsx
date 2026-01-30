'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { updateServiceIcon, updateCategoryIcon } from '@/app/actions/icons'
import Link from 'next/link'

export default function ManageIconsPage() {
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingType, setEditingType] = useState<'service' | 'category' | null>(null)
  const [editingUrl, setEditingUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const response = await fetch('/api/icons/list')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setServices(data.services || [])
      setCategories(data.categories || [])
    } catch (error) {
      console.error('[v0] Error loading icons:', error)
      toast.error('Failed to load icons')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveIcon = async () => {
    if (!editingUrl.trim()) {
      toast.error('Please enter a URL')
      return
    }

    setSubmitting(true)
    try {
      if (editingType === 'service') {
        await updateServiceIcon(editingId!, editingUrl.trim())
      } else {
        await updateCategoryIcon(editingId!, editingUrl.trim())
      }
      toast.success('Icon updated successfully!')
      setEditingId(null)
      setEditingType(null)
      setEditingUrl('')
      router.refresh()
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update icon')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Manage Icons</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Add animated GIF icons to your services and categories</p>
      </div>

      {/* Categories */}
      <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-lg sm:text-xl">Categories</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Animated icons for service categories</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 space-y-3">
          {categories.length === 0 ? (
            <p className="text-xs sm:text-sm text-muted-foreground text-center py-6">No categories found</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {cat.icon && (
                    <img
                      src={cat.icon || "/placeholder.svg"}
                      alt={cat.name}
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded object-contain bg-white p-1 flex-shrink-0"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.icon ? '✓ Icon exists' : '⚠ No icon'}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="flex-shrink-0 text-xs sm:text-sm"
                  onClick={() => {
                    setEditingId(cat.id)
                    setEditingType('category')
                    setEditingUrl(cat.icon || '')
                  }}
                >
                  Upload
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Services */}
      <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-lg sm:text-xl">Services</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Animated icons for individual services</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 space-y-3 max-h-[600px] overflow-y-auto">
          {services.length === 0 ? (
            <p className="text-xs sm:text-sm text-muted-foreground text-center py-6">No services found</p>
          ) : (
            services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {service.icon && (
                    <img
                      src={service.icon || "/placeholder.svg"}
                      alt={service.name}
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded object-contain bg-white p-1 flex-shrink-0"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.icon ? '✓ Icon exists' : '⚠ No icon'}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="flex-shrink-0 text-xs sm:text-sm"
                  onClick={() => {
                    setEditingId(service.id)
                    setEditingType('service')
                    setEditingUrl(service.icon || '')
                  }}
                >
                  Upload
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingId && (
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-lg sm:text-xl">Upload Icon</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 space-y-4">
            <div>
              <Label className="text-xs sm:text-sm">GIF URL</Label>
              <Input
                placeholder="https://blob.vercel-storage.com/..."
                value={editingUrl}
                onChange={(e) => setEditingUrl(e.target.value)}
                className="mt-1 text-xs sm:text-sm"
              />
            </div>
            {editingUrl && (
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Preview</Label>
                <div className="flex items-center justify-center h-16 sm:h-20 bg-white rounded border">
                  <img
                    src={editingUrl || "/placeholder.svg"}
                    alt="preview"
                    className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
                    onError={() => toast.error('Invalid image URL')}
                  />
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-xs sm:text-sm"
                onClick={() => {
                  setEditingId(null)
                  setEditingType(null)
                  setEditingUrl('')
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveIcon} disabled={submitting} className="text-xs sm:text-sm">
                {submitting ? 'Saving...' : 'Save Icon'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Link href="/admin-panel-2024">
        <Button variant="outline" className="text-xs sm:text-sm">← Back to Admin</Button>
      </Link>
    </div>
  )
}
