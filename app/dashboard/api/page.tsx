import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { generateApiKey, regenerateApiKey, revokeApiKey } from "@/app/actions/api-access"
import { CopyButton } from "@/components/dashboard/copy-button"
import { AlertCircle, RefreshCw, Trash2, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DOMAIN, APP_URL } from "@/lib/config"

export default async function ApiAccessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: userData } = await supabase.from("users").select("api_key, role, price_multiplier").eq("id", user!.id).single()

  // Use the actual domain for API URL
  const apiBaseUrl = `https://${DOMAIN}/api/v1`

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
              <div className="grid grid-cols-2 gap-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Price Multiplier</p>
                  <p className="text-lg font-bold text-blue-600">{userData.price_multiplier?.toFixed(2) || "3.00"}x</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Status</p>
                  <p className="text-lg font-bold text-green-600">Active</p>
                </div>
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

      {/* Quick Start Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Get started with the API in minutes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">1. Base URL</h4>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white dark:bg-slate-900 p-2 rounded text-sm font-mono border overflow-x-auto">
                {apiBaseUrl}
              </code>
              <CopyButton text={apiBaseUrl} />
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 text-purple-900 dark:text-purple-100">2. Authentication Header</h4>
            <div className="flex items-center gap-2">
              <pre className="flex-1 bg-white dark:bg-slate-900 p-3 rounded text-xs font-mono border overflow-x-auto">
{`Authorization: Bearer YOUR_API_KEY`}
              </pre>
              <CopyButton text="Authorization: Bearer YOUR_API_KEY" />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 text-green-900 dark:text-green-100">3. Your Prices</h4>
            <p className="text-sm text-muted-foreground mb-2">
              All prices returned by the API are automatically calculated with your <span className="font-semibold">{userData?.price_multiplier?.toFixed(2) || "3.00"}x</span> multiplier
            </p>
          </div>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>Available operations and examples</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Get Services */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-lg mb-2">Get Services</h3>
            <p className="text-sm text-muted-foreground mb-2">List all available services with your custom pricing</p>
            <code className="block bg-muted p-2 rounded text-sm font-mono mb-2">GET /services</code>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto border font-mono">
{`{
  "status": "success",
  "services": [
    {
      "id": "service-id",
      "name": "Instagram Followers",
      "price": "2.99",
      "min": 10,
      "max": 50000,
      "category": "Instagram"
    }
  ]
}`}
            </pre>
          </div>

          {/* Get Balance */}
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold text-lg mb-2">Check Balance</h3>
            <p className="text-sm text-muted-foreground mb-2">Get your current account balance</p>
            <code className="block bg-muted p-2 rounded text-sm font-mono mb-2">GET /balance</code>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto border font-mono">
{`{
  "status": "success",
  "balance": 250.50
}`}
            </pre>
          </div>

          {/* Place Order */}
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-lg mb-2">Place Order</h3>
            <p className="text-sm text-muted-foreground mb-2">Create a new service order</p>
            <code className="block bg-muted p-2 rounded text-sm font-mono mb-2">POST /order</code>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto border font-mono">
{`// Request
{
  "service_id": "service-id",
  "link": "https://instagram.com/username",
  "quantity": 1000
}

// Response
{
  "status": "success",
  "order_id": "order-id",
  "charge": 2.99,
  "order_status": "pending"
}`}
            </pre>
          </div>

          {/* Check Order Status */}
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-semibold text-lg mb-2">Check Order Status</h3>
            <p className="text-sm text-muted-foreground mb-2">Get the status of an existing order</p>
            <code className="block bg-muted p-2 rounded text-sm font-mono mb-2">GET /order?order_id=ORDER_ID</code>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto border font-mono">
{`{
  "status": "success",
  "order_id": "order-id",
  "order_status": "completed",
  "quantity": 1000,
  "link": "https://instagram.com/username"
}`}
            </pre>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Each user has their own unique API key and custom pricing. All API responses automatically use your price multiplier.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>Integration examples in popular languages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Python</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto border font-mono">
{`import requests

API_KEY = "your_api_key"
BASE_URL = "${apiBaseUrl}"

headers = {"Authorization": f"Bearer {API_KEY}"}

# Get services
response = requests.get(f"{BASE_URL}/services", headers=headers)
print(response.json())

# Place order
order_data = {
    "service_id": "service-id",
    "link": "https://instagram.com/username",
    "quantity": 1000
}
response = requests.post(f"{BASE_URL}/order", json=order_data, headers=headers)
print(response.json())`}
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">JavaScript / Node.js</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto border font-mono">
{`const API_KEY = "your_api_key";
const BASE_URL = "${apiBaseUrl}";

const headers = {
  "Authorization": \`Bearer \${API_KEY}\`,
  "Content-Type": "application/json"
};

// Get services
fetch(\`\${BASE_URL}/services\`, { headers })
  .then(r => r.json())
  .then(console.log);

// Place order
fetch(\`\${BASE_URL}/order\`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    service_id: "service-id",
    link: "https://instagram.com/username",
    quantity: 1000
  })
}).then(r => r.json()).then(console.log);`}
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">cURL</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto border font-mono">
{`# Get services
curl -X GET "${apiBaseUrl}/services" \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Place order
curl -X POST "${apiBaseUrl}/order" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "service_id": "service-id",
    "link": "https://instagram.com/username",
    "quantity": 1000
  }'`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Download Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Full Documentation</CardTitle>
          <CardDescription>Download complete API documentation with all endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/API_COMPLETE_DOCUMENTATION.md" download>
            <Button variant="outline" className="w-full gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Download Full Documentation (Markdown)
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
