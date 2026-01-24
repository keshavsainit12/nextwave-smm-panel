"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Star, Shield } from "lucide-react"

interface ServiceCarouselProps {
  onSelectCategory: (categoryName: string) => void
  onSelectService?: (service: any) => void
}

const getIconUrl = (platform: string) => {
  const iconMap: Record<string, string> = {
    Instagram: "/images/image-from-rawpixel-id-3344505-png.png",
    YouTube: "/images/youtube-20-281-29.png",
    Facebook: "/images/facebook.png",
    Telegram: "/images/telegram.png",
    Twitter: "/images/twitter.png",
  }
  return iconMap[platform as keyof typeof iconMap] || ""
}

const platformConfig = [
  {
    name: "Instagram",
    accentColor: "bg-pink-500",
    accentColorLight: "bg-pink-50",
    textAccent: "text-pink-600",
    borderAccent: "border-pink-200",
    priceRange: "$5 - $500",
    rating: 4.8,
    badge: "Verified",
  },
  {
    name: "YouTube",
    accentColor: "bg-red-500",
    accentColorLight: "bg-red-50",
    textAccent: "text-red-600",
    borderAccent: "border-red-200",
    priceRange: "$10 - $1000",
    rating: 4.9,
    badge: "Verified",
  },
  {
    name: "Facebook",
    accentColor: "bg-blue-500",
    accentColorLight: "bg-blue-50",
    textAccent: "text-blue-600",
    borderAccent: "border-blue-200",
    priceRange: "$5 - $750",
    rating: 4.7,
    badge: "Verified",
  },
  {
    name: "Telegram",
    accentColor: "bg-sky-500",
    accentColorLight: "bg-sky-50",
    textAccent: "text-sky-600",
    borderAccent: "border-sky-200",
    priceRange: "$3 - $500",
    rating: 4.9,
    badge: "Verified",
  },
  {
    name: "Twitter",
    accentColor: "bg-slate-700",
    accentColorLight: "bg-slate-50",
    textAccent: "text-slate-700",
    borderAccent: "border-slate-200",
    priceRange: "$5 - $600",
    rating: 4.6,
    badge: "Verified",
  },
]

export function MobileServiceCarousel({ onSelectCategory, onSelectService }: ServiceCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    if (!autoPlay) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % platformConfig.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [autoPlay])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setAutoPlay(false)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % platformConfig.length)
    setAutoPlay(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + platformConfig.length) % platformConfig.length)
    setAutoPlay(false)
  }

  const handleSelectService = (categoryName: string) => {
    // Emit both callbacks for carousel selection and direct service ordering
    onSelectCategory(categoryName)
    
    // Trigger a small delay then scroll to service selection
    setTimeout(() => {
      const serviceSection = document.getElementById("service-selection-section")
      if (serviceSection) {
        serviceSection.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 300)
  }

  const currentPlatform = platformConfig[currentIndex]

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-slate-900 font-poppins">🔥</h2>
          <h2 className="text-2xl font-bold text-slate-900 font-poppins">Hot Offers</h2>
          <h2 className="text-2xl font-bold text-slate-900 font-poppins">This Week</h2>
        </div>
        <p className="text-sm text-slate-500 mt-2">Limited time deals • Swipe to explore</p>
      </div>

      {/* Carousel Container */}
      <div className="relative mb-8">
        {/* Main Card */}
        <div className="bg-white border-2 rounded-3xl p-6 shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-2 cursor-pointer"
          style={{
            borderColor: currentPlatform.borderAccent.split('-')[1] === 'pink' ? '#fce7f3' :
                        currentPlatform.borderAccent.split('-')[1] === 'red' ? '#fee2e2' :
                        currentPlatform.borderAccent.split('-')[1] === 'blue' ? '#dbeafe' :
                        currentPlatform.borderAccent.split('-')[1] === 'sky' ? '#e0f2fe' :
                        '#f1f5f9'
          }}
        >
          {/* Top Section - Platform Info & Badge */}
          <div className="flex justify-between items-start gap-3 mb-6">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Icon */}
              <div className={`${currentPlatform.accentColorLight} rounded-2xl p-3 flex items-center justify-center flex-shrink-0 w-20 h-20`}>
                <img
                  src={getIconUrl(currentPlatform.name) || "/placeholder.svg"}
                  alt={currentPlatform.name}
                  className="w-16 h-16 object-contain"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              </div>
              {/* Platform Name */}
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-slate-900 font-poppins truncate">{currentPlatform.name}</h3>
                <p className={`text-xs font-semibold ${currentPlatform.textAccent}`}>Social Platform</p>
              </div>
            </div>
            {/* Trust Badge - Inside card */}
            <div className={`${currentPlatform.accentColor} text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 flex-shrink-0 whitespace-nowrap`}>
              <Shield className="w-3 h-3" />
              {currentPlatform.badge}
            </div>
          </div>

          {/* Rating Section */}
          <div className="flex items-center gap-2 mb-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(currentPlatform.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-700">{currentPlatform.rating}</span>
            <span className="text-xs text-slate-500">(1000+ reviews)</span>
          </div>

          {/* Price & Details Section */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className={`${currentPlatform.accentColorLight} rounded-xl p-3`}>
                <p className="text-xs text-slate-600 font-semibold mb-1">Price Range</p>
                <p className={`text-lg font-bold ${currentPlatform.textAccent}`}>{currentPlatform.priceRange}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                <p className="text-xs text-slate-600 font-semibold mb-1">Delivery</p>
                <p className="text-lg font-bold text-green-600">Instant</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <button
            onClick={() => handleSelectService(currentPlatform.name)}
            className={`w-full ${currentPlatform.accentColor} text-white py-3 rounded-xl font-bold transition-all duration-200 hover:opacity-90 active:scale-95 font-poppins mb-5`}
          >
            Choose Service
          </button>

          {/* Trust Badges Footer */}
          <div className="border-t border-slate-200 pt-4 mt-4 flex justify-around items-center text-xs w-full">
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-bold text-slate-700 text-xs">Secure</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <span className="font-bold text-slate-700 text-xs">Trusted</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-bold text-slate-700 text-xs">Fast</span>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-20 bg-white shadow-lg rounded-full p-3 hover:bg-slate-50 transition-colors border border-slate-200"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-20 bg-white shadow-lg rounded-full p-3 hover:bg-slate-50 transition-colors border border-slate-200"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {/* Dot Navigation */}
      <div className="flex justify-center gap-2 mt-8">
        {platformConfig.map((platform, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex 
                ? `${platform.accentColor} w-8 h-2` 
                : "bg-slate-200 w-2 h-2"
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
