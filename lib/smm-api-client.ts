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

export class SMMApiClient {
  private apiUrl: string
  private apiKey: string

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl
    this.apiKey = apiKey
  }

  private async makeRequest(data: Record<string, any>) {
    const formData = new URLSearchParams()
    formData.append("key", this.apiKey)

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  // Get list of all services from the API
  async getServices(): Promise<SMMService[]> {
    return this.makeRequest({ action: "services" })
  }

  // Place a new order
  async createOrder(serviceId: number, link: string, quantity: number): Promise<SMMOrderResponse> {
    return this.makeRequest({
      action: "add",
      service: serviceId,
      link,
      quantity,
    })
  }

  // Get order status
  async getOrderStatus(orderId: number): Promise<SMMOrderStatus> {
    return this.makeRequest({
      action: "status",
      order: orderId,
    })
  }

  // Create refill request
  async createRefill(orderId: number): Promise<{ refill: string }> {
    return this.makeRequest({
      action: "refill",
      order: orderId,
    })
  }

  // Cancel order
  async cancelOrder(orderId: number): Promise<{ cancel: number }> {
    return this.makeRequest({
      action: "cancel",
      orders: orderId,
    })
  }

  // Get API balance
  async getBalance(): Promise<SMMBalanceResponse> {
    return this.makeRequest({ action: "balance" })
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
