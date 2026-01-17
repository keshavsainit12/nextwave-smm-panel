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
    <div className="space-y-6 pt-16 lg:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/70 backdrop-blur-sm rounded-lg p-6 shadow-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Users Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage user accounts, balances, and permissions</p>
        </div>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Users ({users?.length || 0})</CardTitle>
              <CardDescription>View and manage all registered user accounts</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UserList users={users || []} />
        </CardContent>
      </Card>
    </div>
  )
}
