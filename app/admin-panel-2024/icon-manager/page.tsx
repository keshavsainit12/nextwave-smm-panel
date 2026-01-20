'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Upload, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

const MAIN_CATEGORIES = [
  'Instagram',
  'TikTok',
  'Twitter',
  'Facebook',
  'YouTube',
  'Discord',
  'Telegram',
  'LinkedIn',
  'Spotify',
]

export default function IconManagerPage() {
  const [icons, setIcons] = useState<Record<string, string>>({})
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [updating, setUpdating] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load existing icons
  useEffect(() => {
    async function loadIcons() {
      try {
        const response = await fetch('/api/icons/list')
        const data = await response.json()

        const iconMap: Record<string, string> = {}
        MAIN_CATEGORIES.forEach(name => {
          const category = data.categories.find((c: any) => c.name === name)
          if (category?.icon) {
            iconMap[name] = category.icon
          }
        })

        setIcons(iconMap)
        setLoading(false)
      } catch (error) {
        console.error('[v0] Error loading icons:', error)
        toast.error('Failed to load icons')
        setLoading(false)
      }
    }

    loadIcons()
  }, [])

  const handleUpdate = async (categoryName: string) => {
    const url = urls[categoryName]
    if (!url) {
      toast.error('Please enter a URL')
      return
    }

    setUpdating(categoryName)
    try {
      const response = await fetch('/api/icons/update-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryName,
          iconUrl: url,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update icon')
      }

      // Update local state
      setIcons(prev => ({
        ...prev,
        [categoryName]: url,
      }))
      setUrls(prev => ({
        ...prev,
        [categoryName]: '',
      }))

      toast.success(`${categoryName} icon updated! All related services and categories updated automatically.`)
    } catch (error: any) {
      console.error('[v0] Error updating icon:', error)
      toast.error(error.message || 'Failed to update icon')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (categoryName: string) => {
    if (!confirm(`Delete ${categoryName} icon?`)) return

    setUpdating(categoryName)
    try {
      const response = await fetch('/api/icons/delete-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryName }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete icon')
      }

      setIcons(prev => {
        const updated = { ...prev }
        delete updated[categoryName]
        return updated
      })

      toast.success(`${categoryName} icon deleted!`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete icon')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading icons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold">Icon Manager</h1>
        <p className="text-gray-600 mt-2">Update icons for each platform. When you update an icon, it automatically applies to all services and categories under that platform.</p>
      </div>

      <div className="grid gap-4">
        {MAIN_CATEGORIES.map(categoryName => (
          <Card key={categoryName} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {icons[categoryName] && (
                    <img
                      src={icons[categoryName] || "/placeholder.svg"}
                      alt={categoryName}
                      className="h-12 w-12 rounded-lg object-contain bg-muted p-1"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  <div>
                    <CardTitle>{categoryName}</CardTitle>
                    {icons[categoryName] ? (
                      <p className="text-xs text-green-600 font-medium mt-1">✓ Icon uploaded</p>
                    ) : (
                      <p className="text-xs text-orange-600 font-medium mt-1">⚠ No icon yet</p>
                    )}
                  </div>
                </div>

                {icons[categoryName] && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(categoryName)}
                    disabled={updating === categoryName}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* URL Input */}
              <div className="space-y-2">
                <Label htmlFor={`url-${categoryName}`}>GIF URL from Vercel Blob</Label>
                <div className="flex gap-2">
                  <Input
                    id={`url-${categoryName}`}
                    placeholder="/images/icons8-instagram.gif"
                    value={urls[categoryName] || ''}
                    onChange={(e) => setUrls(prev => ({ ...prev, [categoryName]: e.target.value }))}
                    disabled={updating === categoryName}
                  />
                  <Button
                    onClick={() => handleUpdate(categoryName)}
                    disabled={updating === categoryName || !urls[categoryName]}
                    className="gap-2"
                  >
                    {updating === categoryName ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Update
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Preview */}
              {urls[categoryName] && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="p-4 bg-muted rounded-lg border flex items-center justify-center h-24">
                    <img
                      src={urls[categoryName] || "/placeholder.svg"}
                      alt="Preview"
                      className="h-16 w-16 object-contain"
                      onError={() => toast.error('Invalid image URL')}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This icon will be applied to all {categoryName} services and categories automatically.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold mb-1">1. Upload GIF to Vercel Blob</p>
            <p className="text-muted-foreground">
              First, upload your animated GIF to Vercel Blob storage and copy the URL.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">2. Paste URL Above</p>
            <p className="text-muted-foreground">
              Paste the URL for any platform (Instagram, TikTok, etc.) in the input field.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">3. Click Update</p>
            <p className="text-muted-foreground">
              The icon automatically updates for that platform and ALL its services and categories.
            </p>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs text-blue-700 font-medium">
              💡 All changes appear instantly for users. No manual work needed!
            </p>
          </div>
        </CardContent>
      </Card>

      <Link href="/admin-panel-2024">
        <Button variant="outline">← Back to Admin</Button>
      </Link>
    </div>
  )
}
