"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Upload, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { updateServiceIcon, updateCategoryIcon } from "@/app/actions/icons"

interface IconUploadDialogProps {
  type: "service" | "category"
  itemId: string
  itemName: string
}

export function IconUploadDialog({ type, itemId, itemName }: IconUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [iconUrl, setIconUrl] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!itemId || !iconUrl.trim()) {
      toast.error("Please provide an icon URL")
      return
    }

    setLoading(true)
    try {
      if (type === "service") {
        await updateServiceIcon(itemId, iconUrl.trim())
      } else {
        await updateCategoryIcon(itemId, iconUrl.trim())
      }

      toast.success("Icon updated successfully!")
      setIconUrl("")
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      console.error("[v0] Icon upload error:", error)
      toast.error(error.message || "Failed to update icon")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2 bg-transparent">
          <Plus className="h-4 w-4" />
          Upload Icon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Icon</DialogTitle>
          <DialogDescription>Paste an animated GIF URL for {itemName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>
              {type === "service" ? "Service" : "Category"}
            </Label>
            <div className="p-3 bg-muted rounded-lg border">
              <p className="font-medium">{itemName}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon-url">GIF Icon URL</Label>
            <Input
              id="icon-url"
              placeholder="https://blob.vercel-storage.com/..."
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Upload your GIF to Vercel Blob storage first, then paste the CDN URL here
            </p>
          </div>

          {iconUrl.trim() && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-3 bg-muted rounded-lg border flex items-center justify-center h-24">
                <img
                  src={iconUrl || "/placeholder.svg"}
                  alt="Icon preview"
                  className="h-16 w-16 object-contain"
                  onError={() => {
                    console.log("[v0] Invalid image URL")
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                setIconUrl("")
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !itemId} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Icon
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
