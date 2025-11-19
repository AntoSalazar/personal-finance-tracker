import {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilter,
} from '../entities/Transaction';

export interface ITransactionRepository {
  findAll(filter?: TransactionFilter): Promise<Transaction[]>;
  findById(id: string): Promise<Transaction | null>;
  findByAccountId(accountId: string): Promise<Transaction[]>;
  findByCategoryId(categoryId: string): Promise<Transaction[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
  create(data: CreateTransactionDTO): Promise<Transaction>;
  update(id: string, data: UpdateTransactionDTO): Promise<Transaction>;
  delete(id: string): Promise<void>;
  getTotalByCategory(startDate: Date, endDate: Date): Promise<Array<{ categoryId: string; total: number }>>;
  getTotalByTag(startDate: Date, endDate: Date): Promise<Array<{ tag: string; total: number }>>;
}
