"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wallet, Plus, TrendingUp, Clock, DollarSign } from "lucide-react"
import Link from "next/link"

export function WalletModal({
  balance,
  totalSpent,
  lastTransaction,
}: {
  balance: number
  totalSpent?: number
  lastTransaction?: Date
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-2.5 sm:px-4 py-1.5 sm:py-2 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 cursor-pointer hover:scale-105">
          <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">${balance?.toFixed(2) || "0.00"}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient">My Wallet</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Balance */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-600">Current Balance</span>
            </div>
            <p className="text-4xl font-bold text-slate-900 mb-1">${balance?.toFixed(2) || "0.00"}</p>
            <p className="text-xs text-slate-500">Available to spend</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-xs text-slate-600">Total Spent</span>
              </div>
              <p className="text-xl font-bold text-slate-900">${totalSpent?.toFixed(2) || "0.00"}</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-slate-600">Last Activity</span>
              </div>
              <p className="text-xs font-semibold text-slate-900">
                {lastTransaction ? new Date(lastTransaction).toLocaleDateString() : "No activity"}
              </p>
            </div>
          </div>

          {/* Add Funds Button */}
          <Link href="/dashboard/deposit" onClick={() => setOpen(false)}>
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Funds
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
