import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserList } from "@/components/admin/user-list"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default async function AdminUsersPage({ searchParams }: { searchParams: { search?: string } }) {
  const supabase = createAdminClient()

  let query = supabase.from("users").select("*").order("created_at", { ascending: false })

  if (searchParams.search) {
    query = query.or(`email.ilike.%${searchParams.search}%,full_name.ilike.%${searchParams.search}%`)
  }

  const { data: users, error } = await query

  if (error) {
    console.error("[v0] Error fetching users:", error)
  }

  console.log("[v0] Users Page - Fetched users count:", users?.length || 0)

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header Card - Mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Users
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage user accounts and permissions</p>
        </div>
      </div>

      {/* Users List Card */}
      <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl">All Users ({users?.length || 0})</CardTitle>
              <CardDescription className="text-xs sm:text-sm">View and manage all registered users</CardDescription>
            </div>
            <div className="relative w-full sm:w-64 flex-shrink-0">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 h-9 text-sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
          <UserList users={users || []} />
        </CardContent>
      </Card>
    </div>
  )
}
