import { IAccountRepository } from '@/lib/domain/repositories/IAccountRepository';
import { Account } from '@/lib/domain/entities/Account';

export class GetAccountsUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(userId: string): Promise<Account[]> {
    return await this.accountRepository.findByUserId(userId);
  }

  async getById(id: string): Promise<Account | null> {
    return await this.accountRepository.findById(id);
  }

  async getByType(type: string): Promise<Account[]> {
    return await this.accountRepository.findByType(type);
  }

  async getTotalBalance(userId: string): Promise<number> {
    const accounts = await this.accountRepository.findByUserId(userId);
    return accounts
      .filter(account => account.isActive)
      .reduce((total, account) => total + account.balance, 0);
  }
}
