'use client';

import Link from 'next/link'

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 transition-colors">
          ← Home
        </Link>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Refund Policy</h1>
        
        <div className="space-y-6 text-slate-700">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">100% Money Back Guarantee</h2>
            <p>We stand behind our services with a full money-back guarantee. If you're not satisfied with your purchase, we'll refund 100% of your payment.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Refund Conditions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refunds are available for incomplete or non-delivered services</li>
              <li>Partial refunds are offered based on the percentage of service completed</li>
              <li>Requests must be submitted within 30 days of purchase</li>
              <li>Refunds are processed within 5-7 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">How to Request a Refund</h2>
            <p>To request a refund, contact our support team with your order ID and reason for the refund. We'll review your request and process it promptly.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Support</h2>
            <p>Have questions? <Link href="/" onClick={(e) => { e.preventDefault(); document.querySelector('button')?.click(); }} className="text-blue-600 hover:underline">Contact us</Link> and we'll help you out!</p>
          </section>
        </div>
      </div>
    </div>
  )
}
