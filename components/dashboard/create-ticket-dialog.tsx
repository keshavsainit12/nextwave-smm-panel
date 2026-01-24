"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createTicket } from "@/app/actions/tickets"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function CreateTicketDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      console.log("[v0] Submitting ticket with subject:", formData.get("subject"))

      const result = await createTicket(formData)

      if (result && result.success) {
        toast.success("Ticket created successfully!")
        setOpen(false)
        if (formRef.current) {
          formRef.current.reset()
        }
        router.refresh()
      } else {
        toast.error("Failed to create ticket. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Ticket creation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create ticket. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-full max-w-[95vw] overflow-y-auto sm:max-w-[550px] bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200/50 shadow-xl">
        <DialogHeader className="border-b border-slate-200/50 pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Support Ticket
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 mt-2">
            Describe your issue and we'll help you resolve it quickly
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-semibold text-slate-700">Subject *</Label>
            <Input 
              id="subject" 
              name="subject" 
              placeholder="Brief description of your issue" 
              required 
              className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-semibold text-slate-700">Priority</Label>
            <Select name="priority" defaultValue="normal">
              <SelectTrigger className="h-11 bg-white border-slate-200 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="normal">Normal Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-semibold text-slate-700">Message *</Label>
            <Textarea 
              id="message" 
              name="message" 
              rows={5} 
              placeholder="Detailed description of your issue..." 
              required 
              className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
