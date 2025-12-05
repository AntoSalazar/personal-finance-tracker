import { IDebtRepository } from '@/lib/domain/repositories/IDebtRepository';
import { IAccountRepository } from '@/lib/domain/repositories/IAccountRepository';
import { Debt, MarkDebtAsPaidDTO } from '@/lib/domain/entities/Debt';

export class MarkDebtAsPaidUseCase {
  constructor(
    private debtRepository: IDebtRepository,
    private accountRepository: IAccountRepository
  ) {}

  async execute(data: MarkDebtAsPaidDTO): Promise<Debt> {
    // Verify debt exists and belongs to user
    const debt = await this.debtRepository.findById(data.debtId);
    if (!debt) {
      throw new Error('Debt not found');
    }

    if (debt.userId !== data.userId) {
      throw new Error('Unauthorized');
    }

    if (debt.isPaid) {
      throw new Error('Debt is already paid');
    }

    // Verify account exists and belongs to user
    const account = await this.accountRepository.findById(data.accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    if (account.userId !== data.userId) {
      throw new Error('Unauthorized');
    }

    // Mark debt as paid (creates income transaction)
    return await this.debtRepository.markAsPaid(data);
  }
}
