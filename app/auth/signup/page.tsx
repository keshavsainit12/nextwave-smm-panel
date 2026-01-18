"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { signupUser } from "@/app/actions/auth"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    if (!fullName.trim()) {
      setError("Full name is required")
      setIsLoading(false)
      return
    }

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

      if (loginError) {
        throw loginError
      }

      router.push("/dashboard")
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

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-blue-600 to-purple-700">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />

      <div className="relative w-full max-w-md z-10">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>
        <Card className="backdrop-blur-2xl bg-white/10 border-white/20 shadow-2xl hover:shadow-3xl transition-shadow">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                N
              </div>
              <span className="text-sm font-semibold text-white/90">NextWave</span>
            </div>
            <CardTitle className="text-3xl font-bold text-white">Create account</CardTitle>
            <CardDescription className="text-white/70">Join NextWave and start managing your services</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white/90">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:bg-white/10 focus:border-white/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:bg-white/10 focus:border-white/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:bg-white/10 focus:border-white/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/90">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:bg-white/10 focus:border-white/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referralCode" className="text-white/90">Referral Code (Optional)</Label>
                <Input
                  id="referralCode"
                  type="text"
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:bg-white/10 focus:border-white/30"
                />
              </div>
              {error && <p className="text-sm text-red-300 bg-red-500/10 p-3 rounded-lg">{error}</p>}
              <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium mt-4" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-white/70">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-green-300 hover:text-green-200 transition-colors">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
