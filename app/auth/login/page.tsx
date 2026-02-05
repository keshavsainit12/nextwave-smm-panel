"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
// Temporarily disabled reCAPTCHA
// import Script from "next/script"
// import { RECAPTCHA_SITE_KEY } from "@/lib/recaptcha-config"

function LoginContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  // Temporarily disabled reCAPTCHA
  // const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  // const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  // Temporarily disabled reCAPTCHA functions
  /*
  const handleRecaptchaChange = (token: string | null) => {
    console.log("[v0] reCAPTCHA token received:", token ? "✓ Valid" : "✗ Null")
    setCaptchaToken(token)
    if (token) {
      setError(null)
    }
  }

  const loadRecaptcha = () => {
    if (!RECAPTCHA_SITE_KEY) {
      console.log("[v0] reCAPTCHA not configured - skipping")
      return
    }

    console.log("[v0] reCAPTCHA API script loaded successfully")
    setRecaptchaLoaded(true)
    
    // Wait for DOM to be ready, then render reCAPTCHA
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).grecaptcha) {
        try {
          const container = document.getElementById('recaptcha-container')
          if (container && !container.hasChildNodes()) {
            (window as any).grecaptcha.render('recaptcha-container', {
              sitekey: RECAPTCHA_SITE_KEY,
              callback: handleRecaptchaChange,
              'expired-callback': () => handleRecaptchaChange(null),
              'error-callback': () => {
                console.error("[v0] reCAPTCHA error occurred")
                setError("reCAPTCHA verification failed. Please try again.")
              }
            })
            console.log("[v0] reCAPTCHA widget rendered")
          }
        } catch (err) {
          console.error("[v0] reCAPTCHA render error:", err)
        }
      }
    }, 100)
  }
  */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Temporarily disabled reCAPTCHA validation
    // if (RECAPTCHA_SITE_KEY && !captchaToken) {
    //   setError("Please complete the reCAPTCHA verification")
    //   return
    // }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      const { data: userData } = await supabase.from("users").select("role").eq("email", email).single()

      if (userData?.role === "admin") {
        router.push("/admin-panel-2024")
      } else {
        router.push("/dashboard")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const callbackUrl = `${window.location.origin}/auth/callback`
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      })
      
      if (error) throw error
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Google sign-in failed"
      setError(errorMsg)
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-transparent">
      {/* Temporarily disabled reCAPTCHA */}
      {/* {RECAPTCHA_SITE_KEY && (
        <Script
          src="https://www.google.com/recaptcha/api.js"
          strategy="afterInteractive"
          onLoad={loadRecaptcha}
          onError={() => {
            console.error("[v0] Failed to load reCAPTCHA script")
            setError("Failed to load reCAPTCHA. Please refresh the page.")
          }}
        />
      )} */}

      {/* Animated blob background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-40 bg-blue-500 -top-32 -left-32"></div>
        <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-40 bg-cyan-500 top-1/3 -right-20"></div>
        <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-30 bg-blue-400 -bottom-20 left-1/4"></div>
      </div>
      
      {/* Login card */}
      <div className="relative w-full max-w-md z-10">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>

        {/* Clean glass card */}
        <div className="bg-white/80 backdrop-blur rounded-3xl border border-white/50 shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm sm:text-base">✦</span>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Welcome back</h1>
              <p className="text-sm sm:text-base text-slate-600 font-light">Enter your credentials to access your account</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-600">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white/50 border border-white/30 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-600">
                  Password
                </label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-xs text-blue-600 hover:text-blue-700 transition-colors font-semibold"
                >
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white/50 border border-white/30 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all disabled:opacity-50"
              />
            </div>

            {/* Temporarily disabled reCAPTCHA */}
            {/* {RECAPTCHA_SITE_KEY ? (
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-600">
                  Verification
                </label>
                <div 
                  id="recaptcha-container" 
                  className="flex justify-center"
                  data-sitekey={RECAPTCHA_SITE_KEY}
                />
                {recaptchaLoaded && !captchaToken && (
                  <p className="text-xs text-slate-500">Please complete the verification above</p>
                )}
              </div>
            ) : (
              // Development notice when reCAPTCHA is not configured
              process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
                  <p className="text-yellow-800 font-semibold mb-1">⚠️ reCAPTCHA Not Configured</p>
                  <p className="text-yellow-700">
                    reCAPTCHA will show after you add <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code> in Vercel environment variables.
                  </p>
                </div>
              )
            )} */}

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50/80 backdrop-blur border border-red-200/50 p-3 sm:p-4 rounded-2xl">
                {error}
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 sm:py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign in"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300/50"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white/80 text-slate-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full bg-white/60 hover:bg-white border border-white/50 text-slate-900 font-medium py-3 sm:py-4 rounded-2xl shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm">Google</span>
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Sign up
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center gap-4 text-xs text-slate-500">
          <Link href="/privacy-policy" className="hover:text-slate-700 transition-colors">
            Privacy
          </Link>
          <span>•</span>
          <Link href="/terms-of-service" className="hover:text-slate-700 transition-colors">
            Terms
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-slate-700 transition-colors">
            Support
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <LoginContent />
}
