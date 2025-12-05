import {
  Debt,
  CreateDebtDTO,
  UpdateDebtDTO,
  DebtFilter,
  DebtSummary,
  MarkDebtAsPaidDTO,
} from '../entities/Debt';

export interface IDebtRepository {
  findAll(filter?: DebtFilter): Promise<Debt[]>;
  findById(id: string): Promise<Debt | null>;
  findByUserId(userId: string, filter?: Omit<DebtFilter, 'userId'>): Promise<Debt[]>;
  create(data: CreateDebtDTO): Promise<Debt>;
  update(id: string, data: UpdateDebtDTO): Promise<Debt>;
  delete(id: string): Promise<void>;
  markAsPaid(data: MarkDebtAsPaidDTO): Promise<Debt>; // Special method to handle transaction creation
  getSummary(userId: string): Promise<DebtSummary>;
}
