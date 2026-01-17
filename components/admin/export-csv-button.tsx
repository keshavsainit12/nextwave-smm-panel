"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function ExportCsvButton({ data, filename }: { data: any[]; filename: string }) {
  const handleExport = () => {
    if (!data || data.length === 0) return

    // Get headers from first object
    const headers = Object.keys(data[0])
    const csvHeaders = headers.join(",")

    // Convert data to CSV rows
    const csvRows = data.map((row) => headers.map((header) => JSON.stringify(row[header] || "")).join(","))

    // Combine headers and rows
    const csvContent = [csvHeaders, ...csvRows].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  )
}
