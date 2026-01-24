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
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">No messages yet. Send a message to get support!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[80%] rounded-xl p-4 ${
                  msg.is_admin
                    ? "bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200 text-slate-900"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold">{msg.is_admin ? "Support Team" : "You"}</span>
                  <span className={`text-xs ${msg.is_admin ? "text-slate-500" : "text-white/70"}`}>
                    {formatDistance(new Date(msg.created_at), new Date(), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{msg.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 border-t border-slate-200 pt-4">
        <Textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
        />
        <Button 
          type="submit" 
          disabled={loading || !message.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </div>
  )
}
