/**
 * Order Status Management
 * 
 * This module provides type-safe status management for orders.
 * All status values must match the database CHECK constraint.
 */

// Valid order statuses as defined in database constraint
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  PARTIAL: 'partial',
  CANCELED: 'canceled',
  REFUNDING: 'refunding',
  REFUNDED: 'refunded',
} as const

// Type for order status
export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES]

// Array of valid statuses
export const VALID_ORDER_STATUSES: readonly OrderStatus[] = Object.values(ORDER_STATUSES)

/**
 * Validates if a status is valid
 */
export function isValidOrderStatus(status: string): status is OrderStatus {
  return VALID_ORDER_STATUSES.includes(status as OrderStatus)
}

/**
 * Safely returns a valid order status or throws an error
 */
export function validateOrderStatus(status: string): OrderStatus {
  if (!isValidOrderStatus(status)) {
    throw new Error(
      `Invalid order status: "${status}". Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`
    )
  }
  return status
}

/**
 * Maps provider status to our order status
 * Returns null if status is unknown (should keep current status)
 */
export function mapProviderStatus(providerStatus: string): OrderStatus | null {
  const status = providerStatus.toLowerCase().trim()
  
  // Direct mappings
  if (status === 'completed') return ORDER_STATUSES.COMPLETED
  if (status === 'partial') return ORDER_STATUSES.PARTIAL
  if (status === 'in progress' || status === 'processing') return ORDER_STATUSES.PROCESSING
  if (status === 'canceled' || status === 'cancelled') return ORDER_STATUSES.CANCELED
  if (status === 'refunded' || status === 'refund') return ORDER_STATUSES.REFUNDED
  if (status === 'refunding') return ORDER_STATUSES.REFUNDING
  if (status === 'pending') return ORDER_STATUSES.PENDING
  
  // Unknown status - caller should keep current status
  return null
}
