'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { updateUserProfile, updateUserPassword } from '@/app/actions/users'

interface UserData {
  id: string
  email: string
  full_name: string
}

export default function UserSettingsForm({ userData }: { userData: UserData }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    full_name: userData.full_name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Use userId from props directly to avoid session issues
    setUserId(userData.id)
  }, [userData.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setChangedFields(prev => new Set(prev).add(name))
  }

  const handleSaveProfile = async () => {
    if (!userId) return
    if (changedFields.size === 0) {
      setMessage({ type: 'error', text: 'No changes to save' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const updates: any = {}
      changedFields.forEach(field => {
        if (field === 'full_name') {
          updates[field] = formData[field]
        }
      })

      console.log("[v0] Saving profile changes:", updates)

      const result = await updateUserProfile(userId, updates)

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setChangedFields(new Set())
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'An error occurred' })
      console.error("[v0] Profile save error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!userId) return

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'All password fields are required' })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const result = await updateUserPassword(
        userId,
        formData.currentPassword,
        formData.newPassword,
      )

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Password changed successfully!' })
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
        
        // If redirect to login is needed, redirect after showing success message
        if (result.redirectToLogin) {
          console.log("[v0] Redirecting to login after password change")
          setTimeout(() => {
            router.push('/auth/login')
          }, 2000)
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to change password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and security</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
              <p className="text-xs text-gray-500">Your full name for display</p>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={loading || changedFields.size === 0}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter your current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter your new password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your new password"
              />
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              {loading ? 'Updating...' : 'Change Password'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
