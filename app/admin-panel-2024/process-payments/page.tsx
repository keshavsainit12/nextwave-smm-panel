'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { processPendingInstantPayments, processUserPayment } from '@/app/actions/process-pending-payments'
import { toast } from 'sonner'
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Search } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { fetchPendingUsers } from '@/app/actions/instant-payments'

interface PendingUser {
  userId: string
  userEmail: string
  userName: string
  pendingAmount: number
  pendingCount: number
}

export default function ProcessPendingPaymentsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null)
  const [processingUser, setProcessingUser] = useState(false)

  // Fetch pending users on component mount
  useEffect(() => {
    fetchPendingUsersData()
  }, [])

  const fetchPendingUsersData = async () => {
    setLoadingUsers(true)
    try {
      const users = await fetchPendingUsers()
      setPendingUsers(users || [])
      console.log('[v0] Pending users fetched:', users)
    } catch (error) {
      console.error('[v0] Error fetching users:', error)
      toast.error('Failed to load pending users')
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleProcessAll = async () => {
    setLoading(true)
    try {
      const response = await processPendingInstantPayments()
      setResult(response)

      if (response.success) {
        if (response.processed > 0) {
          toast.success(`Processed ${response.processed} pending payments!`)
          fetchPendingUsersData() // Refresh the list
        } else {
          toast.info('No pending payments to process')
        }
      } else {
        toast.error(response.error || 'Failed to process payments')
      }
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Failed to process pending payments')
    } finally {
      setLoading(false)
    }
  }

  const handleProcessUserPayment = async (user: PendingUser) => {
    setProcessingUser(true)
    try {
      const response = await processUserPayment(user.userId, user.pendingAmount)

      if (response.success) {
        toast.success(`Processed payment for ${user.userEmail}`)
        setSelectedUser(null)
        fetchPendingUsersData() // Refresh the list
      } else {
        toast.error(response.error || 'Failed to process payment')
      }
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Failed to process user payment')
    } finally {
      setProcessingUser(false)
    }
  }

  const filteredUsers = pendingUsers.filter(user =>
    user.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.userName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Process Pending Payments</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Process instant gateway payments for individual users or all at once</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Pending Users List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">Pending Payments List</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Users with pending instant payments</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 space-y-4">
              {/* Search Box */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium">Search Users</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by email or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Loading State */}
              {loadingUsers && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading pending users...</span>
                </div>
              )}

              {/* Users List */}
              {!loadingUsers && filteredUsers.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.userId}
                      onClick={() => setSelectedUser(user)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedUser?.userId === user.userId
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                          : 'border-gray-200 dark:border-gray-800 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{user.userEmail}</p>
                          <p className="text-xs text-muted-foreground">{user.userName}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {user.pendingCount} pending transaction(s)
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-orange-600">${user.pendingAmount.toFixed(2)}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">Pending</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loadingUsers && filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {pendingUsers.length === 0 ? 'No pending payments' : 'No users match your search'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Process Payment Panel */}
        <div>
          <Card className="sticky top-4 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">Process Payment</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Single or bulk processing</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 space-y-4">
              {/* Selected User Info */}
              {selectedUser && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                  <p className="text-xs text-muted-foreground mb-1">Selected User</p>
                  <p className="text-sm font-medium">{selectedUser.userEmail}</p>
                  <p className="text-sm font-bold text-blue-600 mt-2">${selectedUser.pendingAmount.toFixed(2)}</p>
                </div>
              )}

              {/* Individual User Payment Button */}
              <Button
                onClick={() => selectedUser && handleProcessUserPayment(selectedUser)}
                disabled={!selectedUser || processingUser}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {processingUser ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {selectedUser ? 'Process Selected User' : 'Select a User First'}
                  </>
                )}
              </Button>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-950 px-2 text-gray-500">OR</span>
                </div>
              </div>

              {/* Bulk Processing Alert */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Process all pending payments at once. Each transaction will be marked as completed and wallet updated.
                </AlertDescription>
              </Alert>

              {/* Process All Button */}
              <Button
                onClick={handleProcessAll}
                disabled={loading || pendingUsers.length === 0}
                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Process All ({pendingUsers.length})
                  </>
                )}
              </Button>

              {/* Stats */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Summary</p>
                <div className="space-y-1 text-xs">
                  <p>Total Users: <span className="font-semibold">{pendingUsers.length}</span></p>
                  <p>Total Amount: <span className="font-semibold text-orange-600">
                    ${pendingUsers.reduce((acc, u) => acc + u.pendingAmount, 0).toFixed(2)}
                  </span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results Display */}
      {result && (
        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-xl">Processing Results</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Summary of processed payments</CardDescription>
              </div>
              {result.success ? (
                <Badge className="bg-green-600 text-xs">Success</Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">Failed</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                <p className="text-sm text-muted-foreground">Processed</p>
                <p className="text-2xl font-bold text-blue-600">{result.processed}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-slate-600">{result.total || 0}</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-900">
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(result.total || 0) - result.processed}
                </p>
              </div>
            </div>

            {result.message && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">{result.message}</p>
              </div>
            )}

            {result.results && result.results.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold text-sm">Transaction Details:</p>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {result.results.map((r: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <code className="text-xs text-muted-foreground truncate flex-1">
                          {r.transactionId}
                        </code>
                        {r.status === 'completed' ? (
                          <Badge className="bg-green-600 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Failed</Badge>
                        )}
                      </div>
                      {r.status === 'completed' && (
                        <div className="text-xs space-y-1 text-muted-foreground">
                          <p>User: <span className="text-foreground">{r.userEmail}</span></p>
                          <p>Amount: <span className="text-foreground font-semibold">${r.amount.toFixed(2)}</span></p>
                          <p>Balance: ${r.balanceBefore.toFixed(2)} → ${r.balanceAfter.toFixed(2)}</p>
                        </div>
                      )}
                      {r.status === 'failed' && (
                        <p className="text-xs text-red-600 dark:text-red-400">{r.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
