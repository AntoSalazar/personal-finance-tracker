import { ICryptoRepository } from '@/lib/domain/repositories/ICryptoRepository';
import { CryptoHolding } from '@/lib/domain/entities/CryptoHolding';

export interface PortfolioSummary {
  holdings: CryptoHolding[];
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  profitLossPercentage: number;
}

export class GetCryptoPortfolioUseCase {
  constructor(private cryptoRepository: ICryptoRepository) {}

  async execute(): Promise<PortfolioSummary> {
    const holdings = await this.cryptoRepository.findAllHoldings();

    const totalValue = holdings.reduce(
      (sum, holding) => sum + holding.amount * holding.currentPrice,
      0
    );

    const totalCost = holdings.reduce(
      (sum, holding) => sum + holding.amount * holding.purchasePrice,
      0
    );

    const totalProfitLoss = totalValue - totalCost;
    const profitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

    return {
      holdings,
      totalValue,
      totalCost,
      totalProfitLoss,
      profitLossPercentage,
    };
  }

  async getById(id: string): Promise<CryptoHolding | null> {
    return await this.cryptoRepository.findHoldingById(id);
  }

  async getBySymbol(symbol: string): Promise<CryptoHolding[]> {
    return await this.cryptoRepository.findHoldingBySymbol(symbol);
  }
}
