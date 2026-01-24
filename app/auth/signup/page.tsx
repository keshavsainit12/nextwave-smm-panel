"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { signupUser } from "@/app/actions/auth"

function SignupContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const validateForm = () => {
    if (!fullName.trim()) {
      setError("Full name is required")
      return false
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email")
      return false
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return false
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await signupUser({
        email,
        password,
        fullName,
        referralCode: referralCode || undefined,
      })

      if (!result.success) {
        throw new Error(result.error || "Signup failed")
      }

      const supabase = createClient()
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) throw loginError

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: unknown) {
      let errorMessage = "An error occurred during signup"
      if (error instanceof Error) {
        if (error.message.includes("already registered") || error.message.includes("already exists")) {
          errorMessage = "This email is already registered. Please login instead."
        } else {
          errorMessage = error.message
        }
      }
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const redirectUrl = process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
        : `${window.location.origin}/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-up failed")
      setIsGoogleLoading(false)
    }
  }

  if (success) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-transparent">
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-40 bg-blue-500 -top-32 -left-32"></div>
          <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-40 bg-cyan-500 top-1/3 -right-20"></div>
          <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-30 bg-blue-400 -bottom-20 left-1/4"></div>
        </div>

        <div className="relative w-full max-w-md z-10 text-center space-y-6">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Account created!</h2>
              <p className="text-sm sm:text-base text-slate-600">Redirecting to your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-transparent">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-40 bg-blue-500 -top-32 -left-32"></div>
        <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-40 bg-cyan-500 top-1/3 -right-20"></div>
        <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-30 bg-blue-400 -bottom-20 left-1/4"></div>
      </div>

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

        <div className="bg-white/80 backdrop-blur rounded-3xl border border-white/50 shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm sm:text-base">✦</span>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create account</h1>
              <p className="text-sm sm:text-base text-slate-600 font-light">Join NextWave and start managing your services</p>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-600">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white/50 border border-white/30 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all disabled:opacity-50"
              />
            </div>

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

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-600">
                Password
              </label>
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
              <p className="text-xs text-slate-500">Minimum 8 characters</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-600">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white/50 border border-white/30 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="referralCode" className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-600">
                Referral Code (Optional)
              </label>
              <input
                id="referralCode"
                type="text"
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white/50 border border-white/30 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50/80 backdrop-blur border border-red-200/50 p-3 sm:p-4 rounded-2xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 sm:py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                "Create account"
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300/50"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white/80 text-slate-500 font-medium">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
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

          <div className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </div>

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

export default function SignupPage() {
  return <SignupContent />
}
