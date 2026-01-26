"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CouponPasteCard } from "@/components/dashboard/coupon-paste-card"

interface Service {
  id: string
  name: string
  price: number
  icon?: string
}

interface CategoryData {
  name: string
  services: Service[]
}

export function QuickOrderSection() {
  const router = useRouter()
  const [selectedPlatform, setSelectedPlatform] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [url, setUrl] = useState("")
  const [services, setServices] = useState<Record<string, CategoryData>>({})
  const [loading, setLoading] = useState(true)
  const [couponDiscount, setCouponDiscount] = useState(0)

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/v1/services")
        const data = await response.json()

        if (data.services && Array.isArray(data.services)) {
          // Group services by category
          const grouped: Record<string, CategoryData> = {}

          data.services.forEach((service: any) => {
            const category = service.category || "Other"
            if (!grouped[category.toLowerCase()]) {
              grouped[category.toLowerCase()] = {
                name: category,
                services: [],
              }
            }
            grouped[category.toLowerCase()].services.push({
              id: service.id,
              name: service.name,
              price: service.price,
              icon: service.icon,
            })
          })

          setServices(grouped)
          
          // Set first category and service as default
          const firstCategory = Object.keys(grouped)[0]
          if (firstCategory) {
            setSelectedPlatform(firstCategory)
            setSelectedService(grouped[firstCategory].services[0]?.id || "")
          }
        }
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const currentPlatformData = services[selectedPlatform]
  const currentService = currentPlatformData?.services.find((s) => s.id === selectedService)
  const basePrice = currentService?.price || 0
  const finalPrice = couponDiscount > 0 ? basePrice * (1 - couponDiscount / 100) : basePrice

  const handlePlaceOrder = () => {
    if (!url.trim()) {
      alert("Please enter a valid URL or username")
      return
    }
    if (!selectedService) {
      alert("Please select a service")
      return
    }
    router.push(
      `/auth/signup?platform=${selectedPlatform}&service=${selectedService}&url=${encodeURIComponent(url)}&price=${finalPrice}`
    )
  }

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-b from-white to-slate-50">
        <div className="container px-4">
          <div className="max-w-2xl">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="text-center text-slate-500">Loading services...</div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="container px-4">
        {/* Coupon Card */}
        <div className="max-w-2xl mb-8">
          <CouponPasteCard onCouponApplied={(couponCode) => {
            fetch("/api/v1/validate-coupon", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ couponCode }),
            })
              .then(res => res.json())
              .then(data => {
                if (data.valid && data.discount) {
                  setCouponDiscount(data.discount)
                }
              })
              .catch(err => console.error(err))
          }} />
        </div>

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
                  setSelectedService(services[value]?.services[0]?.id || "")
                }}>
                  <SelectTrigger className="h-10 bg-white">
                    <SelectValue placeholder="Select a platform" />
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
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentPlatformData?.services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - ${service.price}
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
                  <span className="text-2xl font-bold text-blue-600">${finalPrice.toFixed(2)}</span>
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
