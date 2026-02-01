'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CouponPasteCard } from '@/components/dashboard/coupon-paste-card'

export default function LandingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [services, setServices] = useState<Array<any>>([])
  const [selectedService, setSelectedService] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [quantity, setQuantity] = useState(100)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [deliveryProtocol, setDeliveryProtocol] = useState('instant')
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactFormData, setContactFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showServiceDropdown, setShowServiceDropdown] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)

  // Handle OAuth callback redirect
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      console.log('[v0] OAuth code detected on landing page, redirecting to callback...')
      router.push(`/auth/callback?code=${code}`)
    }
  }, [searchParams, router])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/v1/services')
        if (response.ok) {
          const data = await response.json()
          setServices(data.services || [])
        }
      } catch (error) {
        console.error('[v0] Error fetching services:', error)
        setError('Unable to load services')
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const handlePlaceOrder = () => {
    router.push('/auth/login')
  }

  const handleSubmitContact = async () => {
    if (!contactFormData.name || !contactFormData.email || !contactFormData.subject || !contactFormData.message) {
      alert('Please fill all fields')
      return
    }
    try {
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactFormData),
      })
      if (response.ok) {
        alert('Your message has been sent! We will get back to you soon.')
        setContactFormData({ name: '', email: '', subject: '', message: '' })
        setShowContactForm(false)
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      alert('Error sending message')
    }
  }

  const selectedServiceData = services.find((s) => s.id === selectedService)
  const basePrice = selectedServiceData ? ((quantity / 1000) * Number(selectedServiceData.price)) : 0
  const finalPrice = couponDiscount > 0 ? (basePrice * (1 - couponDiscount / 100)).toFixed(2) : basePrice.toFixed(2)

  return (
    <div className="bg-white text-slate-900">
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-white overflow-hidden">
        <div className="absolute w-[500px] h-[500px] -top-[10%] -left-[20%] rounded-full blur-[80px] opacity-40 bg-gradient-to-br from-blue-600 to-transparent"></div>
        <div className="absolute w-[400px] h-[400px] top-[40%] -right-[10%] rounded-full blur-[80px] opacity-40 bg-gradient-to-br from-cyan-500 to-transparent"></div>
        <div className="absolute w-[300px] h-[300px] bottom-[5%] left-[10%] rounded-full blur-[80px] opacity-40 bg-gradient-to-br from-blue-600 to-transparent"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-white to-blue-50 shadow-sm border border-blue-100">
              <span className="text-blue-600 text-lg font-bold">✦</span>
            </div>
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-slate-900">NextWave</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/auth/signup" className="hidden sm:block bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-xs md:text-sm px-4 md:px-6 py-2 md:py-2.5 rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95 uppercase tracking-widest">
              Sign Up
            </Link>
            <Link href="/auth/login" className="bg-white/70 backdrop-blur-md border border-blue-200 text-slate-900 font-bold text-xs md:text-sm px-3 md:px-5 py-2 md:py-2.5 rounded-lg hover:bg-white/90 hover:shadow-md transition-all active:scale-95 uppercase tracking-widest">
              Log In
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 pt-10">
          {/* Hero Section with Floating Icons */}
          <div className="relative text-center mb-16">
            {/* Floating Social Icons */}
            <div className="absolute -top-12 left-0 flex flex-col gap-12">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-white to-blue-50 shadow-md border border-blue-100 transform -rotate-12 overflow-hidden">
                <img src="/instagram-icon.png" alt="Instagram" className="w-10 h-10 object-cover" />
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-white to-blue-50 shadow-md border border-blue-100 transform rotate-[8deg] ml-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
                </svg>
              </div>
            </div>

            {/* Right Floating Icons */}
            <div className="absolute -top-8 right-0 flex flex-col gap-14">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-white to-blue-50 shadow-md border border-blue-100 transform rotate-[15deg]">
                <svg className="w-7 h-7" fill="#FF0000" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-white to-blue-50 shadow-md border border-blue-100 transform -rotate-[10deg] mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
            </div>

            {/* Hero Text */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl text-slate-900 font-extrabold leading-tight mb-6 px-2 md:px-0 md:max-w-3xl md:mx-auto">
              Digital <span className="italic font-normal text-blue-600">Momentum</span>
            </h1>
            <p className="text-slate-600 text-lg md:text-xl lg:text-2xl font-light leading-relaxed max-w-xs md:max-w-2xl mx-auto mb-10">
              High-velocity growth strategies for the next generation of brands.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 px-4 md:px-0 md:justify-center md:max-w-2xl md:mx-auto">
              <button onClick={handlePlaceOrder} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 md:py-5 md:px-12 rounded-2xl font-bold text-lg md:text-base active:scale-95 transition-all shadow-lg hover:shadow-xl md:flex-1 lg:flex-none">
                Order Now
              </button>
              <Link href="/auth/signup" className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 py-4 md:py-5 md:px-12 rounded-2xl font-bold text-lg md:text-base active:scale-95 transition-all shadow-lg hover:shadow-xl md:flex-1 lg:flex-none text-center flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Become VIP
              </Link>
            </div>
            
            {/* Starting Price Badge */}
            <div className="mt-6 flex justify-center">
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Services starting from just $0.01
              </div>
            </div>
          </div>

          {/* Quick Order Section */}
          <section className="mb-12 md:mb-20">
            {/* Coupon Card */}
            <div className="md:max-w-5xl md:mx-auto mb-6">
              <CouponPasteCard onCouponApplied={(couponCode, discount) => {
                if (typeof discount === 'number' && discount > 0) {
                  setCouponDiscount(discount)
                }
              }} />
            </div>

            <div className="bg-white/40 backdrop-blur-[40px] rounded-[2.5rem] p-8 md:p-12 lg:p-16 overflow-hidden border border-white/20 shadow-lg md:max-w-5xl md:mx-auto">
              {/* Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-2 rounded-full bg-blue-600 shadow-lg"></div>
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-500">Precision Order</h3>
              </div>

              {/* Form - Desktop: 3 column grid, Mobile: stacked */}
              <div className="space-y-5 md:space-y-0 md:grid md:grid-cols-3 md:gap-6 md:items-end">
                {/* Category Dropdown - FIRST */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Category</label>
                  <div className="relative w-full">
                    <button
                      type="button"
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="w-full bg-white/50 border border-white/30 rounded-2xl h-12 px-4 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm flex items-center justify-between gap-3"
                    >
                      <span className="truncate text-left">{selectedCategory || 'Select Category'}</span>
                      <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {showCategoryDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg z-50 max-h-56 overflow-y-auto">
                        {Array.from(new Set(services.flatMap((s: any) => s.categories || []))).map((cat: any) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat)
                              setSelectedService('')
                              setShowCategoryDropdown(false)
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-slate-900 font-medium hover:bg-blue-100/50 transition-colors border-b border-white/20 last:border-b-0"
                          >
                            {String(cat).slice(0, 60)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Services Dropdown - SECOND (based on category) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Service</label>
                  <div className="relative w-full">
                    <button
                      type="button"
                      onClick={() => selectedCategory && setShowServiceDropdown(!showServiceDropdown)}
                      disabled={!selectedCategory}
                      className={`w-full bg-white/50 border border-white/30 rounded-2xl h-12 px-4 text-sm font-medium transition-all shadow-sm flex items-center justify-between gap-3 ${
                        !selectedCategory ? 'opacity-50 cursor-not-allowed text-slate-400' : 'text-slate-900 focus:ring-2 focus:ring-blue-500/30'
                      }`}
                    >
                      <span className="truncate text-left">{selectedService ? services.find(s => s.id === selectedService)?.name || services.find(s => s.id === selectedService)?.platform || 'Select Service' : 'Select Service'}</span>
                      <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {showServiceDropdown && selectedCategory && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg z-50 max-h-56 overflow-y-auto">
                        {services.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-slate-500">No services available</div>
                        ) : (
                          services
                            .filter((s: any) => s.category === selectedCategory)
                            .map((service) => (
                              <button
                                key={service.id}
                                type="button"
                                onClick={() => {
                                  setSelectedService(service.id)
                                  setQuantity(service.min || 100)
                                  setShowServiceDropdown(false)
                                }}
                                className="w-full text-left px-4 py-3 text-sm text-slate-900 font-medium hover:bg-blue-100/50 transition-colors border-b border-white/20 last:border-b-0"
                              >
                                {String(service.name || service.platform).slice(0, 60)}
                              </button>
                            ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-white/50 border border-white/30 rounded-2xl h-12 px-4 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm"
                    placeholder="Enter quantity"
                  />
                </div>

                {/* Username/Link Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Username / Link</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/50 border border-white/30 rounded-2xl h-12 px-4 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm"
                    placeholder="Enter username or link"
                  />
                </div>

                {/* Price Display and Action */}
                <div className="bg-white/50 rounded-3xl p-6 flex justify-between items-end border border-white/50 shadow-inner mt-6">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Estimate</p>
                    {couponDiscount > 0 && (
                      <p className="text-xs text-green-600 font-semibold mb-1">
                        {couponDiscount}% Discount Applied
                      </p>
                    )}
                    <p className="text-3xl font-extrabold text-slate-900">${finalPrice}</p>
                  </div>
                  <button onClick={handlePlaceOrder} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white w-14 h-14 rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-lg hover:shadow-xl">
                    →
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-16 md:max-w-5xl md:mx-auto">
            <div className="bg-white/40 backdrop-blur-[40px] rounded-3xl md:rounded-4xl p-6 md:p-12 text-center border border-white/20 md:border-white/30 md:shadow-lg">
              <p className="text-2xl md:text-5xl lg:text-6xl font-extrabold text-slate-900">24.8M+</p>
              <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-slate-400 mt-1 md:mt-3">Managed Nodes</p>
            </div>
            <div className="bg-white/40 backdrop-blur-[40px] rounded-3xl md:rounded-4xl p-6 md:p-12 text-center border border-white/20 md:border-white/30 md:shadow-lg">
              <p className="text-2xl md:text-5xl lg:text-6xl font-extrabold text-slate-900">99.9%</p>
              <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-slate-400 mt-1 md:mt-3">Uptime SLA</p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-20 md:mb-32 md:max-w-5xl md:mx-auto">
            {/* SSL Certificate */}
            <div className="bg-white/40 backdrop-blur-[40px] rounded-3xl md:rounded-2xl p-6 md:p-8 border border-white/20 md:border-white/30 hover:border-white/50 transition-all md:shadow-sm hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-bold text-slate-900 uppercase">256-bit SSL</p>
                  <p className="text-[10px] text-slate-500 mt-1">Enterprise encryption</p>
                </div>
              </div>
            </div>

            {/* API Feature */}
            <div className="bg-white/40 backdrop-blur-[40px] rounded-3xl md:rounded-2xl p-6 md:p-8 border border-white/20 md:border-white/30 hover:border-white/50 transition-all md:shadow-sm hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-bold text-slate-900 uppercase">API Available</p>
                  <p className="text-[10px] text-slate-500 mt-1">For advanced users</p>
                </div>
              </div>
            </div>

            {/* Canceled Refund */}
            <div className="bg-white/40 backdrop-blur-[40px] rounded-3xl md:rounded-2xl p-6 md:p-8 border border-white/20 md:border-white/30 hover:border-white/50 transition-all md:shadow-sm hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-bold text-slate-900 uppercase">Refund Policy</p>
                  <p className="text-[10px] text-slate-500 mt-1">100% money back</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white/40 backdrop-blur-[40px] rounded-3xl md:rounded-2xl p-6 md:p-8 border border-white/20 md:border-white/30 hover:border-white/50 transition-all md:shadow-sm hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-bold text-slate-900 uppercase">Fast Delivery</p>
                  <p className="text-[10px] text-slate-500 mt-1">Instant processing</p>
                </div>
              </div>
            </div>
          </div>

          {/* VIP Membership Section */}
          <section className="mb-20 md:mb-32 md:max-w-5xl md:mx-auto">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-[2.5rem] p-8 md:p-12 border border-amber-200/50 shadow-lg overflow-hidden relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">VIP Membership</h2>
                    <p className="text-sm text-amber-700 font-medium">Unlock exclusive benefits</p>
                  </div>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-amber-200/50">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Up to 50% Off</h3>
                    <p className="text-xs text-slate-600">Exclusive VIP pricing on all services</p>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-amber-200/50">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Priority Processing</h3>
                    <p className="text-xs text-slate-600">Your orders get processed first</p>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-amber-200/50">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">24/7 VIP Support</h3>
                    <p className="text-xs text-slate-600">Dedicated support team for VIPs</p>
                  </div>
                </div>

                {/* Upgrade Criteria */}
                <div className="bg-white/50 rounded-2xl p-5 mb-6 border border-amber-200/30">
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    How to Become VIP
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold">1</div>
                      <span className="text-slate-700">Spend $500+ total on orders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold">2</div>
                      <span className="text-slate-700">Complete 50+ orders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold">3</div>
                      <span className="text-slate-700">Or contact support for bulk deals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">✓</div>
                      <span className="text-slate-700">Auto-upgrade when eligible</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/auth/signup" className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 py-4 px-8 rounded-2xl font-bold text-center active:scale-95 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    Start Your VIP Journey
                  </Link>
                  <button onClick={handlePlaceOrder} className="flex-1 bg-white border-2 border-amber-300 text-amber-700 py-4 px-8 rounded-2xl font-bold text-center active:scale-95 transition-all hover:bg-amber-50">
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 px-6 md:px-12 py-12 md:py-20 md:border-t md:border-slate-800">
          <div className="max-w-full md:max-w-5xl md:mx-auto">
            {/* Mobile Layout */}
            <div className="md:hidden flex flex-col items-center gap-8">
              <img src="/nextwave-logo.png" alt="NextWave SMM" className="h-12 object-contain" />
              
              <div className="flex flex-col items-center gap-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
                <Link href="/terms-of-service" className="hover:text-blue-400 transition-colors">Terms & Conditions</Link>
                <Link href="/refund-policy" className="hover:text-blue-400 transition-colors">Refund Policy</Link>
                <button onClick={() => setShowContactForm(true)} className="hover:text-blue-400 transition-colors">Contact Us</button>
              </div>

              <p className="text-[9px] text-slate-400 font-bold tracking-[0.25em] uppercase">© 2024 NextWave Systems</p>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex md:items-center md:justify-between md:gap-12">
              <img src="/nextwave-logo.png" alt="NextWave SMM" className="h-14 object-contain" />
              
              <div className="flex gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
                <Link href="/terms-of-service" className="hover:text-blue-400 transition-colors">Terms & Conditions</Link>
                <Link href="/refund-policy" className="hover:text-blue-400 transition-colors">Refund Policy</Link>
                <button onClick={() => setShowContactForm(true)} className="hover:text-blue-400 transition-colors">Contact Us</button>
              </div>

              <p className="text-[9px] text-slate-400 font-bold tracking-[0.25em] uppercase">© 2024 NextWave Systems</p>
            </div>
          </div>
        </footer>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 md:p-12 max-w-md md:max-w-lg w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Get In Touch</h2>
                <button onClick={() => setShowContactForm(false)} className="text-slate-400 hover:text-slate-900 text-2xl">×</button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Name</label>
                  <input
                    type="text"
                    value={contactFormData.name}
                    onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                    className="w-full bg-white/50 border border-slate-200 rounded-2xl h-12 px-4 text-sm mt-2 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email</label>
                  <input
                    type="email"
                    value={contactFormData.email}
                    onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                    className="w-full bg-white/50 border border-slate-200 rounded-2xl h-12 px-4 text-sm mt-2 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Subject</label>
                  <input
                    type="text"
                    value={contactFormData.subject}
                    onChange={(e) => setContactFormData({ ...contactFormData, subject: e.target.value })}
                    className="w-full bg-white/50 border border-slate-200 rounded-2xl h-12 px-4 text-sm mt-2 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Message</label>
                  <textarea
                    value={contactFormData.message}
                    onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                    className="w-full bg-white/50 border border-slate-200 rounded-2xl p-4 text-sm mt-2 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all resize-none"
                    placeholder="Tell us more..."
                    rows={4}
                  />
                </div>

                <button
                  onClick={handleSubmitContact}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-2xl hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
