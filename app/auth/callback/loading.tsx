/**
 * Loading UI for OAuth callback processing
 * Displayed while the callback route is processing authentication
 */
export default function CallbackLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Animated spinner */}
        <div className="mb-6">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
        </div>
        
        {/* Loading text */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Completing Sign In...
        </h2>
        
        <p className="text-gray-600 mb-4">
          Please wait while we verify your credentials and set up your account.
        </p>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  )
}
