import { ICryptoRepository } from '@/lib/domain/repositories/ICryptoRepository';
import {
  CryptoHolding,
  CryptoPrice,
  CryptoPriceHistory,
  CreateCryptoHoldingDTO,
  UpdateCryptoHoldingDTO,
  SellCryptoHoldingDTO,
} from '@/lib/domain/entities/CryptoHolding';
import prisma from '../prisma-client';

export class PrismaCryptoRepository implements ICryptoRepository {
  // Holdings
  async findAllHoldings(userId: string): Promise<CryptoHolding[]> {
    const holdings = await prisma.cryptoHolding.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return holdings as CryptoHolding[];
  }

  async findHoldingById(id: string, userId: string): Promise<CryptoHolding | null> {
    const holding = await prisma.cryptoHolding.findUnique({
      where: { id, userId },
    });
    return holding as CryptoHolding | null;
  }

  async findHoldingBySymbol(symbol: string, userId: string): Promise<CryptoHolding[]> {
    const holdings = await prisma.cryptoHolding.findMany({
      where: {
        symbol: symbol.toUpperCase(),
        userId
      },
      orderBy: { purchaseDate: 'desc' },
    });
    return holdings as CryptoHolding[];
  }

  async createHolding(data: CreateCryptoHoldingDTO): Promise<CryptoHolding> {
    const holding = await prisma.cryptoHolding.create({
      data: {
        ...data,
        symbol: data.symbol.toUpperCase(),
      },
    });
    return holding as CryptoHolding;
  }

  async updateHolding(id: string, data: UpdateCryptoHoldingDTO, userId: string): Promise<CryptoHolding> {
    // First verify ownership
    const existing = await prisma.cryptoHolding.findUnique({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Crypto holding not found or unauthorized');
    }

    const holding = await prisma.cryptoHolding.update({
      where: { id },
      data: data.symbol ? { ...data, symbol: data.symbol.toUpperCase() } : data,
    });
    return holding as CryptoHolding;
  }

  async deleteHolding(id: string, userId: string): Promise<void> {
    // First verify ownership
    const existing = await prisma.cryptoHolding.findUnique({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Crypto holding not found or unauthorized');
    }

    await prisma.cryptoHolding.delete({
      where: { id },
    });
  }

  async updateHoldingPrice(id: string, price: number, userId: string): Promise<void> {
    // First verify ownership
    const existing = await prisma.cryptoHolding.findUnique({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Crypto holding not found or unauthorized');
    }

    await prisma.cryptoHolding.update({
      where: { id },
      data: {
        currentPrice: price,
        lastPriceUpdate: new Date(),
      },
    });
  }

  async sellHolding(id: string, data: SellCryptoHoldingDTO, userId: string): Promise<CryptoHolding> {
    // First verify ownership
    const existing = await prisma.cryptoHolding.findUnique({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Crypto holding not found or unauthorized');
    }

    const holding = await prisma.cryptoHolding.update({
      where: { id },
      data: {
        status: 'SOLD',
        salePrice: data.salePrice,
        saleDate: data.saleDate,
        saleFee: data.saleFee || 0,
        saleAccountId: data.saleAccountId,
      },
    });
    return holding as CryptoHolding;
  }

  // Prices
  async findCurrentPrice(symbol: string): Promise<CryptoPrice | null> {
    const price = await prisma.cryptoPrice.findUnique({
      where: { symbol: symbol.toUpperCase() },
    });
    return price as CryptoPrice | null;
  }

  async upsertPrice(price: CryptoPrice): Promise<void> {
    await prisma.cryptoPrice.upsert({
      where: { symbol: price.symbol.toUpperCase() },
      update: {
        price: price.price,
        marketCap: price.marketCap,
        volume24h: price.volume24h,
        percentChange24h: price.percentChange24h,
        percentChange7d: price.percentChange7d,
        lastUpdated: price.lastUpdated,
      },
      create: {
        ...price,
        symbol: price.symbol.toUpperCase(),
      },
    });
  }

  // Price History
  async savePriceHistory(symbol: string, price: number): Promise<void> {
    await prisma.cryptoPriceHistory.create({
      data: {
        symbol: symbol.toUpperCase(),
        price,
        timestamp: new Date(),
      },
    });
  }

  async getPriceHistory(
    symbol: string,
    startDate: Date,
    endDate: Date
  ): Promise<CryptoPriceHistory[]> {
    const history = await prisma.cryptoPriceHistory.findMany({
      where: {
        symbol: symbol.toUpperCase(),
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });
    return history as CryptoPriceHistory[];
  }
}
