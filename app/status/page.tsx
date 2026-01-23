import Link from 'next/link'

export default function Status() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 transition-colors">
          ← Home
        </Link>
        <h1 className="text-4xl font-bold text-slate-900 mb-8">System Status</h1>
        
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-blue-100 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Service Status</h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-green-600 font-bold">All Systems Operational</span>
              </div>
            </div>
            <p className="text-slate-600">All NextWave services are running smoothly with 99.9% uptime.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Service Components</h3>
            
            <div className="bg-white rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">API Services</p>
                  <p className="text-sm text-slate-600">Order processing and delivery</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-green-600 text-sm font-bold">Operational</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Database</p>
                  <p className="text-sm text-slate-600">User accounts and transactions</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-green-600 text-sm font-bold">Operational</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Website</p>
                  <p className="text-sm text-slate-600">Landing page and dashboard</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-green-600 text-sm font-bold">Operational</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <p className="text-sm text-slate-600">
              For more information about our uptime and reliability, visit our status dashboard. Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
