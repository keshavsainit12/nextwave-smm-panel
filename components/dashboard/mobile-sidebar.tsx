"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, Crown, Star } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, Wallet, Ticket, Gift, LogOut, Code, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Orders", href: "/dashboard/orders", icon: Package },
  { name: "Add Balance", href: "/dashboard/deposit", icon: Wallet },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Support", href: "/dashboard/tickets", icon: Ticket },
  { name: "Referrals", href: "/dashboard/referrals", icon: Gift },
  { name: "API Access", href: "/dashboard/api", icon: Code },
]

export function MobileSidebar({ user }: { user?: any }) {
  const [open, setOpen] = useState(false)
  const [userTier, setUserTier] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!user?.id) return
    
    const supabase = createClient()
    
    const fetchUserTier = async () => {
      const { data } = await supabase
        .from("users")
        .select("tier, price_multiplier, total_spent")
        .eq("id", user.id)
        .single()
      
      if (data) {
        let tierName = "Normal User"
        let tierColor = "bg-gray-500"
        let tierIcon = null
        
        if (data.price_multiplier) {
          const multiplier = data.price_multiplier
          const normalMultiplier = 3.0
          const discountPercent = ((normalMultiplier - multiplier) / normalMultiplier) * 100
          
          if (multiplier <= 2) {
            tierName = "Reseller"
            tierColor = "bg-purple-500"
            tierIcon = <Star className="h-3 w-3" />
          } else if (multiplier <= 2.5) {
            tierName = "Bulk Buyer"
            tierColor = "bg-blue-500"
            tierIcon = <Star className="h-3 w-3" />
          } else if (multiplier < 3) {
            tierName = "VIP"
            tierColor = "bg-yellow-500"
            tierIcon = <Crown className="h-3 w-3" />
          }
          
          setUserTier({
            name: tierName,
            color: tierColor,
            icon: tierIcon,
            discount: discountPercent > 0 ? discountPercent : 0
          })
        }
      }
    }

    fetchUserTier()
    
    const userChannel = supabase
      .channel("mobile-user-tier-changes")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "users",
        filter: `id=eq.${user.id}`,
      }, () => {
        fetchUserTier()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(userChannel)
    }
  }, [user?.id])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full bg-white">
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/50">
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <Image src="/logo.png" alt="NextWave SMM" width={140} height={35} className="h-7 w-auto" />
            </Link>
            {userTier && userTier.name !== "Normal User" && (
              <div className="flex flex-col items-end gap-0.5">
                <Badge className={`${userTier.color} text-white border-0 px-2 py-0.5 flex items-center gap-1 text-xs`}>
                  {userTier.icon}
                  <span className="font-bold">{userTier.name}</span>
                </Badge>
                {userTier.discount > 0 && (
                  <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-1 py-0.5 rounded">
                    {userTier.discount.toFixed(0)}% OFF
                  </span>
                )}
              </div>
            )}
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-slate-200/50 p-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
