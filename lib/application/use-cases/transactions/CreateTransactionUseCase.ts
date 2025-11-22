import { ITransactionRepository } from '@/lib/domain/repositories/ITransactionRepository';
import { IAccountRepository } from '@/lib/domain/repositories/IAccountRepository';
import { Transaction, CreateTransactionDTO } from '@/lib/domain/entities/Transaction';
import { AccountType } from '@/lib/domain/entities/Account';

export class CreateTransactionUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private accountRepository: IAccountRepository
  ) {}

  async execute(data: CreateTransactionDTO): Promise<Transaction> {
    // Validate input
    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Transaction description is required');
    }

    if (typeof data.amount !== 'number' || data.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    // Verify account exists
    const account = await this.accountRepository.findById(data.accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Check if account has sufficient balance for expenses
    // Credit cards can go negative (that's how credit works!)
    if (data.type === 'EXPENSE' && account.type !== AccountType.CREDIT_CARD && account.balance < data.amount) {
      throw new Error('Insufficient balance in account');
    }

    // Create transaction
    return await this.transactionRepository.create(data);
  }
}
