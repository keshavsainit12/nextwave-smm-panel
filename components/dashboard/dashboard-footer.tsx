"use client"

import { Shield, Zap, RefreshCw, Code2, Truck, Star } from "lucide-react"

export function DashboardFooter() {
  const features = [
    {
      icon: Shield,
      title: "SSL Certified",
      description: "100% Secure Transactions",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Star,
      title: "Verified Badge",
      description: "Trusted by 10K+ Users",
      color: "from-amber-500 to-amber-600",
    },
    {
      icon: RefreshCw,
      title: "Money Back Guarantee",
      description: "30-Day Full Refund",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Code2,
      title: "API for Resellers",
      description: "Easy Integration & Webhooks",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Instant Order Processing",
      color: "from-red-500 to-red-600",
    },
    {
      icon: Zap,
      title: "24/7 Support",
      description: "Quick Response Time",
      color: "from-indigo-500 to-indigo-600",
    },
  ]

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4 mt-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 text-center">
          Why Choose NextWave SMM?
        </h2>
        <p className="text-center text-slate-600 font-medium">Everything you need to grow your presence</p>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            >
              {/* Icon Container */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-slate-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-600 font-medium">{feature.description}</p>
            </div>
          )
        })}
      </div>

      {/* Trust Section */}
      <div className="max-w-6xl mx-auto mt-12 bg-white rounded-2xl p-6 border border-slate-200">
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Trusted & Certified</h3>
          <p className="text-sm text-slate-600">Our platform meets industry standards and security requirements</p>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { badge: "🔒", label: "SSL Encrypted" },
            { badge: "✓", label: "GDPR Compliant" },
            { badge: "⭐", label: "99.9% Uptime" },
            { badge: "🛡️", label: "2FA Enabled" },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-50">
              <span className="text-3xl">{item.badge}</span>
              <p className="text-xs font-semibold text-slate-700 text-center">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-6xl mx-auto mt-8 text-center">
        <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
          <a 
            href="/terms-of-service" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            Terms & Conditions
          </a>
          <span className="text-slate-300">|</span>
          <a 
            href="/privacy-policy" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            Privacy Policy
          </a>
          <span className="text-slate-300">|</span>
          <a 
            href="/refund-policy" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            Refund Policy
          </a>
        </div>
        <p className="text-xs text-slate-500 font-medium">© 2024 NextWave SMM Panel. All rights reserved.</p>
      </div>
    </div>
  )
}
