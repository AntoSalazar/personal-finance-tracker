import { ICryptoRepository } from '@/lib/domain/repositories/ICryptoRepository';
import { CryptoHolding, CreateCryptoHoldingDTO } from '@/lib/domain/entities/CryptoHolding';

export class CreateCryptoHoldingUseCase {
  constructor(private cryptoRepository: ICryptoRepository) {}

  async execute(data: CreateCryptoHoldingDTO, userId: string): Promise<CryptoHolding> {
    // Validate input
    if (!data.symbol || data.symbol.trim().length === 0) {
      throw new Error('Crypto symbol is required');
    }

    if (typeof data.amount !== 'number' || data.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    if (typeof data.purchasePrice !== 'number' || data.purchasePrice <= 0) {
      throw new Error('Purchase price must be a positive number');
    }

    // Create holding with userId
    const holdingData: CreateCryptoHoldingDTO = {
      ...data,
      userId,
    };

    return await this.cryptoRepository.createHolding(holdingData);
  }
}
