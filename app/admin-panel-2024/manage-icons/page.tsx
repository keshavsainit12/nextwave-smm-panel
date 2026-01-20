'use client';

import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconUploadDialog } from "@/components/admin/icon-upload-dialog"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function ManageIconsPage() {
  const supabase = createAdminClient()

  const [{ data: services }, { data: categories }] = await Promise.all([
    supabase.from("services").select("id, name, icon, service_categories(name)"),
    supabase.from("service_categories").select("id, name, icon"),
  ])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Icons</h1>
        <p className="text-gray-600 mt-2">Add animated GIF icons to your services and categories</p>
      </div>

      <div className="grid gap-6">
        {/* Category Icons */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Category Icons</CardTitle>
                <CardDescription>Animated icons displayed in category tabs and dropdowns</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories && categories.length > 0 ? (
              <div className="grid gap-3">
                {categories.map((cat: any) => (
                  <div key={cat.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {cat.icon && (
                        <img
                          src={cat.icon || "/placeholder.svg"}
                          alt={cat.name}
                          className="h-12 w-12 rounded-lg object-contain bg-white p-1"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      )}
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        {cat.icon ? (
                          <p className="text-xs text-green-600 font-medium">✓ Icon uploaded</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">No icon yet</p>
                        )}
                      </div>
                    </div>
                    <IconUploadDialog open={false} onClose={() => {}} type="category" items={categories} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No categories found</p>
            )}
          </CardContent>
        </Card>

        {/* Service Icons */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Service Icons</CardTitle>
                <CardDescription>Animated icons displayed next to service names and in cards</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {services && services.length > 0 ? (
              <div className="grid gap-3 max-h-[600px] overflow-y-auto">
                {services.map((service: any) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {service.icon && (
                        <img
                          src={service.icon || "/placeholder.svg"}
                          alt={service.name}
                          className="h-12 w-12 rounded-lg object-contain bg-white p-1"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      )}
                      <div>
                        <p className="font-medium truncate">{service.name}</p>
                        <p className="text-xs text-muted-foreground">{service.service_categories?.name || "Uncategorized"}</p>
                        {service.icon ? (
                          <p className="text-xs text-green-600 font-medium">✓ Icon uploaded</p>
                        ) : (
                          <p className="text-xs text-orange-600 font-medium">⚠ No icon yet</p>
                        )}
                      </div>
                    </div>
                    <IconUploadDialog open={false} onClose={() => {}} type="service" items={services} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No services found</p>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">How to Add Icons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-semibold mb-1">1. Upload GIF to Vercel Blob</p>
              <p className="text-muted-foreground">
                First, upload your animated GIF icons to Vercel Blob storage. You'll get a shareable URL.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">2. Copy the GIF URL</p>
              <p className="text-muted-foreground">
                Copy the CDN URL from Vercel Blob (looks like: https://blob.vercel-storage.com/...)
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">3. Click Upload Icon</p>
              <p className="text-muted-foreground">
                Click the upload button, select the service/category, paste the URL, and save.
              </p>
            </div>
            <div className="pt-2">
              <p className="text-xs text-blue-700 font-medium">
                💡 Recommended: Use 100x100px or 200x200px GIF files for best quality. Animated GIFs work perfectly!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Link href="/admin-panel-2024">
        <Button variant="outline">← Back to Admin</Button>
      </Link>
    </div>
  )
}
