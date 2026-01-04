import { ITransactionRepository } from '@/lib/domain/repositories/ITransactionRepository';
import { IAccountRepository } from '@/lib/domain/repositories/IAccountRepository';
import { Transaction, CreateTransactionDTO, TransactionType } from '@/lib/domain/entities/Transaction';

export interface CreateTransferDTO {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
  categoryId: string;
  date: Date;
}

export class CreateTransferUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private accountRepository: IAccountRepository
  ) {}

  async execute(data: CreateTransferDTO, userId: string): Promise<Transaction> {
    // Validate input
    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Transfer description is required');
    }

    if (typeof data.amount !== 'number' || data.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    if (data.fromAccountId === data.toAccountId) {
      throw new Error('Cannot transfer to the same account');
    }

    // Verify both accounts exist
    const fromAccount = await this.accountRepository.findById(data.fromAccountId);
    if (!fromAccount) {
      throw new Error('Source account not found');
    }

    const toAccount = await this.accountRepository.findById(data.toAccountId);
    if (!toAccount) {
      throw new Error('Destination account not found');
    }

    // SECURITY: Verify both accounts belong to the requesting user
    if (fromAccount.userId !== userId) {
      throw new Error('Unauthorized: Source account does not belong to you');
    }

    if (toAccount.userId !== userId) {
      throw new Error('Unauthorized: Destination account does not belong to you');
    }

    // Check if source account has sufficient balance
    if (fromAccount.balance < data.amount) {
      throw new Error('Insufficient balance in source account');
    }

    // Create transfer transaction data
    const transferData: CreateTransactionDTO = {
      accountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      amount: data.amount,
      type: TransactionType.TRANSFER,
      description: data.description,
      categoryId: data.categoryId,
      date: data.date,
    };

    // Create transfer transaction
    return await this.transactionRepository.create(transferData);
  }
}
