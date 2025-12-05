import { IDebtRepository } from '@/lib/domain/repositories/IDebtRepository';

export class DeleteDebtUseCase {
  constructor(private debtRepository: IDebtRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    // Verify debt exists and belongs to user
    const debt = await this.debtRepository.findById(id);
    if (!debt) {
      throw new Error('Debt not found');
    }

    if (debt.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Delete debt
    await this.debtRepository.delete(id);
  }
}
