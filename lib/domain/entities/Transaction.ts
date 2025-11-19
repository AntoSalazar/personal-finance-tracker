/**
 * Transaction Entity
 * Represents an expense or income transaction
 */

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  description: string;
  reason?: string;
  categoryId: string;
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
