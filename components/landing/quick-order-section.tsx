"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export function QuickOrderSection() {
  const router = useRouter()
  const [selectedPlatform, setSelectedPlatform] = useState("instagram")
  const [selectedService, setSelectedService] = useState("followers")
  const [url, setUrl] = useState("")

  const services: Record<string, { name: string; services: Array<{ id: string; name: string; price: number }> }> = {
    instagram: {
      name: "Instagram",
      services: [
        { id: "followers", name: "Real Followers (Refill 30d)", price: 2.99 },
        { id: "likes", name: "Real Likes", price: 0.99 },
        { id: "views", name: "Real Views", price: 1.49 },
        { id: "comments", name: "Real Comments", price: 3.99 },
      ],
    },
    tiktok: {
      name: "TikTok",
      services: [
        { id: "followers", name: "Real Followers (Refill 30d)", price: 1.2 },
        { id: "likes", name: "Real Likes", price: 0.49 },
        { id: "views", name: "Real Views", price: 0.19 },
        { id: "shares", name: "Real Shares", price: 2.99 },
      ],
    },
    youtube: {
      name: "YouTube",
      services: [
        { id: "subscribers", name: "Real Subscribers (Refill 30d)", price: 4.99 },
        { id: "views", name: "Real Views", price: 0.6 },
        { id: "likes", name: "Real Likes", price: 1.99 },
        { id: "comments", name: "Real Comments", price: 2.99 },
      ],
    },
    facebook: {
      name: "Facebook",
      services: [
        { id: "followers", name: "Page Followers", price: 1.99 },
        { id: "likes", name: "Page Likes", price: 0.79 },
        { id: "shares", name: "Post Shares", price: 2.49 },
        { id: "comments", name: "Post Comments", price: 1.49 },
      ],
    },
    twitter: {
      name: "Twitter",
      services: [
        { id: "followers", name: "Real Followers (Refill 30d)", price: 8.9 },
        { id: "likes", name: "Real Likes", price: 0.99 },
        { id: "retweets", name: "Real Retweets", price: 1.99 },
        { id: "comments", name: "Real Replies", price: 2.49 },
      ],
    },
    telegram: {
      name: "Telegram",
      services: [
        { id: "members", name: "Real Members (Refill 30d)", price: 3.99 },
        { id: "views", name: "Post Views", price: 0.99 },
        { id: "reactions", name: "Reactions", price: 1.99 },
        { id: "shares", name: "Post Shares", price: 2.99 },
      ],
    },
  }

  const currentPlatformData = services[selectedPlatform]
  const currentService = currentPlatformData.services.find((s) => s.id === selectedService)
  const price = currentService?.price || 0

  const handlePlaceOrder = () => {
    if (!url.trim()) {
      alert("Please enter a valid URL or username")
      return
    }
    router.push(
      `/auth/signup?platform=${selectedPlatform}&service=${selectedService}&url=${encodeURIComponent(url)}&price=${price}`
    )
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="container px-4">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Quick Order</h2>
          <p className="text-slate-600">Select your service and get started instantly</p>
        </div>

        {/* Compact Order Form */}
        <div className="max-w-2xl">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            {/* Form Grid */}
            <div className="space-y-4">
              {/* Platform Selector */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Platform</label>
                <Select value={selectedPlatform} onValueChange={(value) => {
                  setSelectedPlatform(value)
                  setSelectedService(services[value].services[0].id)
                }}>
                  <SelectTrigger className="h-10 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(services).map(([key, data]) => (
                      <SelectItem key={key} value={key}>
                        {data.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Selector */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Service</label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="h-10 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentPlatformData.services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Username or URL</label>
                <Input
                  placeholder="https://instagram.com/username"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>

              {/* Price Display & Button Row */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-semibold text-slate-600">Price:</span>
                  <span className="text-2xl font-bold text-blue-600">${price.toFixed(2)}</span>
                </div>
                <Button onClick={handlePlaceOrder} className="h-10 px-6 font-semibold">
                  Place Order
                </Button>
              </div>
            </div>

            {/* Payment Methods Footer */}
            <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              <p className="mb-2">Payments: VISA • Mastercard • PayPal • Bitcoin</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
