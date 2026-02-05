"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Login successful!")
        router.push("/admin-panel-2024")
        router.refresh()
      } else {
        toast.error(data.error || "Invalid credentials")
      }
    } catch (error) {
      toast.error("Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Dark gradient background with subtle pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>

      <div className="relative w-full max-w-md z-10">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>

        <Card className="bg-slate-800/50 backdrop-blur border-slate-700 shadow-2xl hover:shadow-blue-500/10 transition-shadow">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <Image
                src="/logo.png"
                alt="NextWave SMM"
                width={600}
                height={150}
                className="w-32 sm:w-40 md:w-44 h-auto"
                priority
              />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Admin Panel</CardTitle>
            <CardDescription className="text-slate-400">Enter your credentials to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-blue-500"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-shadow" 
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login to Admin Panel"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
