"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { changeAdminPassword } from "@/app/actions/admin-settings"
import { toast } from "sonner"

interface AdminSettingsPageProps {
  userId: string
  userEmail: string
}

export default function AdminSettingsPage({ userId, userEmail }: AdminSettingsPageProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [currentUsername, setCurrentUsername] = useState("admin202502")
  const [newUsername, setNewUsername] = useState("")
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [loadingUsername, setLoadingUsername] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [usernameSuccess, setUsernameSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoadingPassword(true)

    try {
      const result = await changeAdminPassword({
        userId,
        currentPassword,
        newPassword,
        confirmPassword,
      })

      if (result.success) {
        toast.success("Password changed successfully")
        setSuccess(true)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => setSuccess(false), 5000)
      } else {
        setError(result.error || "Failed to change password")
        toast.error(result.error || "Failed to change password")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoadingPassword(false)
    }
  }

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    setUsernameError(null)
    setUsernameSuccess(false)
    setLoadingUsername(true)

    try {
      if (!newUsername.trim()) {
        throw new Error("New username is required")
      }

      if (newUsername.length < 3) {
        throw new Error("Username must be at least 3 characters")
      }

      if (newUsername === currentUsername) {
        throw new Error("New username must be different from current username")
      }

      const response = await fetch("/api/admin/change-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUsername }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to change username")
      }

      toast.success("Username changed successfully")
      setCurrentUsername(newUsername)
      setNewUsername("")
      setUsernameSuccess(true)
      setTimeout(() => setUsernameSuccess(false), 5000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setUsernameError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoadingUsername(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your admin account and security settings</p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your admin account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-sm">Admin Email</Label>
            <p className="font-medium mt-1">{userEmail}</p>
          </div>
          <div>
            <Label className="text-muted-foreground text-sm">Admin Username</Label>
            <p className="font-medium mt-1">{currentUsername}</p>
          </div>
          <div>
            <Label className="text-muted-foreground text-sm">User ID</Label>
            <p className="font-mono text-sm mt-1 break-all">{userId}</p>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your admin account password for security</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-6">
            {/* Success Alert */}
            {success && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-900 dark:text-green-100">Success</AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Your password has been changed successfully.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loadingPassword}
                required
              />
              <p className="text-xs text-muted-foreground">We need your current password to verify your identity</p>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loadingPassword}
                required
              />
              <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loadingPassword}
                required
              />
            </div>

            {/* Security Info */}
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
              <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-900 dark:text-blue-100">Security Tip</AlertTitle>
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Use a strong, unique password with a mix of uppercase, lowercase, numbers, and symbols.
              </AlertDescription>
            </Alert>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loadingPassword || !currentPassword || !newPassword || !confirmPassword}
              >
                {loadingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentPassword("")
                  setNewPassword("")
                  setConfirmPassword("")
                  setError(null)
                }}
                disabled={loadingPassword}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Username */}
      <Card>
        <CardHeader>
          <CardTitle>Change Username</CardTitle>
          <CardDescription>Update your admin login username</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangeUsername} className="space-y-6">
            {/* Success Alert */}
            {usernameSuccess && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-900 dark:text-green-100">Success</AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Your username has been changed successfully.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {usernameError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{usernameError}</AlertDescription>
              </Alert>
            )}

            {/* Current Username Display */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Current Username</Label>
              <p className="font-medium text-base">{currentUsername}</p>
            </div>

            {/* New Username */}
            <div className="space-y-2">
              <Label htmlFor="new-username">New Username</Label>
              <Input
                id="new-username"
                type="text"
                placeholder="Enter new username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                disabled={loadingUsername}
                required
              />
              <p className="text-xs text-muted-foreground">Minimum 3 characters. Use letters, numbers, and underscores.</p>
            </div>

            {/* Info Alert */}
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
              <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-900 dark:text-blue-100">Note</AlertTitle>
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                You'll use this new username when logging into the admin panel. The email remains the same.
              </AlertDescription>
            </Alert>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={loadingUsername || !newUsername}
              >
                {loadingUsername ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Username...
                  </>
                ) : (
                  "Change Username"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNewUsername("")
                  setUsernameError(null)
                }}
                disabled={loadingUsername}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
