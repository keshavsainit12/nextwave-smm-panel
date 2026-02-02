"use client"

import type React from "react"
import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { placeOrder } from "@/app/actions/orders"
import Link from "next/link"
import { ServiceCards } from "./service-cards-section"
import { DashboardFooter } from "./dashboard-footer"
import { CouponPasteCard } from "./coupon-paste-card"
import {
  Info,
  Star,
  Plus,
  Wallet,
  Clock,
  DollarSign,
  Check,
  LinkIcon,
  ShoppingCart,
  ArrowRight,
  Loader2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DesktopDashboard({
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

  // Hardcoded icon mapping - Using Blob Storage PNG URLs (no GIFs)
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

  const getIconUrl = (name: string): string | undefined => {
    if (iconMap[name]) return iconMap[name]
    for (const [key, url] of Object.entries(iconMap)) {
      if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
        return url
      }
    }
    return undefined
  }

  const handleSelectCategory = (categoryName: string) => {
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
  }

  const totalPrice = useMemo(() => {
    if (!selectedService) return 0
    const servicePrice = Number(selectedService.price || selectedService.base_price || 0)
    const multiplier = isBulkBuy ? 2.5 : 3.0
    const priceBeforeDiscount = (quantity / 1000) * servicePrice * multiplier
    if (appliedCouponDiscount > 0) {
      return priceBeforeDiscount * (1 - appliedCouponDiscount / 100)
    }
    return priceBeforeDiscount
  }, [selectedService, quantity, isBulkBuy, appliedCouponDiscount])

  const handleCouponApplied = useCallback((couponCode: string, discount: number) => {
    if (typeof discount === 'number' && discount > 0) {
      setAppliedCouponDiscount(discount)
    }
  }, [])

  const categoriesWithServices = useMemo(() => {
    return categories.filter((category) => services.some((s) => s.category_id === category.id))
  }, [categories, services])

  const filteredServices = useMemo(() => {
    if (!selectedCategory) return []
    return services.filter((s) => s.category_id === selectedCategory.id)
  }, [services, selectedCategory])

  const pendingOrders = useMemo(() => {
    if (!recentOrders || recentOrders.length === 0) return 0
    return recentOrders.filter((order) => order.status === "pending" || order.status === "processing").length
  }, [recentOrders])

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
    <div className="min-h-screen dashboard-animated-bg relative">
      {/* Animated background orbs */}
      <div className="dashboard-blur-orb absolute top-10 right-20 w-96 h-96 bg-blue-500/10 pointer-events-none"></div>
      <div className="dashboard-blur-orb absolute bottom-20 -left-20 w-full h-96 bg-purple-500/10 pointer-events-none" style={{ animationDelay: "3s" }}></div>
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Hot Services Cards Section */}
      <ServiceCards
        onSelectCategory={handleSelectCategory}
        categories={categories}
        services={services}
      />

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Balance Card */}
        <div className="md:col-span-2 xl:col-span-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 opacity-90">
                <span className="text-sm font-medium">Total Balance</span>
                <Info className="w-4 h-4 cursor-help" />
              </div>
              <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className="text-sm font-bold">{(totalOrders || 0) * 10} Pts</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 md:mb-8 tracking-tight">
              ${(userBalance || 0).toFixed(2)}
            </h2>
            <div className="flex gap-3">
              <Link href="/dashboard/deposit" className="flex-1">
                <button className="w-full bg-white text-blue-600 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
                  <Plus className="w-5 h-5" />
                  Add Funds
                </button>
              </Link>
              <Link href="/dashboard/orders">
                <button className="bg-white/20 hover:bg-white/30 transition-colors p-3 rounded-xl backdrop-blur-md">
                  <Wallet className="w-5 h-5 text-white" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-6">
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4" />
              Pending Orders
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl md:text-4xl font-bold">{pendingOrders}</span>
              <span className="bg-blue-100 text-blue-600 text-xs md:text-sm font-bold px-2 py-1 rounded-lg">
                Active
              </span>
            </div>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <DollarSign className="w-4 h-4" />
              Lifetime Spent
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl md:text-3xl font-bold">${(totalSpent || 0).toFixed(2)}</span>
              <span className="bg-green-100 text-green-600 text-xs md:text-sm font-bold px-2 py-1 rounded-lg">
                Total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Paste Card */}
      <div className="max-w-2xl">
        <CouponPasteCard onCouponApplied={handleCouponApplied} />
      </div>

      {/* VIP Membership Progress Card */}
      <div className={`rounded-2xl p-6 border ${tierInfo.isVip ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200/50' : 'bg-white border-slate-200'} shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tierInfo.color} flex items-center justify-center shadow-lg`}>
              {tierInfo.icon ? <tierInfo.icon className="w-6 h-6 text-white" /> : <Star className="w-6 h-6 text-white" />}
            </div>
            <div>
              <p className={`text-lg font-bold ${tierInfo.isVip ? 'text-amber-800' : 'text-slate-900'}`}>{tierInfo.name}</p>
              <p className="text-sm text-slate-500">Your current membership tier</p>
            </div>
          </div>
          {!tierInfo.isVip && (
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Upgrade to VIP
            </div>
          )}
        </div>
        
        {!tierInfo.isVip ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Progress Section */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Progress to VIP Elite</span>
                <span className="text-slate-900 font-bold">{Math.min(Math.round((totalSpent / 500) * 100), 100)}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalSpent / 500) * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm text-slate-500">
                Spend <span className="font-bold text-amber-600">${Math.max(0, 500 - totalSpent).toFixed(0)}</span> more to unlock VIP benefits
              </p>
            </div>
            
            {/* VIP Benefits Preview */}
            <div className="flex gap-3">
              <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                <p className="text-amber-600 font-bold text-lg">50%</p>
                <p className="text-slate-600 text-xs">Discount</p>
              </div>
              <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                <p className="text-amber-600 font-bold text-lg">Priority</p>
                <p className="text-slate-600 text-xs">Processing</p>
              </div>
              <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                <p className="text-amber-600 font-bold text-lg">24/7</p>
                <p className="text-slate-600 text-xs">VIP Support</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-amber-100 rounded-xl">
              <Check className="w-6 h-6 text-amber-600" />
              <div>
                <p className="text-amber-800 font-bold">You're a VIP member!</p>
                <p className="text-amber-700 text-sm">Enjoying exclusive benefits on all orders.</p>
              </div>
            </div>
            
            {/* Tier Discount Indicator */}
            <div className="flex justify-center">
              <div className="bg-white rounded-xl p-4 text-center border-2 border-amber-300 shadow-sm min-w-[160px]">
                <p className="text-amber-600 font-bold text-2xl">
                  {priceMultiplier ? ((3.0 - priceMultiplier) / 3.0 * 100).toFixed(0) : 50}%
                </p>
                <p className="text-slate-600 text-sm font-medium">Your Discount</p>
                <p className="text-slate-500 text-xs mt-1">(You save {priceMultiplier ? ((3.0 - priceMultiplier) / 3.0 * 100).toFixed(0) : 50}% off!)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Section */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 md:gap-8">
        {/* Quick Order Form */}
        <div className="xl:col-span-3">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold">Quick Order</h2>
            <span className="text-blue-600 text-xs md:text-sm font-bold flex items-center gap-1">
              All Services Available
              <Check className="w-4 h-4" />
            </span>
          </div>
          <form
            onSubmit={handleSubmit}
            className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 md:space-y-6"
          >
            {/* Category Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Service Category</label>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 uppercase">
                  <Check className="w-3 h-3" />
                  High Quality
                </span>
              </div>
              <div className="relative">
                <Select value={selectedCategory?.id || ""} onValueChange={(value) => {
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
                  }}>
                  <SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 md:py-3.5 pl-4 pr-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm md:text-base">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {categoriesWithServices.map((category) => {
                      const iconUrl = getIconUrl(category.name)
                      return (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            {iconUrl && (
                              <img
                                src={iconUrl || "/placeholder.svg"}
                                alt={category.name}
                                className="h-4 w-4 rounded object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                            )}
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedCategory && filteredServices.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800 font-medium">
                  No services available in this category. Please select another category.
                </p>
              </div>
            )}

            {filteredServices.length > 0 && (
              <>
                {/* Service Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Select Service</label>
                  <div className="relative">
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
                    <SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 md:py-3.5 pl-4 pr-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm md:text-base">
                      <SelectValue placeholder="Select Service" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {filteredServices.map((service) => {
                        const iconUrl = getIconUrl(service.name)
                        return (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex items-center gap-2">
                              {iconUrl && (
                                <img
                                  src={iconUrl || "/placeholder.svg"}
                                  alt={service.name}
                                  className="h-4 w-4 rounded object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none"
                                  }}
                                />
                              )}
                              <span>{service.name} - ${Number(service.price || service.base_price || 0).toFixed(2)}/1k</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  </div>
                </div>

                {/* Bulk Buy Toggle */}
                {selectedService && (
                  <div className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 text-xl">📦</span>
                        <p className="text-slate-900 text-sm font-bold">Bulk Buy</p>
                        <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Save 16%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 font-medium">
                        Min. 10,000 units · Auto-applied when enabled
                      </p>
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
                )}

                {/* Target URL */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Target URL / Username</label>
                  <div className="relative">
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 md:py-3.5 pl-4 pr-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm md:text-base"
                      placeholder="https://instagram.com/user..."
                      type="text"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                    />
                    <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  </div>
                </div>

                {/* Quantity and Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Quantity</label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 md:py-3.5 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-sm md:text-base text-center"
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(Number(e.target.value))}
                      min={selectedService?.min_quantity || 1}
                      max={selectedService?.max_quantity || 1000000}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 1000)}
                        disabled={quantity <= (selectedService?.min_quantity || 100)}
                        className="flex-1 h-9 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-bold text-xs disabled:opacity-50"
                      >
                        -1000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 100)}
                        disabled={quantity <= (selectedService?.min_quantity || 100)}
                        className="flex-1 h-9 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-bold text-xs disabled:opacity-50"
                      >
                        -100
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 100)}
                        disabled={quantity >= (selectedService?.max_quantity || 1000000)}
                        className="flex-1 h-9 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-bold text-xs disabled:opacity-50"
                      >
                        +100
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 1000)}
                        disabled={quantity >= (selectedService?.max_quantity || 1000000)}
                        className="flex-1 h-9 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-bold text-xs disabled:opacity-50"
                      >
                        +1000
                      </button>
                    </div>
                    {selectedService && (
                      <p className="text-xs text-slate-500">
                        Min: {(selectedService.min_quantity || 0).toLocaleString()} | Max:{" "}
                        {(selectedService.max_quantity || 0).toLocaleString()}
                        {isBulkBuy && <span className="text-blue-600 ml-2">· Bulk pricing active</span>}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Total Price</label>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl py-3 md:py-3.5 px-4 flex items-center justify-between">
                      <span className="text-xl md:text-2xl font-extrabold text-blue-700">${totalPrice.toFixed(2)}</span>
                      {isBulkBuy && (
                        <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                          -16%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Service Info */}
                {selectedService && (
                  <div className="p-3 md:p-4 bg-slate-50 rounded-lg space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Speed:</span>
                      <span className="font-bold text-slate-900">{selectedService.speed || "Normal"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Quality:</span>
                      <span className="font-bold text-slate-900">{selectedService.quality || "High Quality"}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !link.trim()}
                  className={`w-full py-3 md:py-4 px-4 md:px-6 rounded-xl font-bold text-white text-sm md:text-base flex items-center justify-center gap-2 transition-all ${
                    loading || !link.trim()
                      ? "bg-slate-400 cursor-not-allowed opacity-60"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  }`}
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

        {/* Recent Orders Sidebar */}
        <div className="xl:col-span-2">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Recent Orders</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="p-3 md:p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">
                        {order.services?.name || "Unknown Service"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ml-2 flex-shrink-0 ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "processing"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.status || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{(order.quantity || 0).toLocaleString()} units</span>
                    <span className="font-bold text-slate-900">
                      ${(order.total_price || order.price || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 md:p-8 text-center text-slate-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No orders yet</p>
                <p className="text-xs mt-1">Place your first order above</p>
              </div>
            )}
          </div>
          <Link href="/dashboard/orders">
            <button className="w-full mt-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm md:text-base">
              View All Orders
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
        </div>
      
      {/* Dashboard Footer */}
      <DashboardFooter />
      </div>
    </div>
  )
}
