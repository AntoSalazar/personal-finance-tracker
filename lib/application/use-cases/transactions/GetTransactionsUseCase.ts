import { ITransactionRepository } from '@/lib/domain/repositories/ITransactionRepository';
import { Transaction, TransactionFilter } from '@/lib/domain/entities/Transaction';

export class GetTransactionsUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(filter?: TransactionFilter): Promise<Transaction[]> {
    return await this.transactionRepository.findAll(filter);
  }

  async getById(id: string): Promise<Transaction | null> {
    return await this.transactionRepository.findById(id);
  }

  async getByAccountId(accountId: string): Promise<Transaction[]> {
    return await this.transactionRepository.findByAccountId(accountId);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await this.transactionRepository.findByDateRange(startDate, endDate);
  }

  async getTotalByCategory(startDate: Date, endDate: Date) {
    return await this.transactionRepository.getTotalByCategory(startDate, endDate);
  }
}
