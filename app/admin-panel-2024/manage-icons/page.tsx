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
        const result = await updateServiceIcon(editingId!, editingUrl.trim())
        toast.success(result.message || 'Service icon updated successfully!')
      } else {
        const result = await updateCategoryIcon(editingId!, editingUrl.trim())
        toast.success(result.message || 'Category icon updated successfully!')
      }
      
      // Clear editing state
      setEditingId(null)
      setEditingType(null)
      setEditingUrl('')
      
      // Refresh data to show updated icon
      await loadData()
      router.refresh()
    } catch (error: any) {
      console.error('[v0] Error saving icon:', error)
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
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Icons</h1>
        <p className="text-gray-600 mt-2">Add animated GIF icons to your services and categories</p>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Animated icons for service categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No categories found</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 flex-1">
                  {cat.icon && (
                    <img
                      src={cat.icon || "/placeholder.svg"}
                      alt={cat.name}
                      className="h-10 w-10 rounded object-contain bg-white p-1"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.icon ? '✓ Icon exists' : '⚠ No icon'}</p>
                  </div>
                </div>
                <Button
                  size="sm"
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
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>Animated icons for individual services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
          {services.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No services found</p>
          ) : (
            services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {service.icon && (
                    <img
                      src={service.icon || "/placeholder.svg"}
                      alt={service.name}
                      className="h-10 w-10 rounded object-contain bg-white p-1 flex-shrink-0"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.icon ? '✓ Icon exists' : '⚠ No icon'}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingId(service.id)
                    setEditingType('service')
                    setEditingUrl(service.icon || '')
                  }}
                  className="flex-shrink-0"
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
        <Card className="border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle>Upload Icon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>GIF URL</Label>
              <Input
                placeholder="https://blob.vercel-storage.com/..."
                value={editingUrl}
                onChange={(e) => setEditingUrl(e.target.value)}
                className="mt-1"
              />
            </div>
            {editingUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="flex items-center justify-center h-20 bg-white rounded border">
                  <img
                    src={editingUrl || "/placeholder.svg"}
                    alt="preview"
                    className="h-16 w-16 object-contain"
                    onError={() => toast.error('Invalid image URL')}
                  />
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null)
                  setEditingType(null)
                  setEditingUrl('')
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveIcon} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Icon'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Link href="/admin-panel-2024">
        <Button variant="outline">← Back to Admin</Button>
      </Link>
    </div>
  )
}
