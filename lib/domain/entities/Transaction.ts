/**
 * Transaction Entity
 * Represents an expense or income transaction
 */

import { Category } from './Category';

export interface Transaction {
  id: string;
  accountId: string;
  toAccountId?: string; // For transfers: destination account
  amount: number;
  type: TransactionType;
  description: string;
  reason?: string;
  categoryId: string;
  category?: Category; // Optional: populated when needed
  tags: string[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  TRANSFER = 'TRANSFER',
}

export interface CreateTransactionDTO {
  accountId: string;
  toAccountId?: string; // Required for TRANSFER type
  amount: number;
  type: TransactionType;
  description: string;
  reason?: string;
  categoryId: string;
  tags?: string[];
  date: Date;
}

export interface UpdateTransactionDTO {
  accountId?: string;
  toAccountId?: string;
  amount?: number;
  type?: TransactionType;
  description?: string;
  reason?: string;
  categoryId?: string;
  tags?: string[];
  date?: Date;
}

export interface TransactionFilter {
  accountId?: string;
  type?: TransactionType;
  categoryId?: string;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}
