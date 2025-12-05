import { IDebtRepository } from '@/lib/domain/repositories/IDebtRepository';
import { Debt, DebtFilter, DebtSummary } from '@/lib/domain/entities/Debt';

export class GetDebtsUseCase {
  constructor(private debtRepository: IDebtRepository) {}

  async execute(filter?: DebtFilter): Promise<Debt[]> {
    return await this.debtRepository.findAll(filter);
  }

  async getById(id: string): Promise<Debt | null> {
    return await this.debtRepository.findById(id);
  }

  async getByUserId(userId: string, filter?: Omit<DebtFilter, 'userId'>): Promise<Debt[]> {
    return await this.debtRepository.findByUserId(userId, filter);
  }

  async getSummary(userId: string): Promise<DebtSummary> {
    return await this.debtRepository.getSummary(userId);
  }
}
