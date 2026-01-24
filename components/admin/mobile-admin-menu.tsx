"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { AdminSidebar } from "./admin-sidebar"

export function MobileAdminMenu() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Menu className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <AdminSidebar />
      </SheetContent>
    </Sheet>
  )
}
