'use client'

import Link from 'next/link'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 transition-colors">
          ← Home
        </Link>
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-slate-700">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, such as when you create an account or place an order. This includes your name, email, username, and transaction history.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">2. How We Use Your Information</h2>
            <p>Your information is used to process orders, improve our services, communicate with you, and maintain your account. We do not sell or share your personal data with third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">3. Data Security</h2>
            <p>We use 256-bit SSL encryption to protect your data. Your account information is secured with industry-standard security measures.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">4. Cookies</h2>
            <p>We use cookies to enhance your experience. You can control cookie settings in your browser preferences.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">5. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any significant changes via email.</p>
          </section>

          <p className="text-sm text-slate-500 mt-12">Last updated: January 2026</p>
        </div>
      </div>
    </div>
  )
}
