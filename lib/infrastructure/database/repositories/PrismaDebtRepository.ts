import { IDebtRepository } from '@/lib/domain/repositories/IDebtRepository';
import {
  Debt,
  CreateDebtDTO,
  UpdateDebtDTO,
  DebtFilter,
  DebtSummary,
  MarkDebtAsPaidDTO,
} from '@/lib/domain/entities/Debt';
import prisma from '../prisma-client';

export class PrismaDebtRepository implements IDebtRepository {
  async findAll(filter?: DebtFilter): Promise<Debt[]> {
    const where: any = {};

    if (filter) {
      if (filter.userId) where.userId = filter.userId;
      if (filter.isPaid !== undefined) where.isPaid = filter.isPaid;
      if (filter.startDate || filter.endDate) {
        where.createdAt = {};
        if (filter.startDate) where.createdAt.gte = filter.startDate;
        if (filter.endDate) where.createdAt.lte = filter.endDate;
      }
      if (filter.minAmount !== undefined || filter.maxAmount !== undefined) {
        where.amount = {};
        if (filter.minAmount !== undefined) where.amount.gte = filter.minAmount;
        if (filter.maxAmount !== undefined) where.amount.lte = filter.maxAmount;
      }
    }

    const debts = await prisma.debt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return debts as any;
  }

  async findById(id: string): Promise<Debt | null> {
    const debt = await prisma.debt.findUnique({
      where: { id },
    });
    return debt as any;
  }

  async findByUserId(userId: string, filter?: Omit<DebtFilter, 'userId'>): Promise<Debt[]> {
    const where: any = { userId };

    if (filter) {
      if (filter.isPaid !== undefined) where.isPaid = filter.isPaid;
      if (filter.startDate || filter.endDate) {
        where.createdAt = {};
        if (filter.startDate) where.createdAt.gte = filter.startDate;
        if (filter.endDate) where.createdAt.lte = filter.endDate;
      }
      if (filter.minAmount !== undefined || filter.maxAmount !== undefined) {
        where.amount = {};
        if (filter.minAmount !== undefined) where.amount.gte = filter.minAmount;
        if (filter.maxAmount !== undefined) where.amount.lte = filter.maxAmount;
      }
    }

    const debts = await prisma.debt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return debts as any;
  }

  async create(data: CreateDebtDTO): Promise<Debt> {
    const debt = await prisma.debt.create({
      data: {
        userId: data.userId,
        personName: data.personName,
        amount: data.amount,
        description: data.description,
        dueDate: data.dueDate,
        notes: data.notes,
      },
    });

    return debt as any;
  }

  async update(id: string, data: UpdateDebtDTO): Promise<Debt> {
    const debt = await prisma.debt.update({
      where: { id },
      data,
    });

    return debt as any;
  }

  async delete(id: string): Promise<void> {
    await prisma.debt.delete({
      where: { id },
    });
  }

  async markAsPaid(data: MarkDebtAsPaidDTO): Promise<Debt> {
    const { debtId, userId, accountId, categoryId, paidDate } = data;

    // Get the debt
    const debt = await prisma.debt.findUnique({
      where: { id: debtId },
    });

    if (!debt) {
      throw new Error('Debt not found');
    }

    if (debt.userId !== userId) {
      throw new Error('Unauthorized');
    }

    if (debt.isPaid) {
      throw new Error('Debt is already paid');
    }

    // Create an income transaction for the payment
    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        amount: debt.amount,
        type: 'INCOME',
        description: `Payment received from ${debt.personName}`,
        reason: debt.description,
        categoryId,
        date: paidDate || new Date(),
      },
    });

    // Update account balance (add income)
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: { increment: debt.amount } },
    });

    // Mark debt as paid and link to transaction
    const updatedDebt = await prisma.debt.update({
      where: { id: debtId },
      data: {
        isPaid: true,
        paidDate: paidDate || new Date(),
        transactionId: transaction.id,
      },
    });

    return updatedDebt as any;
  }

  async getSummary(userId: string): Promise<DebtSummary> {
    const debts = await prisma.debt.findMany({
      where: { userId },
    });

    const summary: DebtSummary = {
      totalDebts: debts.length,
      totalAmount: 0,
      paidDebts: 0,
      paidAmount: 0,
      unpaidDebts: 0,
      unpaidAmount: 0,
    };

    debts.forEach((debt) => {
      summary.totalAmount += debt.amount;
      if (debt.isPaid) {
        summary.paidDebts++;
        summary.paidAmount += debt.amount;
      } else {
        summary.unpaidDebts++;
        summary.unpaidAmount += debt.amount;
      }
    });

    return summary;
  }
}
