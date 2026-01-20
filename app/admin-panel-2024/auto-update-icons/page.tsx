'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { autoUpdateIcons } from '@/app/actions/auto-update-icons'
import { Loader2, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function AutoUpdateIconsPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleAutoUpdate = async () => {
    setLoading(true)
    try {
      const result = await autoUpdateIcons()
      setResults(result)
      
      if (result.updated.length > 0) {
        toast.success(`Successfully updated ${result.updated.length} icons!`)
      }
      if (result.failed.length > 0) {
        toast.error(`Failed to update ${result.failed.length} icons`)
      }
    } catch (error: any) {
      toast.error('Failed to auto-update icons')
      console.error('[v0] Auto-update error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Auto-Update All Icons</h1>
        <p className="text-gray-600 mt-2">Automatically match and update all service icons from your uploaded GIFs</p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Ready to Update
          </CardTitle>
          <CardDescription>
            Click the button below to automatically map and update all 8 icons to your services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Icons to be updated:</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>✓ TikTok</li>
              <li>✓ Discord</li>
              <li>✓ YouTube</li>
              <li>✓ Telegram</li>
              <li>✓ LinkedIn</li>
              <li>✓ Spotify</li>
              <li>✓ Facebook</li>
              <li>✓ Instagram</li>
            </ul>
          </div>

          <Button
            onClick={handleAutoUpdate}
            disabled={loading}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating Icons...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Auto-Update All Icons Now
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Update Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.updated.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-green-900 mb-2">Successfully Updated ({results.updated.length})</p>
                <ul className="text-sm text-green-800 space-y-1">
                  {results.updated.map((name: string) => (
                    <li key={name} className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.failed.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-semibold text-red-900 mb-2">Failed ({results.failed.length})</p>
                <ul className="text-sm text-red-800 space-y-1">
                  {results.failed.map((item: any) => (
                    <li key={item.name} className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {item.name}: {item.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg">What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>✓ All 8 animated GIF icons will be automatically added to your services</p>
          <p>✓ Icons will display on the dashboard, service cards, category tabs, and order pages</p>
          <p>✓ Users will see animated icons next to every service they can order</p>
          <p>✓ Admin dashboard will show icons in recent orders and service lists</p>
        </CardContent>
      </Card>

      <Link href="/admin-panel-2024">
        <Button variant="outline" className="w-full bg-transparent">← Back to Admin</Button>
      </Link>
    </div>
  )
}
