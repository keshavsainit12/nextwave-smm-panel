'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { processPendingInstantPayments } from '@/app/actions/process-pending-payments'
import { toast } from 'sonner'
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ProcessPendingPaymentsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleProcess = async () => {
    setLoading(true)
    try {
      const response = await processPendingInstantPayments()
      setResult(response)

      if (response.success) {
        if (response.processed > 0) {
          toast.success(`Processed ${response.processed} pending payments!`)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Process Pending Payments</h1>
        <p className="text-muted-foreground">Manually process pending instant gateway payments and credit user wallets</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Instant Payments Processor</CardTitle>
          <CardDescription>Click the button below to find and process all pending instant gateway payments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will find all pending instant payments and credit the user wallets. Each transaction will be marked as completed.
            </AlertDescription>
          </Alert>

          <Button onClick={handleProcess} disabled={loading} size="lg" className="w-full gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Process Pending Payments
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Processing Results</CardTitle>
                <CardDescription>Summary of processed payments</CardDescription>
              </div>
              {result.success ? (
                <Badge className="bg-green-600">Success</Badge>
              ) : (
                <Badge variant="destructive">Failed</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
