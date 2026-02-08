"use client"

import React from "react"

export function SyncOrdersButton() {
  async function handleSyncOrders() {
    try {
      const res = await fetch("/api/cron/sync-orders", { method: "POST" })
      if (res.ok) {
        window.location.reload()
      } else {
        // eslint-disable-next-line no-console
        console.error("Sync failed", await res.text())
        alert("Sync failed")
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Sync error", e)
      alert("Sync error")
    }
  }

  return (
    <button
      type="button"
      className="inline-flex items-center px-3 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-xs sm:text-sm font-medium"
      onClick={handleSyncOrders}
    >
      Sync Orders
    </button>
  )
}
