import { ITransactionRepository } from '@/lib/domain/repositories/ITransactionRepository';
import {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilter,
} from '@/lib/domain/entities/Transaction';
import prisma from '../prisma-client';

export class PrismaTransactionRepository implements ITransactionRepository {
  async findAll(filter?: TransactionFilter): Promise<Transaction[]> {
    const where: any = {};

    if (filter) {
      if (filter.accountId) where.accountId = filter.accountId;
      if (filter.categoryId) where.categoryId = filter.categoryId;
      if (filter.type) where.type = filter.type;
      if (filter.startDate || filter.endDate) {
        where.date = {};
        if (filter.startDate) where.date.gte = filter.startDate;
        if (filter.endDate) where.date.lte = filter.endDate;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return transactions as any;
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
        account: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
    return transaction as any;
  }

  async findByAccountId(accountId: string): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: { accountId },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
    return transactions as any;
  }

  async findByCategoryId(categoryId: string): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: { categoryId },
      include: {
        category: true,
        account: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
    return transactions as any;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
        account: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
    return transactions as any;
  }

  async create(data: CreateTransactionDTO): Promise<Transaction> {
    const { tags, ...transactionData } = data as any;

    const transaction = await prisma.transaction.create({
      data: {
        ...transactionData,
        tags: tags
          ? {
              create: tags.map((tagId: string) => ({
                tag: {
                  connect: { id: tagId },
                },
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        account: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Update account balance
    if (data.type === 'INCOME') {
      await prisma.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: data.amount } },
      });
    } else if (data.type === 'EXPENSE') {
      await prisma.account.update({
        where: { id: data.accountId },
        data: { balance: { decrement: data.amount } },
      });
    }

    return transaction as any;
  }

  async update(id: string, data: UpdateTransactionDTO): Promise<Transaction> {
    const { tags, ...transactionData } = data as any;

    // Get original transaction to adjust account balance
    const original = await prisma.transaction.findUnique({
      where: { id },
    });

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...transactionData,
        tags: tags
          ? {
              deleteMany: {},
              create: tags.map((tagId: string) => ({
                tag: {
                  connect: { id: tagId },
                },
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        account: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Adjust account balance if amount or type changed
    if (original && (data.amount !== undefined || data.type !== undefined)) {
      const oldAmount = original.amount;
      const oldType = original.type;
      const newAmount = data.amount ?? oldAmount;
      const newType = data.type ?? oldType;

      // Reverse old transaction effect
      if (oldType === 'INCOME') {
        await prisma.account.update({
          where: { id: original.accountId },
          data: { balance: { decrement: oldAmount } },
        });
      } else if (oldType === 'EXPENSE') {
        await prisma.account.update({
          where: { id: original.accountId },
          data: { balance: { increment: oldAmount } },
        });
      }

      // Apply new transaction effect
      const accountId = data.accountId ?? original.accountId;
      if (newType === 'INCOME') {
        await prisma.account.update({
          where: { id: accountId },
          data: { balance: { increment: newAmount } },
        });
      } else if (newType === 'EXPENSE') {
        await prisma.account.update({
          where: { id: accountId },
          data: { balance: { decrement: newAmount } },
        });
      }
    }

    return transaction as any;
  }

  async delete(id: string): Promise<void> {
    // Get transaction to adjust account balance
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (transaction) {
      // Reverse transaction effect on account balance
      if (transaction.type === 'INCOME') {
        await prisma.account.update({
          where: { id: transaction.accountId },
          data: { balance: { decrement: transaction.amount } },
        });
      } else if (transaction.type === 'EXPENSE') {
        await prisma.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: transaction.amount } },
        });
      }
    }

    await prisma.transaction.delete({
      where: { id },
    });
  }

  async getTotalByCategory(
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ categoryId: string; total: number }>> {
    const result = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return result.map((item) => ({
      categoryId: item.categoryId,
      total: item._sum.amount || 0,
    }));
  }

  async getTotalByTag(
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ tag: string; total: number }>> {
    const result = await prisma.transactionTagLink.findMany({
      where: {
        transaction: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        tag: true,
        transaction: true,
      },
    });

    // Group by tag and sum amounts
    const tagTotals = result.reduce((acc, item) => {
      const tagName = item.tag.name;
      if (!acc[tagName]) {
        acc[tagName] = 0;
      }
      acc[tagName] += item.transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tagTotals).map(([tag, total]) => ({ tag, total }));
  }
}
