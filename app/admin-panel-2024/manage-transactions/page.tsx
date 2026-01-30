import { AdminTransactionManager } from "@/components/admin/transaction-manager"

export const metadata = {
  title: "Manage Transactions | Admin Panel",
  description: "Search, view, update, and manage user transactions",
}

export default function ManageTransactionsPage() {
  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Manage Transactions</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Search for users and manage their transactions, update status, or delete with automatic refunds</p>
      </div>
      <AdminTransactionManager />
    </div>
  )
}
