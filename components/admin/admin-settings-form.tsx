"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { changeAdminPassword, changeAdminUsername, enableAdmin2FA, disableAdmin2FA } from "@/app/actions/admin-settings"
import { toast } from "sonner"

interface AdminSettingsFormProps {
  userId: string
  userEmail: string
  initialUsername?: string
}

export default function AdminSettingsForm({ userId, userEmail, initialUsername }: AdminSettingsFormProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [currentUsername, setCurrentUsername] = useState(initialUsername || "admin202502")
  const [newUsername, setNewUsername] = useState("")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [loadingUsername, setLoadingUsername] = useState(false)
  const [loading2FA, setLoading2FA] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [error2FA, setError2FA] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [usernameSuccess, setUsernameSuccess] = useState(false)
  const [success2FA, setSuccess2FA] = useState(false)

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

      const result = await changeAdminUsername({
        userId,
        newUsername,
      })

      if (result.success) {
        toast.success(result.message || "Username changed successfully")
        setCurrentUsername(newUsername)
        setNewUsername("")
        setUsernameSuccess(true)
        setTimeout(() => setUsernameSuccess(false), 5000)
      } else {
        throw new Error(result.error || "Failed to change username")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setUsernameError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoadingUsername(false)
    }
  }

  const handleToggle2FA = async () => {
    setError2FA(null)
    setSuccess2FA(false)
    setLoading2FA(true)

    try {
      const result = twoFactorEnabled
        ? await disableAdmin2FA(userId)
        : await enableAdmin2FA(userId)

      if (result.success) {
        setTwoFactorEnabled(!twoFactorEnabled)
        toast.success(result.message || "Two-factor authentication updated successfully")
        setSuccess2FA(true)
        setTimeout(() => setSuccess2FA(false), 5000)
      } else {
        throw new Error(result.error || "Failed to update 2FA settings")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError2FA(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading2FA(false)
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

            {/* Info Alert - Hardcoded System */}
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
              <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-900 dark:text-blue-100">Hardcoded Credentials System</AlertTitle>
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <div className="space-y-2">
                  <p>✅ <strong>No database needed!</strong> Admin credentials are hardcoded in the code.</p>
                  <p>📝 <strong>Username change:</strong> Updates your current session (visible in UI immediately)</p>
                  <p>🔄 <strong>Next login:</strong> Use the old username until you update the code permanently</p>
                  <p>💡 <strong>To make permanent:</strong> Update <code>ADMIN_USERNAME</code> in the login code (see server logs)</p>
                </div>
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

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your admin account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Success Alert */}
            {success2FA && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-900 dark:text-green-100">Success</AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Two-factor authentication settings have been updated successfully.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error2FA && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error2FA}</AlertDescription>
              </Alert>
            )}

            {/* 2FA Toggle */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
              <Checkbox
                id="two-factor"
                checked={twoFactorEnabled}
                onCheckedChange={() => handleToggle2FA()}
                disabled={loading2FA}
              />
              <div className="flex-1">
                <label htmlFor="two-factor" className="text-sm font-medium cursor-pointer">
                  Enable Two-Factor Authentication
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  When enabled, you'll need to enter a verification code sent to your email when logging into the admin panel. This provides enhanced security for your account.
                </p>
              </div>
            </div>

            {twoFactorEnabled && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-900 dark:text-green-100">Enabled</AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Two-factor authentication is now active. You will receive a verification code via email during login.
                </AlertDescription>
              </Alert>
            )}

            {!twoFactorEnabled && (
              <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-900 dark:text-amber-100">Disabled</AlertTitle>
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  Two-factor authentication is not active. We recommend enabling it for better security.
                </AlertDescription>
              </Alert>
            )}

            {loading2FA && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating settings...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
