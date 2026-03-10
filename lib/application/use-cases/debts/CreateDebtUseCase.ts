import { IDebtRepository } from '@/lib/domain/repositories/IDebtRepository';
import { IAccountRepository } from '@/lib/domain/repositories/IAccountRepository';
import { Debt, CreateDebtDTO } from '@/lib/domain/entities/Debt';

export class CreateDebtUseCase {
  constructor(
    private debtRepository: IDebtRepository,
    private accountRepository?: IAccountRepository
  ) {}

  async execute(data: CreateDebtDTO): Promise<Debt> {
    // Validate input
    if (!data.personName || data.personName.trim().length === 0) {
      throw new Error('Person name is required');
    }

    if (typeof data.amount !== 'number' || data.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    // Verify account exists and belongs to the user
    if (data.accountId && this.accountRepository) {
      const account = await this.accountRepository.findById(data.accountId);
      if (!account) {
        throw new Error('Account not found');
      }
      if (account.userId !== data.userId) {
        throw new Error('Account not found');
      }
    }

    // Create debt
    return await this.debtRepository.create(data);
  }
}
