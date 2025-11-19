import { IAccountRepository } from '@/lib/domain/repositories/IAccountRepository';
import { Account, CreateAccountDTO, UpdateAccountDTO } from '@/lib/domain/entities/Account';
import prisma from '../prisma-client';

export class PrismaAccountRepository implements IAccountRepository {
  async findAll(): Promise<Account[]> {
    const accounts = await prisma.account.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return accounts as Account[];
  }

  async findById(id: string): Promise<Account | null> {
    const account = await prisma.account.findUnique({
      where: { id },
    });
    return account as Account | null;
  }

  async findByType(type: string): Promise<Account[]> {
    const accounts = await prisma.account.findMany({
      where: { type: type as any },
      orderBy: { createdAt: 'desc' },
    });
    return accounts as Account[];
  }

  async create(data: CreateAccountDTO): Promise<Account> {
    const account = await prisma.account.create({
      data: {
        ...data,
      },
    });
    return account as Account;
  }

  async update(id: string, data: UpdateAccountDTO): Promise<Account> {
    const account = await prisma.account.update({
      where: { id },
      data,
    });
    return account as Account;
  }

  async delete(id: string): Promise<void> {
    await prisma.account.delete({
      where: { id },
    });
  }

  async getTotalBalance(): Promise<number> {
    const accounts = await prisma.account.findMany({
      where: { isActive: true },
      select: { balance: true },
    });

    return accounts.reduce((total, account) => total + account.balance, 0);
  }
}
