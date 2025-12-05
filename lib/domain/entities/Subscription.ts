/**
 * Subscription Entity
 * Represents a recurring subscription (Netflix, Spotify, etc.)
 */

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  frequency: SubscriptionFrequency;
  nextBillingDate: Date;
  accountId: string; // Account to deduct from
  categoryId: string; // Transaction category
  status: SubscriptionStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum SubscriptionFrequency {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

export interface CreateSubscriptionDTO {
  userId: string;
  name: string;
  amount: number;
  frequency: SubscriptionFrequency;
  nextBillingDate: Date;
  accountId: string;
  categoryId: string;
  notes?: string;
}

export interface UpdateSubscriptionDTO {
  name?: string;
  amount?: number;
  frequency?: SubscriptionFrequency;
  nextBillingDate?: Date;
  accountId?: string;
  categoryId?: string;
  status?: SubscriptionStatus;
  notes?: string;
}

export interface SubscriptionFilter {
  userId: string;
  status?: SubscriptionStatus;
  accountId?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface SubscriptionSummary {
  totalSubscriptions: number;
  activeSubscriptions: number;
  pausedSubscriptions: number;
  cancelledSubscriptions: number;
  totalMonthlyAmount: number; // Normalized to monthly
  nextBillingDate?: Date;
}

export interface ProcessSubscriptionDTO {
  subscriptionId: string;
  userId: string;
}
