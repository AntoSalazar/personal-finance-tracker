/**
 * Debt Entity
 * Represents money owed by someone to the user
 */

export interface Debt {
  id: string;
  userId: string;
  personName: string;
  amount: number;
  description?: string;
  dueDate?: Date;
  isPaid: boolean;
  paidDate?: Date;
  transactionId?: string; // Transaction created when debt is marked as paid
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDebtDTO {
  userId: string;
  personName: string;
  amount: number;
  description?: string;
  dueDate?: Date;
  notes?: string;
}

export interface UpdateDebtDTO {
  personName?: string;
  amount?: number;
  description?: string;
  dueDate?: Date;
  notes?: string;
}

export interface MarkDebtAsPaidDTO {
  debtId: string;
  userId: string;
  accountId: string; // Account to receive the payment
  categoryId: string; // Category for the income transaction
  paidDate?: Date; // Defaults to now if not provided
}

export interface DebtFilter {
  userId: string;
  isPaid?: boolean;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface DebtSummary {
  totalDebts: number;
  totalAmount: number;
  paidDebts: number;
  paidAmount: number;
  unpaidDebts: number;
  unpaidAmount: number;
}
