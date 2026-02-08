"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { placeOrder } from "@/app/actions/orders"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Loader2,
  Zap,
  LinkIcon,
  Plus,
  Minus,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Home,
  BarChart3,
  FileText,
  HelpCircle,
  Bell,
  Settings,
  Camera,
  Music,
  PlayCircle,
  Twitter,
} from "lucide-react"

export function MobileOrderInterface({
  services,
  categories,
  userBalance,
  userName,
  totalOrders,
}: {
  services: any[]
  categories: any[]
  userBalance: number
  userName: string
  totalOrders: number
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedService, setSelectedService] = useState<any>(null)
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState(100)
  const [loading, setLoading] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchesCategory =
        !selectedCategory || selectedCategory === "all" || service.category_id === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [services, debouncedSearch, selectedCategory])

  const totalPrice = useMemo(() => {
    if (!selectedService) return 0
    const servicePrice = Number(selectedService.price || selectedService.base_price || 0)
    return (quantity / 1000) * servicePrice
  }, [selectedService, quantity])

  const hasSufficientBalance = userBalance >= totalPrice

  // Hardcoded icon mapping
  const iconMap: Record<string, string> = {
    Instagram: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icons8-instagram-Y6Ka1ocAALzf5J8Hu64Toiy50JdPFd.gif",
    TikTok: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icons8-tiktok-EzflMkAJ5ndq4gRIi5nzmBOoM1OvUF.gif",
    Facebook: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icons8-facebook-circled-EtRgurnTPAHD2yxFZbazoJxbrZYTq9.gif",
    YouTube: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icons8-youtube-M93kjqYJSjNU8cGtu7AQA1RKroGXxQ.gif",
    Twitter: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icons8-twitter-logo.gif",
    Discord: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icons8-discord-mNk8wSFfWYQoBZCDbcO2VNGpaupSgy.gif",
    Telegram: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icons8-telegram-logo-gdYZ4CI62yYQFzmsC9hgp5SCpNecjH.gif",
    LinkedIn: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icons8-linkedin-j6nqGqyCXXSRbGjpQ6hLsVTKXmXfdX.gif",
    Spotify: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icons8-spotify-2iAARTR3O1EPL2XispaD2uZe9tLu3S.gif",
  }

  const getIconUrl = (name: string): string | undefined => {
    // Try exact match first
    if (iconMap[name]) return iconMap[name]
    // Try matching the start of the name
    for (const [key, url] of Object.entries(iconMap)) {
      if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
        return url
      }
    }
    return undefined
  }

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id)
    }
  }, [categories, selectedCategory])

  useEffect(() => {
    if (filteredServices.length > 0 && !selectedService) {
      const firstService = filteredServices[0]
      setSelectedService(firstService)
      setQuantity(firstService.min_quantity || 100)
    }
  }, [filteredServices, selectedService])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedService) {
      toast({
        title: "Service Required",
        description: "Please select a service first",
        variant: "destructive",
      })
      return
    }

    if (!link.trim()) {
      toast({
        title: "Link Required",
        description: "Please enter a link or username",
        variant: "destructive",
      })
      return
    }

    if (!hasSufficientBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You need $${totalPrice.toFixed(2)} but only have $${userBalance.toFixed(2)}. Please add funds.`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const result = await placeOrder(selectedService.id, link, quantity)

      if (result.error) {
        toast({
          title: "Order Failed",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      if (result.success && result.orderId) {
        toast({
          title: "Order Placed Successfully!",
          description: `Your order is being processed.`,
        })

        setSelectedService(null)
        setLink("")
        setQuantity(100)
        setSearchQuery("")
        setSelectedCategory("")

        router.refresh()
        setTimeout(() => {
          router.push("/dashboard/orders")
        }, 1500)
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

  const handleSearchSelect = (service: any) => {
    setSelectedService(service)
    setSelectedCategory(service.category_id)
    setQuantity(service.min_quantity || 100)
    setSearchQuery(service.name)
    setShowSearchResults(false)
  }

  const handleServiceIconClick = (platformName: string) => {
    console.log("[v0] Service icon clicked:", platformName)
    const category = categories.find((cat) => cat.name.toLowerCase().includes(platformName.toLowerCase()))

    if (category) {
      console.log("[v0] Category found:", category.name)
      setSelectedCategory(category.id)

      // Find first service in this category
      const categoryServices = services.filter((s) => s.category_id === category.id)
      if (categoryServices.length > 0) {
        const firstService = categoryServices[0]
        console.log("[v0] Auto-selecting first service:", firstService.name)
        setSelectedService(firstService)
        setQuantity(firstService.min_quantity || 100)
      }
    }
  }

  const categoryHasServices = useMemo(() => {
    if (!selectedCategory) return true
    return services.some((s) => s.category_id === selectedCategory)
  }, [services, selectedCategory])

  return (
    <div className="relative min-h-screen pb-32">
      {/* Orbital Mesh Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50" />
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div
            className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(127, 19, 236, 0.15), transparent 70%)",
            }}
          />
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(127, 19, 236, 0.1), transparent 70%)",
            }}
          />
        </div>
      </div>

      <nav className="flex items-center justify-between p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/50 shadow-lg">
            {userName.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-600">Welcome back,</span>
            <span className="text-sm font-bold text-slate-900">{userName}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-md shadow-sm border border-white/30">
            <Bell className="w-5 h-5 text-slate-700" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-md shadow-sm border border-white/30">
            <Settings className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </nav>

      <div className="p-4">
        <div className="relative overflow-hidden rounded-[2.5rem] p-8 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl shadow-purple-500/5">
          {/* Orbital Progress Visual */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Outer orbital ring */}
            <div
              className="absolute inset-0 rounded-full opacity-20"
              style={{
                background: "conic-gradient(from 0deg, #7f13ec 0%, #7f13ec 75%, transparent 75%, transparent 100%)",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 8px), #fff 0)",
              }}
            />
            {/* Inner orbital ring with glow */}
            <div
              className="absolute inset-0 rounded-full rotate-45"
              style={{
                background: "conic-gradient(from 0deg, #7f13ec 0%, #7f13ec 75%, transparent 75%, transparent 100%)",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 8px), #fff 0)",
                boxShadow: "0 0 20px rgba(127, 19, 236, 0.3)",
              }}
            />
            {/* Center content */}
            <div className="z-10 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Balance</p>
              <p className="text-3xl font-bold mt-1 text-slate-900">${userBalance.toFixed(2)}</p>
              <div className="mt-2 inline-flex items-center gap-1 bg-purple-500/10 px-3 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 text-purple-600" />
                <span className="text-[10px] font-bold text-purple-600">Active</span>
              </div>
            </div>
          </div>
          {/* Action button */}
          <button
            onClick={() => router.push("/dashboard/deposit")}
            className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            <span>Add Funds</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 px-4 py-2">
        <div className="rounded-2xl p-4 flex items-center gap-3 bg-white/70 backdrop-blur-xl border border-white/30 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600">Orders</p>
            <p className="text-lg font-bold text-slate-900">{totalOrders}</p>
          </div>
        </div>
        <div className="rounded-2xl p-4 flex items-center gap-3 bg-white/70 backdrop-blur-xl border border-white/30 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600">Spent</p>
            <p className="text-lg font-bold text-slate-900">$0</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Our Services</h2>
          <button onClick={() => router.push("/dashboard/new-order")} className="text-xs font-bold text-purple-600">
            View All
          </button>
        </div>
        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[320px]">
          {/* Instagram (Large 2x2) */}
          <button
            onClick={() => handleServiceIconClick("instagram")}
            className="col-span-2 row-span-2 rounded-[2rem] bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] p-6 flex flex-col justify-between relative overflow-hidden group active:scale-95 transition-transform"
          >
            <div className="z-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <p className="text-white text-xl font-bold text-left">Instagram</p>
              <p className="text-white/70 text-xs text-left">Followers, Likes & Views</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <span className="z-10 self-start text-[10px] font-bold bg-white/20 text-white px-2 py-1 rounded-full uppercase tracking-wider">
              Popular
            </span>
          </button>

          {/* TikTok (Wide 2x1) */}
          <button
            onClick={() => handleServiceIconClick("tiktok")}
            className="col-span-2 row-span-1 rounded-[1.5rem] bg-black p-4 flex items-center gap-3 group active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold">TikTok</p>
              <p className="text-white/50 text-[10px]">Instant delivery</p>
            </div>
          </button>

          {/* YouTube (1x1) */}
          <button
            onClick={() => handleServiceIconClick("youtube")}
            className="col-span-1 row-span-1 rounded-[1.5rem] bg-red-600 p-4 flex flex-col justify-center items-center group active:scale-95 transition-transform"
          >
            <PlayCircle className="w-5 h-5 text-white mb-1" />
            <p className="text-white text-[10px] font-bold">YouTube</p>
          </button>

          {/* Twitter/X (1x1) */}
          <button
            onClick={() => handleServiceIconClick("twitter")}
            className="col-span-1 row-span-1 rounded-[1.5rem] bg-slate-900 p-4 flex flex-col justify-center items-center group active:scale-95 transition-transform"
          >
            <Twitter className="w-5 h-5 text-white mb-1" />
            <p className="text-white text-[10px] font-bold">Twitter</p>
          </button>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" strokeWidth={2.5} />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSearchResults(e.target.value.length > 0)
            }}
            className="pl-10 h-11 bg-white/70 backdrop-blur-xl border border-white/30 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-purple-500"
          />
        </div>

        {showSearchResults && searchQuery && filteredServices.length > 0 && (
          <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/30 max-h-64 overflow-y-auto">
            {filteredServices.slice(0, 10).map((service: any) => {
              const servicePrice = Number(service.price || service.base_price || 0)
              return (
                <button
                  key={service.id}
                  onClick={() => handleSearchSelect(service)}
                  className="w-full text-left px-4 py-3 hover:bg-purple-50/50 border-b border-slate-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-900 line-clamp-1">{service.name}</span>
                    <span className="shrink-0 text-purple-600 font-bold text-xs whitespace-nowrap">
                      ${servicePrice.toFixed(2)}/1K
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full h-11 bg-white/70 backdrop-blur-xl border border-white/30 rounded-xl text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              align="start"
              className="w-[var(--radix-select-trigger-width)] max-h-[300px]"
            >
              {categories.map((cat: any) => {
                const iconUrl = getIconUrl(cat.name)
                return (
                  <SelectItem key={cat.id} value={cat.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      {iconUrl && (
                        <img
                          src={iconUrl}
                          alt={cat.name}
                          className="h-5 w-5 rounded object-contain flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      )}
                      <span className="truncate block">{cat.name}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {selectedCategory && !categoryHasServices && (
          <div className="rounded-xl p-4 bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800 font-medium">⚠️ No services available in this category yet.</p>
          </div>
        )}

        {selectedCategory && filteredServices.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Service ({filteredServices.length} available)
            </Label>
            <Select
              value={selectedService?.id || ""}
              onValueChange={(id) => {
                const service = filteredServices.find((s) => s.id === id)
                if (service) {
                  setSelectedService(service)
                  setQuantity(service.min_quantity || 100)
                }
              }}
            >
              <SelectTrigger className="w-full h-11 bg-white/70 backdrop-blur-xl border border-white/30 rounded-xl text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                side="bottom"
                align="start"
                className="w-[var(--radix-select-trigger-width)] max-h-[300px]"
              >
                {filteredServices.map((service: any) => {
                  const servicePrice = Number(service.price || service.base_price || 0)
                  const iconUrl = getIconUrl(service.name)
                  return (
                    <SelectItem key={service.id} value={service.id} className="text-sm">
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {iconUrl && (
                            <img
                              src={iconUrl}
                              alt={service.name}
                              className="h-5 w-5 rounded object-contain flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          )}
                          <span className="truncate flex-1 min-w-0">{service.name}</span>
                        </div>
                        <span className="text-purple-600 font-bold text-xs shrink-0">
                          ${servicePrice.toFixed(2)}/1K
                        </span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedService && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="rounded-2xl p-4 bg-white/70 backdrop-blur-xl border border-white/30">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Description</h3>
              <div className="space-y-2 text-xs text-slate-700">
                <p className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    <strong>Speed:</strong> Instant delivery
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <LinkIcon className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>
                    <strong>Min:</strong> {selectedService.min_quantity} <strong>Max:</strong>{" "}
                    {selectedService.max_quantity?.toLocaleString()}
                  </span>
                </p>
              </div>
            </div>

            <Input
              placeholder="Enter link or username"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="h-12 bg-white/70 backdrop-blur-xl border border-white/30 rounded-xl"
              required
            />

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                onClick={() => setQuantity(Math.max(selectedService.min_quantity || 100, quantity - 100))}
                className="h-12 w-12 bg-white/70 backdrop-blur-xl border border-white/30 hover:bg-white rounded-xl text-slate-700"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="h-12 text-center font-bold bg-white/70 backdrop-blur-xl border border-white/30 rounded-xl"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => setQuantity(Math.min(selectedService.max_quantity || 100000, quantity + 100))}
                className="h-12 w-12 bg-white/70 backdrop-blur-xl border border-white/30 hover:bg-white rounded-xl text-slate-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg shadow-purple-500/30">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" fill="white" />
                <div>
                  <p className="text-sm font-semibold">Total</p>
                  <p className="text-xs opacity-80">Instant delivery</p>
                </div>
              </div>
              <p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p>
            </div>

            <Button
              type="submit"
              disabled={loading || !hasSufficientBalance}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/40"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Order"
              )}
            </Button>

            {!hasSufficientBalance && (
              <p className="text-center text-sm text-red-600 font-semibold">Insufficient balance</p>
            )}
          </form>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center pointer-events-none">
        <div className="bg-white/80 backdrop-blur-2xl px-2 py-2 rounded-full shadow-2xl flex items-center gap-1 border border-white/40 pointer-events-auto">
          <button
            onClick={() => router.push("/")}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          >
            <Home className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push("/dashboard/orders")}
            className="w-12 h-12 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          {/* Central Action */}
          <button
            onClick={() => router.push("/dashboard/new-order")}
            className="mx-4 w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/40 text-white hover:bg-purple-700 transition-colors relative"
          >
            <Plus className="w-7 h-7" />
          </button>
          <button
            onClick={() => router.push("/dashboard/orders")}
            className="w-12 h-12 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors"
          >
            <FileText className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push("/dashboard/tickets")}
            className="w-12 h-12 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
