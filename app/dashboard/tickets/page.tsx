import { createClient } from "@/lib/supabase/server"
import { TicketList } from "@/components/dashboard/ticket-list"
import { CreateTicketDialog } from "@/components/dashboard/create-ticket-dialog"

export default async function TicketsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-[#f6f6f8] p-4 pb-24 font-['Public_Sans']">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#111318]">Support Tickets</h1>
              <p className="text-sm text-[#616f89] mt-1">Get help from our support team</p>
            </div>
            <CreateTicketDialog />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#dbdfe6] shadow-sm p-5">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#111318]">My Tickets</h2>
            <p className="text-sm text-[#616f89]">View and manage your support tickets</p>
          </div>
          <TicketList tickets={tickets || []} />
        </div>
      </div>
    </div>
  )
}
