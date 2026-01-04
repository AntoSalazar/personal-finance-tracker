import { ICryptoRepository } from '@/lib/domain/repositories/ICryptoRepository';
import { IAccountRepository } from '@/lib/domain/repositories/IAccountRepository';
import { ITransactionRepository } from '@/lib/domain/repositories/ITransactionRepository';
import { CryptoHolding, SellCryptoHoldingDTO, CryptoHoldingStatus } from '@/lib/domain/entities/CryptoHolding';
import { TransactionType } from '@/lib/domain/entities/Transaction';

export class SellCryptoHoldingUseCase {
  constructor(
    private cryptoRepository: ICryptoRepository,
    private accountRepository: IAccountRepository,
    private transactionRepository: ITransactionRepository
  ) {}

  async execute(
    holdingId: string,
    data: SellCryptoHoldingDTO,
    userId: string
  ): Promise<CryptoHolding> {
    // Validate holding exists and belongs to user
    const holding = await this.cryptoRepository.findHoldingById(holdingId, userId);
    if (!holding) {
      throw new Error('Crypto holding not found or unauthorized');
    }

    // Verify holding is active (not already sold)
    if (holding.status === CryptoHoldingStatus.SOLD) {
      throw new Error('This crypto holding has already been sold');
    }

    // Validate sale price
    if (typeof data.salePrice !== 'number' || data.salePrice <= 0) {
      throw new Error('Sale price must be a positive number');
    }

    // Validate sale fee
    const saleFee = data.saleFee || 0;
    if (saleFee < 0) {
      throw new Error('Sale fee cannot be negative');
    }

    // Verify account exists
    const account = await this.accountRepository.findById(data.saleAccountId);
    if (!account) {
      throw new Error('Destination account not found');
    }

    // Calculate total sale proceeds
    const grossProceeds = holding.amount * data.salePrice;
    const netProceeds = grossProceeds - saleFee;

    if (netProceeds <= 0) {
      throw new Error('Net proceeds after fees must be positive');
    }

    // Determine category - use provided or create a default income category
    const categoryId = data.categoryId;
    if (!categoryId) {
      throw new Error('Category is required when selling crypto');
    }

    // Create transaction for crypto sale (INCOME to destination account)
    const transaction = await this.transactionRepository.create({
      accountId: data.saleAccountId,
      amount: netProceeds,
      type: TransactionType.INCOME,
      description: `Sold ${holding.amount} ${holding.symbol} (${holding.name})${saleFee > 0 ? ` - Fee: $${saleFee.toFixed(2)}` : ''}`,
      categoryId: categoryId,
      date: data.saleDate,
    });

    // Update holding with sale information
    const updatedHolding = await this.cryptoRepository.sellHolding(holdingId, {
      ...data,
      saleFee,
    }, userId);

    return updatedHolding;
  }
}
