"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertTriangle, Loader2, RefreshCw } from "lucide-react"

interface Provider {
  id: string
  name: string
  api_url: string
  is_active: boolean
}

export default function ProviderDiagnosticsPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState<string | null>(null)
  const [results, setResults] = useState<Map<string, any>>(new Map())

  useEffect(() => {
    fetchProviders()
  }, [])

  async function fetchProviders() {
    try {
      const response = await fetch("/api/admin/api-providers")
      if (response.ok) {
        const data = await response.json()
        setProviders(data.providers || [])
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error)
    } finally {
      setLoading(false)
    }
  }

  async function testProvider(providerId: string) {
    setTesting(providerId)
    try {
      const response = await fetch("/api/admin/test-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_id: providerId }),
      })

      const data = await response.json()
      if (data.diagnostics) {
        const newResults = new Map(results)
        newResults.set(providerId, data.diagnostics)
        setResults(newResults)
      }
    } catch (error) {
      console.error("Test failed:", error)
    } finally {
      setTesting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Provider API Test करो</h1>
          <p className="text-muted-foreground">
            यहाँ check करो कि provider API काम कर रहा है या नहीं
          </p>
        </div>
        <Button onClick={fetchProviders} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Alert>
        <AlertDescription>
          <strong>कैसे use करें:</strong> किसी भी provider के लिए "Test API" button click करो। 
          यह check करेगा कि API key सही है या नहीं।
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {providers.map((provider) => {
          const result = results.get(provider.id)

          return (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {provider.name}
                      {provider.is_active ? (
                        <Badge>Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      API URL: {provider.api_url}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => testProvider(provider.id)}
                    disabled={testing === provider.id}
                  >
                    {testing === provider.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      "Test API"
                    )}
                  </Button>
                </div>
              </CardHeader>

              {result && (
                <CardContent className="space-y-4">
                  <Alert
                    className={
                      result.overall_status === "ALL_TESTS_PASSED"
                        ? "border-green-600 bg-green-50"
                        : "border-red-600 bg-red-50"
                    }
                  >
                    <AlertDescription>
                      <strong>
                        {result.overall_status === "ALL_TESTS_PASSED" ? "✅ सब ठीक है!" : "❌ Problem है:"}
                      </strong>{" "}
                      {result.message}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Test Results:</h4>
                    {result.tests?.map((test: any, idx: number) => (
                      <Card key={idx} className="p-4">
                        <div className="flex items-start gap-3">
                          {test.status === "PASSED" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{test.test}</span>
                              <Badge
                                variant={test.status === "PASSED" ? "default" : "destructive"}
                              >
                                {test.status}
                              </Badge>
                            </div>

                            {test.message && (
                              <p className="text-sm text-muted-foreground">{test.message}</p>
                            )}

                            {test.error && (
                              <p className="text-sm text-red-600">
                                <strong>Error:</strong> {test.error}
                              </p>
                            )}

                            {test.suggestion && (
                              <Alert className="mt-2 bg-yellow-50">
                                <AlertDescription>
                                  <strong>💡 क्या करें:</strong> {test.suggestion}
                                </AlertDescription>
                              </Alert>
                            )}

                            {test.data && (
                              <div className="text-sm text-green-600">
                                <strong>✅ Balance:</strong> {test.data.balance} {test.data.currency}
                              </div>
                            )}

                            {test.provider_response && (
                              <details className="text-sm mt-2">
                                <summary className="cursor-pointer text-blue-600">
                                  Provider Response देखो
                                </summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                  {JSON.stringify(test.provider_response, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {providers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">कोई provider नहीं है।</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
