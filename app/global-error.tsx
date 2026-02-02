'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('[v0] Global error caught:', error)
  
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Temporary Issue
              </h2>
              <p className="text-gray-600 mb-6">
                We're experiencing a temporary technical issue. Your data is safe.
              </p>
              {error.digest && (
                <p className="text-xs text-gray-400 mb-6">
                  Reference: {error.digest}
                </p>
              )}
              <div className="space-y-3">
                <button
                  onClick={reset}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Try Again
                </button>
                <a
                  href="/auth/login"
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
                >
                  Go to Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
