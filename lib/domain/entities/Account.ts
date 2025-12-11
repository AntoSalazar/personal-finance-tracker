/**
 * Account Entity
 * Represents a financial account where money is stored
 */

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT_CARD = 'CREDIT_CARD',
  INVESTMENT = 'INVESTMENT',
  CASH = 'CASH',
  OTHER = 'OTHER',
}

export interface CreateAccountDTO {
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  description?: string;
}

export interface UpdateAccountDTO {
  name?: string;
  type?: AccountType;
  balance?: number;
  currency?: string;
  description?: string;
  isActive?: boolean;
}
