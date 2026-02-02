"use client"

import type React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { placeOrder } from "@/app/actions/orders"
import Link from "next/link"
import { MobileServiceCarousel } from "./mobile-service-carousel"
import { DashboardFooter } from "./dashboard-footer"
import { CouponPasteCard } from "./coupon-paste-card"
import {
  Wallet,
  ShoppingCart,
  CreditCard,
  Bell,
  CheckCircle2,
  Info,
  Star,
  PlusCircle,
  ChevronRight,
  Package,
  Sparkles,
  Loader2,
  BadgeCheck,
  TrendingUp,
  Minus,
  Plus,
  Home,
  ListOrdered,
  UserCircle,
  Crown,
} from "lucide-react"

// Tier configuration based on price_multiplier
const getTierInfo = (priceMultiplier: number | undefined | null) => {
  const multiplier = priceMultiplier ?? 3.0
  if (multiplier <= 1.5) return { name: "VIP Elite", color: "from-amber-500 to-yellow-400", textColor: "text-amber-600", bgColor: "bg-amber-100", icon: Crown, isVip: true }
  if (multiplier <= 2) return { name: "Reseller", color: "from-purple-500 to-indigo-500", textColor: "text-purple-600", bgColor: "bg-purple-100", icon: Star, isVip: true }
  if (multiplier <= 2.5) return { name: "Bulk Buyer", color: "from-blue-500 to-cyan-500", textColor: "text-blue-600", bgColor: "bg-blue-100", icon: Star, isVip: false }
  return { name: "Basic User", color: "from-slate-400 to-slate-500", textColor: "text-slate-600", bgColor: "bg-slate-100", icon: null, isVip: false }
}

// Declare getIconEmoji function or import it from the correct module
const getIconEmoji = (categoryOrService: any) => {
  // Implement getIconEmoji logic here
  return null // Placeholder return value
}

