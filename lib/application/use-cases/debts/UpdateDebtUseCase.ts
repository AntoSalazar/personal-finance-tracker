import { IDebtRepository } from '@/lib/domain/repositories/IDebtRepository';
import { Debt, UpdateDebtDTO } from '@/lib/domain/entities/Debt';

export class UpdateDebtUseCase {
  constructor(private debtRepository: IDebtRepository) {}

  async execute(id: string, data: UpdateDebtDTO): Promise<Debt> {
    // Validate input if provided
    if (data.personName !== undefined && data.personName.trim().length === 0) {
      throw new Error('Person name cannot be empty');
    }

    if (data.amount !== undefined && (typeof data.amount !== 'number' || data.amount <= 0)) {
      throw new Error('Amount must be a positive number');
    }

    // Check debt exists
    const debt = await this.debtRepository.findById(id);
    if (!debt) {
      throw new Error('Debt not found');
    }

    if (debt.isPaid) {
      throw new Error('Cannot update a paid debt');
    }

    // Update debt
    return await this.debtRepository.update(id, data);
  }
}
