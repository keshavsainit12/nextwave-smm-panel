'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { updateServiceIcon, updateCategoryIcon } from '@/app/actions/icons'
import { Loader2, Plus, Trash2, RefreshCw } from 'lucide-react'

export default function IconManagerPage() {
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedService, setSelectedService] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [serviceIconUrl, setServiceIconUrl] = useState('')
  const [categoryIconUrl, setCategoryIconUrl] = useState('')
  const router = useRouter()

  // Load data on mount
  useState(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await fetch('/api/icons/list')
      const data = await response.json()
      setServices(data.services || [])
      setCategories(data.categories || [])
    } catch (error) {
      console.error('[v0] Failed to load icon data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateServiceIcon = async () => {
    if (!selectedService || !serviceIconUrl) {
      toast.error('Please select a service and provide a URL')
      return
    }

    setUpdating(true)
    try {
      await updateServiceIcon(selectedService, serviceIconUrl)
      toast.success('Service icon updated!')
      setServiceIconUrl('')
      setSelectedService('')
      router.refresh()
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update icon')
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateCategoryIcon = async () => {
    if (!selectedCategory || !categoryIconUrl) {
      toast.error('Please select a category and provide a URL')
      return
    }

    setUpdating(true)
    try {
      await updateCategoryIcon(selectedCategory, categoryIconUrl)
      toast.success('Category icon updated!')
      setCategoryIconUrl('')
      setSelectedCategory('')
      router.refresh()
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update icon')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteServiceIcon = async (id: string) => {
    setUpdating(true)
    try {
      await updateServiceIcon(id, '')
      toast.success('Service icon removed!')
      router.refresh()
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove icon')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteCategoryIcon = async (id: string) => {
    setUpdating(true)
    try {
      await updateCategoryIcon(id, '')
      toast.success('Category icon removed!')
      router.refresh()
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove icon')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold">Icon Manager</h1>
        <p className="text-muted-foreground mt-2">Add, update, or remove icons for services and categories</p>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList>
          <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
          <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
          <TabsTrigger value="guide">How to Use</TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Update Service Icon</CardTitle>
              <CardDescription>Select a service and provide a new icon URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Service</Label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">Choose a service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.icon ? '✓' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Icon URL</Label>
                <Input
                  placeholder="/images/image-1.jpg"
                  value={serviceIconUrl}
                  onChange={(e) => setServiceIconUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Paste your Blob CDN URL here</p>
              </div>

              {serviceIconUrl && (
                <div className="p-3 bg-gray-100 rounded-lg border flex items-center justify-center h-24">
                  <img
                    src={serviceIconUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="h-16 w-16 object-contain"
                    onError={() => toast.error('Invalid image URL')}
                  />
                </div>
              )}

              <Button onClick={handleUpdateServiceIcon} disabled={updating} className="w-full gap-2">
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Update Icon
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Services List */}
          <Card>
            <CardHeader>
              <CardTitle>All Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {service.icon && (
                      <img
                        src={service.icon || "/placeholder.svg"}
                        alt={service.name}
                        className="h-8 w-8 rounded object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {service.icon ? 'Icon: ' + service.icon.substring(0, 40) + '...' : 'No icon'}
                      </p>
                    </div>
                  </div>
                  {service.icon && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteServiceIcon(service.id)}
                      disabled={updating}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Update Category Icon</CardTitle>
              <CardDescription>Select a category and provide a new icon URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Category</Label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">Choose a category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.icon ? '✓' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Icon URL</Label>
                <Input
                  placeholder="/images/image-2.jpg"
                  value={categoryIconUrl}
                  onChange={(e) => setCategoryIconUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Paste your Blob CDN URL here</p>
              </div>

              {categoryIconUrl && (
                <div className="p-3 bg-gray-100 rounded-lg border flex items-center justify-center h-24">
                  <img
                    src={categoryIconUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="h-16 w-16 object-contain"
                    onError={() => toast.error('Invalid image URL')}
                  />
                </div>
              )}

              <Button onClick={handleUpdateCategoryIcon} disabled={updating} className="w-full gap-2">
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Update Icon
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Categories List */}
          <Card>
            <CardHeader>
              <CardTitle>All Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {category.icon && (
                      <img
                        src={category.icon || "/placeholder.svg"}
                        alt={category.name}
                        className="h-8 w-8 rounded object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.icon ? 'Icon: ' + category.icon.substring(0, 40) + '...' : 'No icon'}
                      </p>
                    </div>
                  </div>
                  {category.icon && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCategoryIcon(category.id)}
                      disabled={updating}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guide Tab */}
        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>How to Change Icons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Step 1: Get a New GIF Icon</h3>
                <p className="text-sm text-muted-foreground">
                  Find or create an animated GIF file for your icon
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 2: Upload to Vercel Blob</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Go to your Vercel Dashboard → Storage → Blob → Upload the GIF file
                </p>
                <p className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
                  Copy the CDN URL (looks like: /images/image-3.jpg)
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 3: Update in Icon Manager</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go back to Services or Categories tab</li>
                  <li>Select the service/category you want to update</li>
                  <li>Paste the Blob CDN URL in the Icon URL field</li>
                  <li>Click "Update Icon" button</li>
                  <li>Done! Icon will update everywhere in your app</li>
                </ol>
              </div>

              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="text-sm font-semibold text-green-900">Pro Tips:</p>
                <ul className="text-xs text-green-800 mt-2 space-y-1">
                  <li>✓ Icons automatically update on all pages</li>
                  <li>✓ You can change icons anytime without code changes</li>
                  <li>✓ Use the preview to check before saving</li>
                  <li>✓ Delete icons by clicking the trash icon</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
