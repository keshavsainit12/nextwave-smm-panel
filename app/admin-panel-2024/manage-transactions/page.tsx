import { AdminTransactionManager } from "@/components/admin/transaction-manager"

export const metadata = {
  title: "Manage Transactions | Admin Panel",
  description: "Search, view, update, and manage user transactions",
}

export default function ManageTransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Transactions</h1>
        <p className="text-muted-foreground">Search for users and manage their transactions, update status, or delete with automatic refunds</p>
      </div>
      <AdminTransactionManager />
    </div>
  )
}
