import { ICryptoRepository } from '@/lib/domain/repositories/ICryptoRepository';
import { IAccountRepository } from '@/lib/domain/repositories/IAccountRepository';
import { ITransactionRepository } from '@/lib/domain/repositories/ITransactionRepository';
import { CryptoHolding, CreateCryptoHoldingDTO } from '@/lib/domain/entities/CryptoHolding';
import { TransactionType } from '@/lib/domain/entities/Transaction';
import { AccountType } from '@/lib/domain/entities/Account';
import prisma from '@/lib/infrastructure/database/prisma-client';

export class CreateCryptoHoldingUseCase {
  constructor(
    private cryptoRepository: ICryptoRepository,
    private accountRepository?: IAccountRepository,
    private transactionRepository?: ITransactionRepository
  ) {}

  async execute(
    data: CreateCryptoHoldingDTO,
    userId: string,
    categoryId?: string
  ): Promise<CryptoHolding> {
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

    let transactionId: string | undefined;

    // If accountId is provided, create a transaction and update account balance
    if (data.accountId) {
      if (!this.accountRepository || !this.transactionRepository) {
        throw new Error('Account and transaction repositories are required for account-linked purchases');
      }

      if (!categoryId) {
        throw new Error('Category is required when purchasing crypto from an account');
      }

      // Verify account exists
      const account = await this.accountRepository.findById(data.accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      // Calculate total purchase cost including fees
      const purchaseFee = data.purchaseFee || 0;
      const totalCost = (data.amount * data.purchasePrice) + purchaseFee;

      // Check if account has sufficient balance (except credit cards)
      if (account.type !== AccountType.CREDIT_CARD && account.balance < totalCost) {
        throw new Error(
          `Insufficient balance in ${account.name}. Available: $${account.balance.toFixed(2)}, Required: $${totalCost.toFixed(2)}`
        );
      }

      // Create transaction for crypto purchase
      const transaction = await this.transactionRepository.create({
        accountId: data.accountId,
        amount: totalCost,
        type: TransactionType.EXPENSE,
        description: `Bought ${data.amount} ${data.symbol} (${data.name})${purchaseFee > 0 ? ` - Fee: $${purchaseFee.toFixed(2)}` : ''}`,
        categoryId: categoryId,
        date: data.purchaseDate,
      });

      transactionId = transaction.id;
    }

    // Create holding with transactionId linked
    const holding = await prisma.cryptoHolding.create({
      data: {
        userId,
        symbol: data.symbol.toUpperCase(),
        name: data.name,
        amount: data.amount,
        purchasePrice: data.purchasePrice,
        purchaseDate: data.purchaseDate,
        purchaseFee: data.purchaseFee || 0,
        notes: data.notes,
        accountId: data.accountId,
        transactionId: transactionId,
      },
    });

    return holding as CryptoHolding;
  }
}
