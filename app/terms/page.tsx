import Link from 'next/link'

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 transition-colors">
          ← Home
        </Link>
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-slate-700">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p>By using NextWave, you agree to comply with these terms and conditions. If you do not agree, please do not use our service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">2. Service Description</h2>
            <p>NextWave provides social media growth services including likes, followers, views, and other engagement metrics across various platforms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">3. User Responsibilities</h2>
            <p>Users are responsible for maintaining confidentiality of their account credentials. You agree not to use the service for any illegal purposes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">4. Payment and Refunds</h2>
            <p>Payment is required before service delivery. We offer a 100% money-back guarantee if the service is not delivered as promised.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">5. Limitation of Liability</h2>
            <p>NextWave is not liable for any indirect, incidental, or consequential damages arising from the use of our service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">6. Termination</h2>
            <p>We reserve the right to terminate accounts that violate our terms or engage in fraudulent activity.</p>
          </section>

          <p className="text-sm text-slate-500 mt-12">Last updated: January 2026</p>
        </div>
      </div>
    </div>
  )
}
