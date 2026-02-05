"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistance } from "date-fns"
import { useCurrency } from "@/lib/currency-context"

interface AdminTransactionTableProps {
  orders: any[]
}

export function AdminTransactionTable({ orders }: AdminTransactionTableProps) {
  const { displayAmount } = useCurrency()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Profit</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const revenue = Number(order.price || 0)
          const providerPrice = Number((order.services as any)?.provider_price || 0)
          const quantity = Number(order.quantity || 0)
          const cost = providerPrice > 0 ? (quantity / 1000) * providerPrice : 0
          const profit = revenue - cost

          return (
            <TableRow key={order.id}>
              <TableCell>
                <div className="text-sm font-medium">{(order.users as any)?.full_name || (order.users as any)?.email}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{(order.services as any)?.name || "N/A"}</div>
                <div className="text-xs text-muted-foreground">{(order.services as any)?.category}</div>
              </TableCell>
              <TableCell className="text-sm">{quantity.toLocaleString()}</TableCell>
              <TableCell className="font-semibold text-green-600">{displayAmount(revenue)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{displayAmount(cost)}</TableCell>
              <TableCell className={`font-semibold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {displayAmount(profit)}
              </TableCell>
              <TableCell>
                <Badge variant="default">{order.status}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistance(new Date(order.created_at), new Date(), { addSuffix: true })}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

interface AdminDepositTableProps {
  deposits: any[]
  type: "crypto" | "instant"
}

export function AdminDepositTable({ deposits, type }: AdminDepositTableProps) {
  const { displayAmount } = useCurrency()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>{type === "crypto" ? "Currency" : "Method"}</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deposits.map((deposit) => (
          <TableRow key={deposit.id}>
            <TableCell>
              <div className="text-sm font-medium">
                {(deposit.users as any)?.full_name || (deposit.users as any)?.email}
              </div>
            </TableCell>
            <TableCell>
              {type === "crypto" ? (
                <div className="text-sm">
                  {(deposit.crypto_currency_id as any)?.symbol} - {(deposit.crypto_currency_id as any)?.name}
                </div>
              ) : (
                <div className="text-sm">{deposit.payment_method || "Instant XAF"}</div>
              )}
            </TableCell>
            <TableCell className="font-semibold text-green-600">{displayAmount(Number(deposit.amount || 0))}</TableCell>
            <TableCell>
              <Badge variant="default">{deposit.status}</Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDistance(new Date(deposit.created_at), new Date(), { addSuffix: true })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
