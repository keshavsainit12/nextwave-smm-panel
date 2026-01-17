"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"

export function SyncServicesButton({ providers }: { providers: any[] }) {
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    // TODO: Implement sync logic with external API
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setSyncing(false)
  }

  return (
    <Button variant="outline" onClick={handleSync} disabled={syncing || providers.length === 0}>
      <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Syncing..." : "Sync from API"}
    </Button>
  )
}
