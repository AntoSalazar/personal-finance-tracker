import {
  CryptoHolding,
  CryptoPrice,
  CryptoPriceHistory,
  CreateCryptoHoldingDTO,
  UpdateCryptoHoldingDTO,
  SellCryptoHoldingDTO,
} from '../entities/CryptoHolding';

export interface ICryptoRepository {
  // Holdings
  findAllHoldings(userId: string): Promise<CryptoHolding[]>;
  findHoldingById(id: string, userId: string): Promise<CryptoHolding | null>;
  findHoldingBySymbol(symbol: string, userId: string): Promise<CryptoHolding[]>;
  createHolding(data: CreateCryptoHoldingDTO): Promise<CryptoHolding>;
  updateHolding(id: string, data: UpdateCryptoHoldingDTO, userId: string): Promise<CryptoHolding>;
  deleteHolding(id: string, userId: string): Promise<void>;
  updateHoldingPrice(id: string, price: number, userId: string): Promise<void>;
  sellHolding(id: string, data: SellCryptoHoldingDTO, userId: string): Promise<CryptoHolding>;

  // Prices (global - no userId needed)
  findCurrentPrice(symbol: string): Promise<CryptoPrice | null>;
  upsertPrice(price: CryptoPrice): Promise<void>;

  // Price History (global - no userId needed)
  savePriceHistory(symbol: string, price: number): Promise<void>;
  getPriceHistory(symbol: string, startDate: Date, endDate: Date): Promise<CryptoPriceHistory[]>;
}
