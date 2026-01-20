"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2, Plus, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { updateServiceIcon, updateCategoryIcon } from "@/app/actions/icons"

export function IconUploadDialog({
  type = "service",
  itemId,
  itemName,
  items,
  onClose,
}: {
  type?: "service" | "category"
  itemId?: string
  itemName?: string
  items: { id: string; name: string }[]
  onClose: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(itemId || "default")
  const [iconUrl, setIconUrl] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem || !iconUrl) {
      toast.error("Please select an item and provide an icon URL")
      return
    }

    setLoading(true)
    try {
      if (type === "service") {
        await updateServiceIcon(selectedItem, iconUrl)
      } else {
        await updateCategoryIcon(selectedItem, iconUrl)
      }

      toast.success("Icon updated successfully!")
      setSelectedItem("")
      setIconUrl("")
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to update icon")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Upload Icon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Upload {type === "service" ? "Service" : "Category"} Icon
          </DialogTitle>
          <DialogDescription>
            Add animated GIF icons to {type === "service" ? "services" : "categories"}. Upload GIFs to Vercel Blob first, then paste the URL here.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item">
              Select {type === "service" ? "Service" : "Category"}
            </Label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger>
                <SelectValue placeholder={`Choose a ${type}...`} />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">GIF Icon URL</Label>
            <Input
              id="url"
              placeholder="https://blob.vercel-storage.com/..."
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Paste the URL from Vercel Blob (or any CDN). Recommended size: 100x100px or 200x200px for best quality.
            </p>
          </div>

          {iconUrl && (
            <div className="p-4 bg-muted rounded-lg flex items-center justify-center">
              <img
                src={iconUrl || "/placeholder.svg"}
                alt="Icon preview"
                className="h-20 w-20 rounded-lg object-contain"
                onError={() => toast.error("Failed to load preview image")}
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Update Icon
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
