'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                To change your password, please use the <strong>Forgot Password</strong> option on the login page. This ensures your account security with a verification link sent to your email.
              </p>
            </div>
            <Button 
              onClick={() => router.push('/auth/forgot-password')}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              Forgot Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
