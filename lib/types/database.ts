export type UserRole = "user" | "admin" | "reseller"
export type UserStatus = "active" | "banned" | "suspended"
export type OrderStatus = "pending" | "processing" | "completed" | "partial" | "canceled" | "refunding" | "refunded"
export type TransactionType = "deposit" | "order" | "refund" | "referral" | "admin_adjustment"
export type TransactionStatus = "pending" | "completed" | "failed" | "canceled"
export type TicketStatus = "open" | "replied" | "closed"
export type TicketPriority = "low" | "normal" | "high" | "urgent"

export interface User {
  id: string
  email: string
  full_name?: string
  role: UserRole
  tier_id?: string
  balance: number
  status: UserStatus
  api_key?: string
  referral_code?: string
  referred_by?: string
  total_orders: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface CryptoCurrency {
  id: string
  name: string
  symbol: string
  network?: string
  wallet_address: string
  qr_code_url?: string
  minimum_deposit: number
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface ApiProvider {
  id: string
  name: string
  api_url: string
  api_key: string
  is_active: boolean
  priority: number
  success_rate: number
  last_checked_at?: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  category_id?: string
  provider_id?: string
  external_service_id?: string
  name: string
  description?: string
  platform?: string
  base_price: number
  min_quantity: number
  max_quantity: number
  is_active: boolean
  has_refill: boolean
  refill_days: number
  average_time?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  service_id?: string
  external_order_id?: string
  link: string
  quantity: number
  price: number
  start_count: number
  remains: number
  status: OrderStatus
  can_refill: boolean
  refill_count: number
  last_refill_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  order_id?: string
  type: TransactionType
  amount: number
  balance_before: number
  balance_after: number
  payment_method?: string
  payment_id?: string
  crypto_currency_id?: string
  status: TransactionStatus
  notes?: string
  created_at: string
}

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  created_at: string
  updated_at: string
}
