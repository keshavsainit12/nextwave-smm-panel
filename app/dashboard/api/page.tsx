import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { generateApiKey } from "@/app/actions/api-access"

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
        <p className="text-muted-foreground">Integrate NextWave Panel with your applications</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your API Key</CardTitle>
              <CardDescription>Use this key to authenticate API requests</CardDescription>
            </div>
            {userData?.role === "reseller" ? <Badge>Reseller</Badge> : <Badge variant="secondary">User</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {userData?.api_key ? (
            <div className="space-y-2">
              <code className="block bg-muted p-3 rounded font-mono text-sm">{userData.api_key}</code>
              <p className="text-xs text-muted-foreground">Keep your API key secure. Do not share it publicly.</p>
            </div>
          ) : (
            <form action={generateApiKey}>
              <Button type="submit">Generate API Key</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>Available endpoints and usage examples</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Base URL</h3>
            <code className="block bg-muted p-2 rounded text-sm">https://yourdomain.com/api/v1</code>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Authentication</h3>
            <p className="text-sm text-muted-foreground">Include your API key in the request headers:</p>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">{`Authorization: Bearer YOUR_API_KEY`}</pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Get Balance</h3>
            <code className="block bg-muted p-2 rounded text-sm">GET /api/v1/balance</code>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              {`{
  "status": "success",
  "balance": 250.50
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Get Services</h3>
            <code className="block bg-muted p-2 rounded text-sm">GET /api/v1/services</code>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              {`{
  "status": "success",
  "services": [
    {
      "id": "123",
      "name": "Instagram Followers",
      "price": 5.00,
      "min": 100,
      "max": 10000
    }
  ]
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Place Order</h3>
            <code className="block bg-muted p-2 rounded text-sm">POST /api/v1/order</code>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              {`// Request
{
  "service_id": "123",
  "link": "https://instagram.com/username",
  "quantity": 1000
}

// Response
{
  "status": "success",
  "order_id": "abc-123",
  "charge": 5.00
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Check Order Status</h3>
            <code className="block bg-muted p-2 rounded text-sm">GET /api/v1/order?order_id=abc-123</code>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              {`{
  "status": "success",
  "order": {
    "id": "abc-123",
    "status": "completed",
    "quantity": 1000,
    "start_count": 5000,
    "remains": 0
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
