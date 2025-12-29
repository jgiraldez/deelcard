// Shared TypeScript types for the application

import { TransactionType, TransactionStatus, ClaimStatus } from '@prisma/client'

export interface CreateKidInput {
  name: string
  age?: number
  pin?: string
}

export interface CreateTransactionInput {
  kidId: string
  type: TransactionType
  amount: number
  description: string
  category?: string
  metadata?: Record<string, any>
}

export interface CreateRewardInput {
  title: string
  description?: string
  cost: number
  imageUrl?: string
}

export interface KidSession {
  kidId: string
  sessionId: string
  createdAt: number
}

export interface ChatRequest {
  message: string
  sessionId?: string
  kidId?: string
}

export interface ChatResponse {
  response: string
  sessionId: string
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  details?: any[]
}

export interface KidWithTransactions {
  id: string
  name: string
  age?: number
  avatarUrl?: string | null
  balance: number
  transactions: {
    id: string
    type: TransactionType
    amount: number
    description: string
    status: TransactionStatus
    createdAt: Date
  }[]
}

export interface TransactionWithKid {
  id: string
  type: TransactionType
  amount: number
  description: string
  category?: string | null
  status: TransactionStatus
  createdAt: Date
  kid: {
    name: string
  }
}

export interface RewardWithClaims {
  id: string
  title: string
  description?: string | null
  cost: number
  imageUrl?: string | null
  available: boolean
  claims: {
    id: string
    status: ClaimStatus
    claimedAt: Date
    kid: {
      name: string
    }
  }[]
}

// Form validation schemas (use with react-hook-form)
export const PIN_REGEX = /^\d{4}$/
export const MIN_PIN_LENGTH = 4
export const MAX_PIN_LENGTH = 4

// Constants
export const TRANSACTION_TYPES = {
  CHORE: 'Chore',
  ALLOWANCE: 'Allowance',
  PURCHASE: 'Purchase',
  BONUS: 'Bonus',
  PENALTY: 'Penalty',
} as const

export const TRANSACTION_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
} as const

export const CLAIM_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  FULFILLED: 'Fulfilled',
  REJECTED: 'Rejected',
} as const
