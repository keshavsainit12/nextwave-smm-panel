import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { generateApiKey, regenerateApiKey, revokeApiKey } from "@/app/actions/api-access"
import { CopyButton } from "@/components/dashboard/copy-button"
import { AlertCircle, RefreshCw, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function ApiAccessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: userData } = await supabase.from("users").select("api_key, role").eq("id", user!.id).single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Access</h1>
        <p className="text-muted-foreground">Integrate NextWave Panel with your applications using your personal API key</p>
      </div>

      {/* API Key Card */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-900 dark:text-blue-100">Your API Key</CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Use this key to authenticate API requests - each user has their own unique key
              </CardDescription>
            </div>
            {userData?.role === "reseller" ? (
              <Badge className="bg-purple-600">Reseller</Badge>
            ) : (
              <Badge variant="secondary">User</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {userData?.api_key ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-4 rounded-lg border">
                <code className="flex-1 font-mono text-sm break-all text-slate-900 dark:text-slate-100">
                  {userData.api_key}
                </code>
                <CopyButton text={userData.api_key} />
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Keep your API key secure. Do not share it publicly or commit it to version control.
              </p>
              <div className="flex gap-2 flex-wrap">
                <form action={regenerateApiKey}>
                  <Button type="submit" variant="outline" size="sm" className="gap-2 bg-transparent">
                    <RefreshCw className="h-4 w-4" />
                    Regenerate Key
                  </Button>
                </form>
                <form action={revokeApiKey}>
                  <Button type="submit" variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Revoke Access
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  You don't have an API key yet. Generate one to start using the API.
                </AlertDescription>
              </Alert>
              <form action={generateApiKey}>
                <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                  Generate API Key
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>Available endpoints and usage examples</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Base URL</h3>
            <code className="block bg-muted p-3 rounded text-sm font-mono border">
              https://nextwavesmm.com/api/v1
            </code>
            <p className="text-xs text-muted-foreground">Replace with your actual domain</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Authentication</h3>
            <p className="text-sm text-muted-foreground">Include your API key in the request header:</p>
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto border font-mono">
              {`Authorization: Bearer YOUR_API_KEY
Accept: application/json
Content-Type: application/json`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Get Balance</h3>
            <p className="text-sm text-muted-foreground">Check your current account balance</p>
            <code className="block bg-muted p-2 rounded text-sm font-mono">GET /api/v1/balance</code>
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto border font-mono">
              {`{
  "status": "success",
  "balance": 250.50,
  "currency": "USD"
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Get Services</h3>
            <p className="text-sm text-muted-foreground">List all available services with pricing</p>
            <code className="block bg-muted p-2 rounded text-sm font-mono">GET /api/v1/services</code>
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto border font-mono">
              {`{
  "status": "success",
  "services": [
    {
      "id": "123",
      "name": "Instagram Followers",
      "price": 5.00,
      "min": 100,
      "max": 10000,
      "category": "instagram"
    }
  ]
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Place Order</h3>
            <p className="text-sm text-muted-foreground">Create a new service order</p>
            <code className="block bg-muted p-2 rounded text-sm font-mono">POST /api/v1/order</code>
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto border font-mono">
              {`// Request Body
{
  "service_id": "123",
  "link": "https://instagram.com/username",
  "quantity": 1000
}

// Response
{
  "status": "success",
  "order_id": "abc-123-def",
  "charge": 5.00,
  "balance_after": 245.50
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Check Order Status</h3>
            <p className="text-sm text-muted-foreground">Get the status of an existing order</p>
            <code className="block bg-muted p-2 rounded text-sm font-mono">
              GET /api/v1/order?order_id=abc-123-def
            </code>
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto border font-mono">
              {`{
  "status": "success",
  "order": {
    "id": "abc-123-def",
    "status": "completed",
    "service_id": "123",
    "quantity": 1000,
    "charge": 5.00,
    "created_at": "2024-01-20T10:30:00Z"
  }
}`}
            </pre>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Each user has their own unique API key. Do not share keys between users. Regenerate your key if you believe it has been compromised.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
