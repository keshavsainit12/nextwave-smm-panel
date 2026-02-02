// SMM API Client - Handles communication with external SMM panel APIs
// Supports the standard SMM panel API format

export interface SMMService {
  service: number
  name: string
  type: string
  category: string
  rate: string
  min: string
  max: string
  refill: boolean
  cancel: boolean
}

export interface SMMOrderResponse {
  order: number
}

export interface SMMOrderStatus {
  charge: string
  start_count: string
  status: string
  remains: string
  currency: string
}

export interface SMMBalanceResponse {
  balance: string
  currency: string
}

interface RequestOptions {
  authMode?: "key" | "bearer"
  retries?: number
}

export class SMMApiClient {
  private apiUrl: string
  private apiKey: string
  private debugMode: boolean

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl
    this.apiKey = apiKey
    this.debugMode = process.env.DEBUG_SMM_API === "true"
  }

  private maskApiKey(key: string): string {
    if (key.length <= 8) return "***"
    return `${key.slice(0, 4)}...${key.slice(-4)}`
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async makeRequest(data: Record<string, any>, options: RequestOptions = {}) {
    const { authMode = "key", retries = 3 } = options
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const formData = new URLSearchParams()
        const headers: Record<string, string> = {
          "Content-Type": "application/x-www-form-urlencoded",
        }

        // Handle authentication based on mode
        if (authMode === "bearer") {
          headers["Authorization"] = `Bearer ${this.apiKey}`
        } else {
          formData.append("key", this.apiKey)
        }

        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, String(value))
        })

        if (this.debugMode) {
          console.log("[SMM-API-DEBUG] Request:", {
            url: this.apiUrl,
            action: data.action,
            authMode,
            maskedKey: this.maskApiKey(this.apiKey),
            payload: data,
            attempt: `${attempt}/${retries}`,
          })
        }

        const response = await fetch(this.apiUrl, {
          method: "POST",
          headers,
          body: formData.toString(),
        })

        // Read response body for both success and error cases
        let responseBody: any
        const contentType = response.headers.get("content-type")
        try {
          if (contentType?.includes("application/json")) {
            responseBody = await response.json()
          } else {
            const text = await response.text()
            responseBody = text
            // Try to parse as JSON if it looks like JSON
            if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
              try {
                responseBody = JSON.parse(text)
              } catch {
                // Keep as text
              }
            }
          }
        } catch (parseError) {
          responseBody = { error: "Failed to parse response" }
        }

        if (this.debugMode) {
          console.log("[SMM-API-DEBUG] Response:", {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            body: responseBody,
          })
        }

        if (!response.ok) {
          // Check if this is a 5xx error (retryable)
          const isServerError = response.status >= 500 && response.status < 600
          const errorMessage =
            typeof responseBody === "object" && responseBody.error
              ? responseBody.error
              : typeof responseBody === "string"
                ? responseBody
                : response.statusText

          const error = new Error(
            `Provider API request failed (${response.status}): ${errorMessage}`,
          )

          // Attach full response info for caller to access
          ;(error as any).response = {
            status: response.status,
            statusText: response.statusText,
            body: responseBody,
          }

          if (isServerError && attempt < retries) {
            // Exponential backoff: 1s, 2s
            const delayMs = Math.pow(2, attempt - 1) * 1000
            console.warn(
              `[SMM-API] Server error ${response.status}, retrying in ${delayMs}ms (attempt ${attempt}/${retries})`,
            )
            await this.sleep(delayMs)
            lastError = error
            continue
          }

          throw error
        }

        return responseBody
      } catch (error: any) {
        lastError = error

        // Check if this is a network error (fetch failed)
        const isNetworkError = error.message?.includes("fetch") || !error.response

        if (isNetworkError && attempt < retries) {
          const delayMs = Math.pow(2, attempt - 1) * 1000
          console.warn(
            `[SMM-API] Network error, retrying in ${delayMs}ms (attempt ${attempt}/${retries}): ${error.message}`,
          )
          await this.sleep(delayMs)
          continue
        }

        throw error
      }
    }

    // If we exhausted all retries, throw the last error
    throw lastError || new Error("Request failed after all retries")
  }

  // Get list of all services from the API
  async getServices(options?: RequestOptions): Promise<SMMService[]> {
    const response = await this.makeRequest({ action: "services" }, options)
    
    // Validate response is an array
    if (!Array.isArray(response)) {
      console.error("[SMM-API] getServices received non-array response:", {
        type: typeof response,
        value: response,
      })
      
      // If it's a string that looks like JSON, try to parse it
      if (typeof response === "string") {
        try {
          const parsed = JSON.parse(response)
          if (Array.isArray(parsed)) {
            console.log("[SMM-API] Successfully parsed string response to array")
            return parsed
          }
          
          // Check if it's wrapped in an object like {services: [...]}
          if (parsed && typeof parsed === "object" && Array.isArray(parsed.services)) {
            console.log("[SMM-API] Found services array in object wrapper")
            return parsed.services
          }
        } catch (e) {
          console.error("[SMM-API] Failed to parse string response as JSON:", e)
        }
        
        throw new Error(
          `Invalid response from provider: expected array, got string. Response: ${response.substring(0, 200)}...`
        )
      }
      
      // Check if response is an object with services property
      if (response && typeof response === "object" && Array.isArray((response as any).services)) {
        console.log("[SMM-API] Found services in response object")
        return (response as any).services
      }
      
      throw new Error(
        `Invalid response from provider: expected array, got ${typeof response}. Response: ${JSON.stringify(response).substring(0, 200)}...`
      )
    }
    
    return response
  }

  // Place a new order
  async createOrder(
    serviceId: number,
    link: string,
    quantity: number,
    options?: RequestOptions,
  ): Promise<SMMOrderResponse> {
    return this.makeRequest(
      {
        action: "add",
        service: serviceId,
        link,
        quantity,
      },
      options,
    )
  }

  // Get order status
  async getOrderStatus(orderId: number, options?: RequestOptions): Promise<SMMOrderStatus> {
    return this.makeRequest(
      {
        action: "status",
        order: orderId,
      },
      options,
    )
  }

  // Create refill request
  async createRefill(orderId: number, options?: RequestOptions): Promise<{ refill: string }> {
    return this.makeRequest(
      {
        action: "refill",
        order: orderId,
      },
      options,
    )
  }

  // Cancel order
  async cancelOrder(orderId: number, options?: RequestOptions): Promise<{ cancel: number }> {
    return this.makeRequest(
      {
        action: "cancel",
        orders: orderId,
      },
      options,
    )
  }

  // Get API balance
  async getBalance(options?: RequestOptions): Promise<SMMBalanceResponse> {
    return this.makeRequest({ action: "balance" }, options)
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getBalance()
      return true
    } catch (error) {
      return false
    }
  }
}
