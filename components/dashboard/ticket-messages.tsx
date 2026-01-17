"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDistance } from "date-fns"
import { addTicketMessage } from "@/app/actions/tickets"
import { useRouter } from "next/navigation"

export function TicketMessages({ ticketId, messages }: { ticketId: string; messages: any[] }) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await addTicketMessage(ticketId, message)

    setMessage("")
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                msg.is_admin
                  ? "bg-blue-50 border-2 border-blue-500 text-slate-900"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">{msg.is_admin ? "Support Team" : "You"}</span>
                <span className="text-xs opacity-70">
                  {formatDistance(new Date(msg.created_at), new Date(), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
        <Button type="submit" disabled={loading || !message.trim()}>
          {loading ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </div>
  )
}