export function MobileHighTrustDashboard({
  services,
  categories,
  userBalance,
  userName,
  totalOrders,
  totalSpent,
  recentOrders,
  priceMultiplier,
}: {
  services: any[]
  categories: any[]
  userBalance: number
  userName: string
  totalOrders: number
  totalSpent: number
  recentOrders: any[]
  priceMultiplier?: number
}) {
  const tierInfo = getTierInfo(priceMultiplier)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState(1000)
  const [isBulkBuy, setIsBulkBuy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [appliedCouponDiscount, setAppliedCouponDiscount] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  const totalPrice = useMemo(() => {
    if (!selectedService) return 0
    const servicePrice = Number(selectedService.price || selectedService.base_price || 0)
    const multiplier = isBulkBuy ? 2.5 : 3.0
    const priceBeforeDiscount = (quantity / 1000) * servicePrice * multiplier
    const finalPrice = appliedCouponDiscount > 0 ? priceBeforeDiscount * (1 - appliedCouponDiscount / 100) : priceBeforeDiscount
    return finalPrice
  }, [selectedService, quantity, isBulkBuy, appliedCouponDiscount])

  const savings = useMemo(() => {
    if (!selectedService || !isBulkBuy) return 0
    const servicePrice = Number(selectedService.price || selectedService.base_price || 0)
    const regularPrice = (quantity / 1000) * servicePrice * 3.0
    const bulkPrice = (quantity / 1000) * servicePrice * 2.5
    return regularPrice - bulkPrice
  }, [selectedService, quantity, isBulkBuy])

  const categoriesWithServices = useMemo(() => {
    return categories.filter((category) => services.some((s) => s.category_id === category.id))
  }, [categories, services])

  // Platform icon mapping - PNG only (no GIFs for better performance)
  const iconMap: Record<string, string> = {
    Instagram: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-from-rawpixel-id-3344505-png-MUwyzUmruwNctIiWklZ5p3woDYRXyQ.png",
    TikTok: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/social-media-LukRdeHaWfMPqnPN0UopDTorIys0ZS.png",
    Facebook: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/facebook-6RRn4IBRaNjBYVv9LYGM6eL41qQWlW.png",
    YouTube: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/youtube%20%281%29-fnEdlaxiQiBGHtLVMsS2pDQKjwgtBu.png",
    Twitter: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/twitter-29Fes12erxMIaAdspjd7dgcWfJcwBa.png",
    Discord: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/discord-viy5WuDAnWXu9jECoyCcdiaYJjZ9l0.png",
    Telegram: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/telegram-9xtdNkV3zP6wfwWNpx57A1hNZvEqK2.png",
    LinkedIn: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/linkedin-x8OqmW2CILJ7lo8H5FhKD888W7Z6eN.png",
    Spotify: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/spotify-7ygXrRUZpZh0pQSmRoDdDCRstAA6Oa.png",
  }

  const handleCouponApplied = useCallback((couponCode: string, discount: number) => {
    if (typeof discount === 'number' && discount > 0) {
      setAppliedCouponDiscount(discount)
    }
  }, [])

  const getIconUrl = (nameOrObject: string | any): string | undefined => {
    let platformName = typeof nameOrObject === 'string' ? nameOrObject : nameOrObject?.name || ''
    
    // Extract platform name from category name (e.g., "TikTok - Recommended" -> "TikTok")
    if (platformName.includes(' - ')) {
      platformName = platformName.split(' - ')[0].trim()
    }
    
    // Try exact match in icon map
    if (iconMap[platformName]) {
      return iconMap[platformName]
    }
    
    // Try matching the start of the platform name (case-insensitive)
    for (const [key, url] of Object.entries(iconMap)) {
      if (platformName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(platformName.toLowerCase())) {
        return url
      }
    }
    
    return undefined
  }

  const filteredServices = useMemo(() => {
    if (!selectedCategory) return []
    return services.filter((s) => s.category_id === selectedCategory.id)
  }, [services, selectedCategory])

  useEffect(() => {
    if (categoriesWithServices.length > 0 && !selectedCategory) {
      const firstCategory = categoriesWithServices[0]
      setSelectedCategory(firstCategory)

      const firstService = services.find((s) => s.category_id === firstCategory.id)
      if (firstService) {
        setSelectedService(firstService)
        setQuantity(firstService.min_quantity || 1000)
      }
    }
  }, [categoriesWithServices, services, selectedCategory])

  const handleQuantityChange = (newQuantity: number) => {
    const minQty = selectedService?.min_quantity || 100
    const maxQty = selectedService?.max_quantity || 1000000
    const clampedQty = Math.min(Math.max(newQuantity, minQty), maxQty)

    setQuantity(clampedQty)

    // Auto-disable bulk if quantity drops below 10000
    if (isBulkBuy && clampedQty < 10000) {
      setIsBulkBuy(false)
    }
  }

  const handleBulkToggle = () => {
    if (!isBulkBuy) {
      // Enabling bulk - set minimum 10000
      setIsBulkBuy(true)
      if (quantity < 10000) {
        setQuantity(10000)
      }
    } else {
      // Disabling bulk - keep current quantity
      setIsBulkBuy(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedService || !link.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a service and enter a URL",
        variant: "destructive",
      })
      return
    }

    if (isBulkBuy && quantity < 10000) {
      toast({
        title: "Bulk Order Minimum",
        description: "Bulk orders require a minimum quantity of 10,000",
        variant: "destructive",
      })
      return
    }

    if (userBalance < totalPrice) {
      toast({
        title: "Insufficient Balance",
        description: `You need $${totalPrice.toFixed(2)}. Please add funds.`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const result = await placeOrder(selectedService.id, link, quantity, undefined, isBulkBuy)

      if (result.error) {
        toast({
          title: "Order Failed",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      if (result.success) {
        toast({
          title: "Order Placed Successfully!",
          description: `Order #${result.orderId?.slice(0, 8)} is being processed.`,
        })

        setLink("")
        setQuantity(selectedService.min_quantity || 1000)

        router.refresh()

        setTimeout(() => {
          router.push("/dashboard/orders")
        }, 500)
      } else {
        toast({
          title: "Unexpected Response",
          description: "Order status unclear. Please check your orders page.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 dashboard-animated-bg relative">
      {/* Animated background orbs */}
      <div className="dashboard-blur-orb absolute top-20 right-10 w-72 h-72 bg-blue-500/10 pointer-events-none"></div>
      <div className="dashboard-blur-orb absolute bottom-40 left-5 w-96 h-96 bg-purple-500/10 pointer-events-none" style={{ animationDelay: "2s" }}></div>
      <div className="relative z-10">
        {/* TopAppBar */}
        <div className="sticky top-0 z-30 flex items-center bg-white p-4 pb-3 justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-blue-500/20">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
                  alt={userName}
                  className="w-full h-full rounded-full"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 flex items-center justify-center border-2 border-white">
                <BadgeCheck className="w-3 h-3" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className={`text-xs font-semibold uppercase tracking-wider ${tierInfo.textColor}`}>{tierInfo.name}</p>
                {tierInfo.icon && <tierInfo.icon className={`w-3 h-3 ${tierInfo.textColor}`} />}
              </div>
              <h2 className="text-slate-900 text-base font-bold leading-tight tracking-tight">Welcome, {userName}</h2>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>

        <main className="max-w-md mx-auto px-3">
          {/* Mobile Service Carousel - Auto-scrolling slideshow */}
          <div className="mb-8">
            <MobileServiceCarousel
              onSelectCategory={(categoryName: string) => {
                const selectedCat = categoriesWithServices.find((c) =>
                  c.name.toLowerCase().includes(categoryName.toLowerCase())
                )
                if (selectedCat) {
                  setSelectedCategory(selectedCat)
                  const firstService = services.find((s) => s.category_id === selectedCat.id)
                  if (firstService) {
                    setSelectedService(firstService)
                    setQuantity(firstService.min_quantity || 1000)
                  }
                }
              }}
            />
          </div>

          {/* Hero Balance Card */}
          <div className="p-4 @container">
            <div className="flex flex-col items-stretch justify-start rounded-2xl shadow-lg bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <p className="text-white/80 text-sm font-medium leading-normal flex items-center gap-1">
                    Total Balance
                    <Info className="w-3.5 h-3.5" />
                  </p>
                  <p className="text-white text-3xl font-bold leading-tight tracking-tight mt-1">
                    ${userBalance.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <p className="text-xs font-bold text-white flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {totalOrders * 10} Pts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Link href="/dashboard/deposit" className="flex-1">
                  <button className="w-full flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-12 bg-white text-blue-600 text-sm font-bold leading-normal hover:bg-blue-50 transition-colors">
                    <PlusCircle className="w-5 h-5" />
                    <span>Add Funds</span>
                  </button>
                </Link>
                <Link href="/dashboard/orders">
                  <button className="flex size-12 cursor-pointer items-center justify-center rounded-xl bg-white/20 text-white border border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors">
                    <Wallet className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex flex-wrap gap-3 px-4 py-2">
            <div className="flex min-w-[150px] flex-1 flex-col gap-1 rounded-xl p-4 bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <ShoppingCart className="w-4 h-4" />
                <p className="text-xs font-medium uppercase tracking-wider">Active Orders</p>
              </div>
              <div className="flex items-end justify-between mt-1">
                <p className="text-slate-900 text-2xl font-bold leading-none">{totalOrders}</p>
                <p className="text-emerald-600 text-sm font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                  <TrendingUp className="w-3 h-3 mr-0.5" />+{Math.floor(totalOrders / 10)}
                </p>
              </div>
            </div>
            <div className="flex min-w-[150px] flex-1 flex-col gap-1 rounded-xl p-4 bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <CreditCard className="w-4 h-4" />
                <p className="text-xs font-medium uppercase tracking-wider">Lifetime Spent</p>
              </div>
              <div className="flex items-end justify-between mt-1">
                <p className="text-slate-900 text-2xl font-bold leading-none">${totalSpent.toFixed(2)}</p>
                <p className="text-emerald-600 text-sm font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                  12%
                </p>
              </div>
            </div>
          </div>

          {/* VIP Membership Progress Card */}
          <div className="px-4 py-3">
            <div className={`rounded-xl p-4 border ${tierInfo.isVip ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200/50' : 'bg-white border-slate-200'} shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tierInfo.color} flex items-center justify-center`}>
                    {tierInfo.icon ? <tierInfo.icon className="w-4 h-4 text-white" /> : <Star className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${tierInfo.isVip ? 'text-amber-800' : 'text-slate-900'}`}>{tierInfo.name}</p>
                    <p className="text-xs text-slate-500">Your current tier</p>
                  </div>
                </div>
                {!tierInfo.isVip && (
                  <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold">
                    Upgrade
                  </div>
                )}
              </div>
              
              {!tierInfo.isVip ? (
                <>
                  {/* Progress to VIP */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Progress to VIP</span>
                      <span className="text-slate-900 font-semibold">{Math.min(Math.round((totalSpent / 500) * 100), 100)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((totalSpent / 500) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">Spend ${Math.max(0, 500 - totalSpent).toFixed(0)} more to unlock VIP</p>
                  </div>
                  
                  {/* VIP Benefits Preview */}
                  <div className="flex gap-2 text-xs">
                    <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
                      <p className="text-amber-600 font-bold">50% Off</p>
                      <p className="text-slate-500">All Services</p>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
                      <p className="text-amber-600 font-bold">Priority</p>
                      <p className="text-slate-500">Processing</p>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
                      <p className="text-amber-600 font-bold">24/7</p>
                      <p className="text-slate-500">VIP Support</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>You're enjoying VIP benefits!</span>
                  </div>
                  
                  {/* VIP Savings Indicator */}
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="bg-white rounded-lg p-2 text-center border border-amber-200">
                      <p className="text-amber-600 font-bold text-sm">
                        {priceMultiplier ? ((3.0 - priceMultiplier) / 3.0 * 100).toFixed(0) : 50}%
                      </p>
                      <p className="text-slate-600 text-[10px]">Discount</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center border border-amber-200">
                      <p className="text-amber-600 font-bold text-sm">
                        {priceMultiplier ? priceMultiplier.toFixed(1) : 1.5}×
                      </p>
                      <p className="text-slate-600 text-[10px]">Multiplier</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center border border-amber-200">
                      <p className="text-amber-600 font-bold text-sm">
                        ${((3.0 - (priceMultiplier || 1.5)) * (totalSpent / (priceMultiplier || 1.5) / 3.0)).toFixed(0)}
                      </p>
                      <p className="text-slate-600 text-[10px]">Saved</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coupon Paste Card */}
          <div className="px-4 py-4">
            <CouponPasteCard onCouponApplied={handleCouponApplied} />
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between px-4 pb-3 pt-6">
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Quick Order</h2>
            <Link href="/dashboard/orders">
              <span className="text-blue-600 text-xs font-bold flex items-center gap-1 cursor-pointer hover:text-blue-700 transition-colors">
                View Orders
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          <div className="pb-4">
            {/* Quick Order Module */}
            <form
              onSubmit={handleSubmit}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4 overflow-hidden"
            >
              <div className="flex flex-col gap-2">
                <p className="text-slate-900 text-sm font-semibold">Select Category</p>
                <Select
                  value={selectedCategory?.id || ""}
                  onValueChange={(value) => {
                    const category = categoriesWithServices.find((c) => c.id === value)
                    if (category) {
                      setSelectedCategory(category)
                      const firstService = services.find((s) => s.category_id === category.id)
                      if (firstService) {
                        setSelectedService(firstService)
                        setQuantity(firstService.min_quantity || 1000)
                      } else {
                        setSelectedService(null)
                      }
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-12 rounded-xl border-slate-200">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent
                    className="w-[var(--radix-select-trigger-width)] max-h-[160px] overflow-y-auto"
                    side="bottom"
                    align="start"
                    position="popper"
                    sideOffset={4}
                  >
                    {categoriesWithServices.map((category) => {
                      const iconUrl = getIconUrl(category)
                      return (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            {iconUrl && (
                              <img
                                src={iconUrl || "/placeholder.svg"}
                                alt={category.name}
                                className="h-5 w-5 rounded object-contain"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                            )}
                            <span className="truncate">{category.name}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && filteredServices.length === 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <Info className="w-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-800 font-medium">
                    No services available in this category. Please select another category.
                  </p>
                </div>
              )}

              {filteredServices.length > 0 && (
                <>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <p className="text-slate-900 text-sm font-semibold">Select Service</p>
                      <span className="text-xs text-blue-600 font-medium flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> High Quality
                      </span>
                    </div>
                    <Select
                      value={selectedService?.id || ""}
                      onValueChange={(value) => {
                        const service = filteredServices.find((s) => s.id === value)
                        if (service) {
                          setSelectedService(service)
                          setQuantity(service.min_quantity || 1000)
                        }
                      }}
                    >
                      <SelectTrigger className="w-full h-12 rounded-xl border-slate-200">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent
                        className="w-[var(--radix-select-trigger-width)] max-h-[160px] overflow-y-auto"
                        side="bottom"
                        align="start"
                        position="popper"
                        sideOffset={4}
                      >
                        {filteredServices.map((service) => {
                          const iconUrl = getIconUrl(service)
                          return (
                            <SelectItem key={service.id} value={service.id}>
                              <div className="flex items-center gap-2">
                                {iconUrl && (
                                  <img
                                    src={iconUrl || "/placeholder.svg"}
                                    alt={service.name}
                                    className="h-5 w-5 rounded object-contain"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none"
                                    }}
                                  />
                                )}
                                <span className="truncate">{service.name} - ${Number(service.price || service.base_price || 0).toFixed(2)}/1k</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    {selectedService && (
                      <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg">
                        <div className="flex justify-between">
                          <span>Min: {selectedService.min_quantity}</span>
                          <span>Max: {selectedService.max_quantity?.toLocaleString()}</span>
                          <span className="font-bold text-blue-600">
                            ${Number(selectedService.price || selectedService.base_price || 0).toFixed(4)}/1k
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        <p className="text-slate-900 text-sm font-bold">Bulk Buy</p>
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Save 16%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">Min. 10,000 units · Better pricing</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleBulkToggle}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        isBulkBuy ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                          isBulkBuy ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {isBulkBuy && savings > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-emerald-700">You're saving ${savings.toFixed(2)}!</p>
                        <p className="text-[10px] text-slate-500 font-medium">Bulk pricing: 2.5x vs Regular: 3x</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-slate-900 text-sm font-semibold">Target URL / Username *</label>
                    <input
                      type="text"
                      placeholder="https://instagram.com/username or post URL"
                      required
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      disabled={loading}
                      className="form-input flex w-full rounded-xl text-slate-900 border border-slate-200 h-12 px-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                    <p className="text-[10px] text-slate-500 font-medium">Enter the profile or post URL you want to boost</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <p className="text-slate-900 text-sm font-semibold">Quantity</p>
                      <p className="text-xs text-slate-500">
                        {selectedService?.min_quantity} - {selectedService?.max_quantity?.toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity Input */}
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 0)}
                      className="form-input flex w-full rounded-xl text-slate-900 border border-slate-200 h-12 px-4 text-sm font-bold text-center focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      min={selectedService?.min_quantity || 100}
                      max={selectedService?.max_quantity || 1000000}
                    />

                    {/* Quantity Buttons Below */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 1000)}
                        disabled={quantity <= (selectedService?.min_quantity || 100)}
                        className="flex-1 flex items-center justify-center gap-1 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                        <span>1000</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 100)}
                        disabled={quantity <= (selectedService?.min_quantity || 100)}
                        className="flex-1 flex items-center justify-center gap-1 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                        <span>100</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 100)}
                        disabled={quantity >= (selectedService?.max_quantity || 1000000)}
                        className="flex-1 flex items-center justify-center gap-1 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                        <span>100</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 1000)}
                        disabled={quantity >= (selectedService?.max_quantity || 1000000)}
                        className="flex-1 flex items-center justify-center gap-1 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                        <span>1000</span>
                      </button>
                    </div>

                    {/* Bulk Buy Info */}
                    {isBulkBuy && (
                      <p className="text-xs text-blue-600 font-medium text-center">
                        Bulk pricing applied · Minimum 10,000 units
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <span className="text-slate-900 text-sm font-semibold">Total Charge</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
                  </div>

                  <button
                    id="place-order-button"
                    type="submit"
                    disabled={loading || !selectedService || !link.trim()}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base font-bold leading-normal transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Place Order
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>

          {/* Order History Section */}
          {recentOrders && recentOrders.length > 0 && (
            <div className="pb-4">
              <h3 className="text-slate-900 text-base font-bold px-4 pt-4 pb-2">Recent Orders</h3>
              <div className="space-y-2 px-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{order.services?.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.quantity?.toLocaleString()} units • Order #{order.id?.slice(0, 8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">${(order.price || 0).toFixed(2)}</p>
                      <span
                        className={`text-xs font-semibold rounded-full px-2 py-0.5 inline-block mt-1 ${
                          order.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : order.status === "processing"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Dashboard Footer */}
        <DashboardFooter />

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center z-20">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 py-2 flex-1 cursor-pointer">
            <Home className="w-5 h-5 text-blue-600" />
            <p className="text-xs font-semibold text-blue-600">Dashboard</p>
          </Link>
          <Link href="/dashboard/orders" className="flex flex-col items-center gap-1 py-2 flex-1 cursor-pointer">
            <ListOrdered className="w-5 h-5 text-slate-600" />
            <p className="text-xs font-semibold text-slate-600">Orders</p>
          </Link>
          <Link href="/dashboard/profile" className="flex flex-col items-center gap-1 py-2 flex-1 cursor-pointer">
            <UserCircle className="w-5 h-5 text-slate-600" />
            <p className="text-xs font-semibold text-slate-600">Profile</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
