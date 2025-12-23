/**
 * CryptoHolding Entity
 * Represents a cryptocurrency investment holding
 */

export enum CryptoHoldingStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
}

export interface CryptoHolding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  purchasePrice: number;
  purchaseDate: Date;
  purchaseFee: number;
  currentPrice: number;
  lastPriceUpdate: Date;
  notes?: string;
  accountId?: string;
  transactionId?: string;
  status: CryptoHoldingStatus;
  salePrice?: number;
  saleDate?: Date;
  saleFee?: number;
  saleAccountId?: string;
  saleTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CryptoPrice {
  id: string;
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  percentChange24h: number;
  percentChange7d: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CryptoPriceHistory {
  id: string;
  symbol: string;
  price: number;
  timestamp: Date;
}

export interface CreateCryptoHoldingDTO {
  userId: string;
  symbol: string;
  name: string;
  amount: number;
  purchasePrice: number;
  purchaseDate: Date;
  purchaseFee?: number;
  notes?: string;
  accountId?: string;
  categoryId?: string;
}

export interface SellCryptoHoldingDTO {
  salePrice: number;
  saleDate: Date;
  saleFee?: number;
  saleAccountId: string;
  categoryId?: string;
}

export interface UpdateCryptoHoldingDTO {
  symbol?: string;
  amount?: number;
  purchasePrice?: number;
  purchaseDate?: Date;
  notes?: string;
}

export interface CryptoPortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalProfit: number;
  profitPercentage: number;
  holdings: Array<{
    holding: CryptoHolding;
    currentValue: number;
    profit: number;
    profitPercentage: number;
  }>;
}
