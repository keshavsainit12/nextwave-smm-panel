"use client"

import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { displayAmount } from "@/lib/currency"

interface DesktopOrdersTableProps {
  orders: any[]
  currency: string
  currencySymbol: string
}

export function DesktopOrdersTable({ orders, currency, currencySymbol }: DesktopOrdersTableProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground">View and manage your order history</p>
      </div>

      {/* Desktop order table with all order details */}
      {orders && orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Order ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Service</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Quantity</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Link</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any, idx: number) => (
                <tr
                  key={order.id || idx}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400 truncate max-w-xs">
                    {order.id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {order.services?.icon && (
                        <img src={order.services.icon} alt="service" className="w-5 h-5 rounded" />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">{order.services?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.quantity}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-xs">{order.link}</td>
                  <td className="px-4 py-3">
                    <Badge className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status || "Pending"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    {displayAmount(order.price, currency)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {order.created_at ? format(new Date(order.created_at), "MMM dd, yyyy") : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}
    </div>
  )
}
