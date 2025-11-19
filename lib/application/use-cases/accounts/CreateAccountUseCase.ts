import { IAccountRepository } from '@/lib/domain/repositories/IAccountRepository';
import { Account, CreateAccountDTO } from '@/lib/domain/entities/Account';

export class CreateAccountUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(data: Omit<CreateAccountDTO, 'userId'>, userId: string): Promise<Account> {
    // Validate input
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Account name is required');
    }

    if (typeof data.balance !== 'number') {
      throw new Error('Balance must be a number');
    }

    // Create account with userId
    const accountData: CreateAccountDTO = {
      ...data,
      userId,
    };

    return await this.accountRepository.create(accountData);
  }
}
