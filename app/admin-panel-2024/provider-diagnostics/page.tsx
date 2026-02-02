"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertTriangle, Loader2, RefreshCw, CheckCheck, Info } from "lucide-react"

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

  async function testAllProviders() {
    for (const provider of providers) {
      await testProvider(provider.id)
    }
  }

  // Calculate overall system status
  const getSystemStatus = () => {
    if (providers.length === 0) {
      return {
        hasProviders: false,
        hasApiKeys: false,
        ordersWillWork: false,
        message: "कोई provider configure नहीं है",
      }
    }

    const activeProviders = providers.filter((p) => p.is_active)
    if (activeProviders.length === 0) {
      return {
        hasProviders: true,
        hasApiKeys: false,
        ordersWillWork: false,
        message: "Providers हैं लेकिन कोई active नहीं है",
      }
    }

    const testedActiveProviders = activeProviders.filter((p) => results.has(p.id))
    if (testedActiveProviders.length === 0) {
      return {
        hasProviders: true,
        hasApiKeys: "unknown",
        ordersWillWork: "unknown",
        message: "Test करें providers को",
      }
    }

    const allPassed = testedActiveProviders.every(
      (p) => results.get(p.id)?.overall_status === "ALL_TESTS_PASSED"
    )

    if (allPassed) {
      return {
        hasProviders: true,
        hasApiKeys: true,
        ordersWillWork: true,
        message: "सब ठीक है! Orders provider को जाएंगे",
      }
    }

    return {
      hasProviders: true,
      hasApiKeys: false,
      ordersWillWork: false,
      message: "कुछ providers में problem है - नीचे check करें",
    }
  }

  const systemStatus = getSystemStatus()

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
          <h1 className="text-3xl font-bold">Provider API Status Check</h1>
          <p className="text-muted-foreground">
            यहाँ check करो कि orders provider को जाएंगे या नहीं
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testAllProviders} variant="default" disabled={testing !== null}>
            {testing !== null ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <CheckCheck className="h-4 w-4 mr-2" />
                Test सब Providers
              </>
            )}
          </Button>
          <Button onClick={fetchProviders} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Summary */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">✅ Quick Status Check</CardTitle>
          <CardDescription>आपके सवालों के जवाब</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Admin Panel में API है?</span>
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-green-600">हाँ! आप यहाँ देख रहे हैं ✅</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">API Key exist करती है?</span>
                {systemStatus.hasApiKeys === true ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : systemStatus.hasApiKeys === "unknown" ? (
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <p className="text-sm">
                {systemStatus.hasApiKeys === true
                  ? "हाँ, और काम कर रही है ✅"
                  : systemStatus.hasApiKeys === "unknown"
                    ? "Test करके check करें 👇"
                    : "नहीं या invalid है ❌"}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Orders जाएंगे provider को?</span>
                {systemStatus.ordersWillWork === true ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : systemStatus.ordersWillWork === "unknown" ? (
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <p className="text-sm">
                {systemStatus.ordersWillWork === true
                  ? "हाँ! सब ठीक है ✅"
                  : systemStatus.ordersWillWork === "unknown"
                    ? "Test करके confirm करें 👇"
                    : "नहीं - fix करना होगा ❌"}
              </p>
            </Card>
          </div>

          <Alert
            className={
              systemStatus.ordersWillWork === true
                ? "border-green-600 bg-green-50"
                : systemStatus.ordersWillWork === "unknown"
                  ? "border-yellow-600 bg-yellow-50"
                  : "border-red-600 bg-red-50"
            }
          >
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Status:</strong> {systemStatus.message}
            </AlertDescription>
          </Alert>

          {systemStatus.ordersWillWork === false && (
            <Alert className="border-orange-600 bg-orange-50">
              <AlertDescription>
                <strong>⚠️ क्या करें:</strong> नीचे जाकर प्रत्येक provider को "Test API" button से test
                करें। जो red हो उसे fix करें (API key update करें या auth mode change करें)।
              </AlertDescription>
            </Alert>
          )}

          {systemStatus.ordersWillWork === true && (
            <Alert className="border-green-600 bg-green-50">
              <AlertDescription>
                <strong>🎉 बढ़िया!</strong> अब जब भी user order करेगा, वो automatically provider के
                dashboard में दिखेगा। <strong>कोई नई API key डालने की ज़रूरत नहीं है।</strong>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Individual Provider Testing */}
      <div>
        <h2 className="text-xl font-bold mb-4">Provider Details (हर provider को test करें)</h2>
        <Alert className="mb-4">
          <AlertDescription>
            <strong>कैसे use करें:</strong> ऊपर "Test सब Providers" button click करो या नीचे हर provider के लिए individually "Test API" करो।
          </AlertDescription>
        </Alert>
      </div>

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
                      {result && result.overall_status === "ALL_TESTS_PASSED" && (
                        <Badge className="bg-green-600">✅ Working</Badge>
                      )}
                      {result && result.overall_status !== "ALL_TESTS_PASSED" && (
                        <Badge variant="destructive">❌ Problem</Badge>
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
            <p className="text-sm text-muted-foreground mt-2">
              पहले provider add करें API Providers section में।
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
