import {
  CryptoHolding,
  CryptoPrice,
  CryptoPriceHistory,
  CreateCryptoHoldingDTO,
  UpdateCryptoHoldingDTO,
} from '../entities/CryptoHolding';

export interface ICryptoRepository {
  // Holdings
  findAllHoldings(): Promise<CryptoHolding[]>;
  findHoldingById(id: string): Promise<CryptoHolding | null>;
  findHoldingBySymbol(symbol: string): Promise<CryptoHolding[]>;
  createHolding(data: CreateCryptoHoldingDTO): Promise<CryptoHolding>;
  updateHolding(id: string, data: UpdateCryptoHoldingDTO): Promise<CryptoHolding>;
  deleteHolding(id: string): Promise<void>;
  updateHoldingPrice(id: string, price: number): Promise<void>;

  // Prices
  findCurrentPrice(symbol: string): Promise<CryptoPrice | null>;
  upsertPrice(price: CryptoPrice): Promise<void>;

  // Price History
  savePriceHistory(symbol: string, price: number): Promise<void>;
  getPriceHistory(symbol: string, startDate: Date, endDate: Date): Promise<CryptoPriceHistory[]>;
}
