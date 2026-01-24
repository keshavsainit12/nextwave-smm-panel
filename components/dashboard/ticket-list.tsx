"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { formatDistance } from "date-fns"
import Link from "next/link"

export function TicketList({ tickets }: { tickets: any[] }) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 font-medium">No tickets yet. Create one to get help!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="bg-white border border-slate-200/50 rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-200"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 mb-2 truncate">{ticket.subject}</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  className={`${
                    ticket.priority === "urgent"
                      ? "bg-red-100 text-red-700"
                      : ticket.priority === "high"
                        ? "bg-orange-100 text-orange-700"
                        : ticket.priority === "normal"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {ticket.priority?.charAt(0).toUpperCase() + ticket.priority?.slice(1)}
                </Badge>
                <Badge
                  className={`${
                    ticket.status === "open"
                      ? "bg-green-100 text-green-700"
                      : ticket.status === "closed"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1)}
                </Badge>
                <span className="text-xs text-slate-500">
                  {formatDistance(new Date(ticket.created_at), new Date(), { addSuffix: true })}
                </span>
              </div>
            </div>
            <Link href={`/dashboard/tickets/${ticket.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
