"use client"

import { Star, ShoppingCart } from "lucide-react"
import { useCallback } from "react"

interface ServiceCardsProps {
  onSelectCategory: (categoryName: string) => void
  categories: any[]
  services: any[]
}

const platformConfig = [
  {
    name: "Instagram",
    color: "from-pink-500 to-orange-400",
    bgColor: "from-pink-100/40 to-orange-100/40",
    borderColor: "border-pink-100",
    darkBg: "dark:from-pink-900/5 dark:to-slate-800",
    darkBorder: "dark:border-pink-900/20",
    textColor: "text-pink-600",
    buttonColor: "bg-pink-600 hover:bg-pink-700",
    shadowColor: "shadow-pink-200",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-from-rawpixel-id-3344505-png-26OEaERgfRA2szq1ynwrYmHizPyhpM.png",
  },
  {
    name: "YouTube",
    color: "from-red-600 to-red-700",
    bgColor: "from-red-100/40 to-white/40",
    borderColor: "border-red-100",
    darkBg: "dark:from-red-900/5 dark:to-slate-800",
    darkBorder: "dark:border-red-900/20",
    textColor: "text-red-600",
    buttonColor: "bg-red-600 hover:bg-red-700",
    shadowColor: "shadow-red-200",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/youtube%20%281%29-vLiOrlbLFV57Tue7SrmDV7Frnkb1uZ.png",
  },
  {
    name: "Facebook",
    color: "from-blue-600 to-blue-700",
    bgColor: "from-blue-100/40 to-white/40",
    borderColor: "border-blue-100",
    darkBg: "dark:from-blue-900/5 dark:to-slate-800",
    darkBorder: "dark:border-blue-900/20",
    textColor: "text-blue-600",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    shadowColor: "shadow-blue-200",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/facebook-5KZKPoiTruTw0y6Y5Q58NACnBWPhD9.png",
  },
  {
    name: "Telegram",
    color: "from-sky-500 to-sky-600",
    bgColor: "from-sky-100/40 to-white/40",
    borderColor: "border-sky-100",
    darkBg: "dark:from-sky-900/5 dark:to-slate-800",
    darkBorder: "dark:border-sky-900/20",
    textColor: "text-sky-600",
    buttonColor: "bg-sky-600 hover:bg-sky-700",
    shadowColor: "shadow-sky-200",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/telegram-Zsh1cuHtI9tmxUm9E19up6lNY3iSYW.png",
  },
  {
    name: "Twitter",
    color: "from-black to-slate-800",
    bgColor: "from-slate-100/40 to-white/40",
    borderColor: "border-slate-100",
    darkBg: "dark:from-slate-900/5 dark:to-slate-800",
    darkBorder: "dark:border-slate-900/20",
    textColor: "text-slate-900",
    buttonColor: "bg-slate-900 hover:bg-slate-700",
    shadowColor: "shadow-slate-200",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/twitter-7UdPUD56etBYgs0HoboaabXKV4Bx0r.png",
  },
]

export function ServiceCards({ onSelectCategory, categories, services }: ServiceCardsProps) {
  const getServiceDescription = useCallback((platformName: string) => {
    const servicesForPlatform = services.filter((s) =>
      categories.find((c) => c.id === s.category_id && c.name.toLowerCase().includes(platformName.toLowerCase()))
    )
    if (servicesForPlatform.length === 0) return "Premium services available"

    // Get a nice description based on available services
    const serviceTypes = [...new Set(servicesForPlatform.map((s) => s.name.split(" ")[0]).slice(0, 3))].join(", ")
    return `${serviceTypes} and more`
  }, [services, categories])

  const getLowestPrice = useCallback(
    (platformName: string) => {
      const servicesForPlatform = services.filter((s) =>
        categories.find((c) => c.id === s.category_id && c.name.toLowerCase().includes(platformName.toLowerCase()))
      )
      if (servicesForPlatform.length === 0) return "$0.00"

      const lowestPrice = Math.min(...servicesForPlatform.map((s) => Number(s.base_price || 0)))
      return `$${lowestPrice.toFixed(2)}`
    },
    [services, categories]
  )

  return (
    <div className="mt-16 px-3 md:px-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-poppins">Hot Offers</h2>
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold font-poppins">🔥 Limited Time</span>
          </div>
          <p className="text-slate-500 text-sm mt-2">Hand-picked best sellers</p>
        </div>
      </div>

      {/* Mobile: Horizontal Scroll */}
      <div className="md:hidden flex overflow-x-auto gap-4 pb-6 -mx-3 px-3 hide-scrollbar snap-x">
        {platformConfig.map((platform) => (
          <ServiceCard
            key={platform.name}
            platform={platform}
            description={getServiceDescription(platform.name)}
            price={getLowestPrice(platform.name)}
            onSelect={() => onSelectCategory(platform.name)}
          />
        ))}
      </div>

      {/* Desktop: Grid */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {platformConfig.map((platform) => (
          <ServiceCard
            key={platform.name}
            platform={platform}
            description={getServiceDescription(platform.name)}
            price={getLowestPrice(platform.name)}
            onSelect={() => onSelectCategory(platform.name)}
            isDesktop
          />
        ))}
      </div>
    </div>
  )
}

interface ServiceCardProps {
  platform: (typeof platformConfig)[0]
  description: string
  price: string
  onSelect: () => void
  isDesktop?: boolean
}

function ServiceCard({ platform, description, price, onSelect, isDesktop }: ServiceCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group ${
        isDesktop ? "w-full" : "min-w-[280px] snap-center flex-shrink-0"
      }`}
    >
      <div
        className={`p-5 md:p-6 rounded-2xl md:rounded-3xl bg-gradient-to-br ${platform.bgColor} ${platform.darkBg} border ${platform.borderColor} ${platform.darkBorder} shadow-md hover:shadow-lg transition-all relative overflow-hidden`}
      >
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>

        {/* Icon Container */}
        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-gradient-to-br ${platform.color} flex items-center justify-center mb-4 shadow-lg shadow-${platform.color}/30 relative z-10 group-hover:shadow-xl transition-shadow`}>
          <img
            src={platform.icon || "/placeholder.svg"}
            alt={platform.name}
            className="w-6 h-6 md:w-8 md:h-8 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h4 className="font-bold text-lg md:text-xl mb-1 text-slate-900">{platform.name} Services</h4>
          <p className="text-sm text-slate-500 mb-4 md:mb-5">{description}</p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>

          {/* Bottom section */}
          <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-slate-200/50">
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs font-semibold">STARTING AT</span>
              <span className={`font-display font-extrabold text-lg md:text-xl ${platform.textColor}`}>
                {price}
                <span className="text-sm text-slate-400 font-normal">/1k</span>
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSelect()
              }}
              className={`${platform.buttonColor} text-white px-3 md:px-4 py-2 rounded-lg md:rounded-xl font-bold text-sm shadow-lg ${platform.shadowColor} dark:shadow-none transition-all group-hover:scale-110 transform`}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
