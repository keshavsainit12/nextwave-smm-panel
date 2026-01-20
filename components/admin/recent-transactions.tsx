"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDistance } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("transactions")
        .select("*, users(email, full_name)")
        .order("created_at", { ascending: false })
        .limit(10)

      setTransactions(data || [])
      setLoading(false)
    }

    fetchTransactions()

    // Set up real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel("recent-transactions")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => {
        fetchTransactions()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest transaction activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest transaction activity (live)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No transactions yet</div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{tx.users?.full_name || tx.users?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.type === "deposit" ? "Deposit" : "Order"} • {tx.payment_method || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistance(new Date(tx.created_at), new Date(), { addSuffix: true })}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className={`font-semibold text-sm font-mono ${tx.type === "deposit" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "deposit" ? "+" : "-"}${Math.abs(Number(tx.amount)).toFixed(2)}
                  </p>
                  <Badge
                    variant={
                      tx.status === "completed"
                        ? "default"
                        : tx.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
