import { IDebtRepository } from '@/lib/domain/repositories/IDebtRepository';
import { Debt, CreateDebtDTO } from '@/lib/domain/entities/Debt';

export class CreateDebtUseCase {
  constructor(private debtRepository: IDebtRepository) {}

  async execute(data: CreateDebtDTO): Promise<Debt> {
    // Validate input
    if (!data.personName || data.personName.trim().length === 0) {
      throw new Error('Person name is required');
    }

    if (typeof data.amount !== 'number' || data.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    // Create debt
    return await this.debtRepository.create(data);
  }
}
