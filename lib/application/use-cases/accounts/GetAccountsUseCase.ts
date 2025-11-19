import { IAccountRepository } from '@/lib/domain/repositories/IAccountRepository';
import { Account } from '@/lib/domain/entities/Account';

export class GetAccountsUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(): Promise<Account[]> {
    return await this.accountRepository.findAll();
  }

  async getById(id: string): Promise<Account | null> {
    return await this.accountRepository.findById(id);
  }

  async getByType(type: string): Promise<Account[]> {
    return await this.accountRepository.findByType(type);
  }

  async getTotalBalance(): Promise<number> {
    return await this.accountRepository.getTotalBalance();
  }
}
