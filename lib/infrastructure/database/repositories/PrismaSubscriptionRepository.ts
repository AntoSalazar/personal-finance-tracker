import { ISubscriptionRepository } from '@/lib/domain/repositories/ISubscriptionRepository';
import {
  Subscription,
  CreateSubscriptionDTO,
  UpdateSubscriptionDTO,
  SubscriptionFilter,
  SubscriptionSummary,
  ProcessSubscriptionDTO,
  SubscriptionFrequency,
  SubscriptionStatus,
} from '@/lib/domain/entities/Subscription';
import prisma from '../prisma-client';

export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  async findAll(filter?: SubscriptionFilter): Promise<Subscription[]> {
    const where: any = {};

    if (filter) {
      if (filter.userId) where.userId = filter.userId;
      if (filter.status) where.status = filter.status;
      if (filter.accountId) where.accountId = filter.accountId;
      if (filter.minAmount !== undefined || filter.maxAmount !== undefined) {
        where.amount = {};
        if (filter.minAmount !== undefined) where.amount.gte = filter.minAmount;
        if (filter.maxAmount !== undefined) where.amount.lte = filter.maxAmount;
      }
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        account: true,
        category: true,
      },
      orderBy: { nextBillingDate: 'asc' },
    });

    return subscriptions as any;
  }

  async findById(id: string): Promise<Subscription | null> {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        account: true,
        category: true,
      },
    });
    return subscription as any;
  }

  async findByUserId(userId: string, filter?: Omit<SubscriptionFilter, 'userId'>): Promise<Subscription[]> {
    const where: any = { userId };

    if (filter) {
      if (filter.status) where.status = filter.status;
      if (filter.accountId) where.accountId = filter.accountId;
      if (filter.minAmount !== undefined || filter.maxAmount !== undefined) {
        where.amount = {};
        if (filter.minAmount !== undefined) where.amount.gte = filter.minAmount;
        if (filter.maxAmount !== undefined) where.amount.lte = filter.maxAmount;
      }
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        account: true,
        category: true,
      },
      orderBy: { nextBillingDate: 'asc' },
    });

    return subscriptions as any;
  }

  async findDueSubscriptions(date: Date): Promise<Subscription[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: {
          lte: date,
        },
      },
      include: {
        account: true,
        category: true,
      },
    });

    return subscriptions as any;
  }

  async create(data: CreateSubscriptionDTO): Promise<Subscription> {
    const subscription = await prisma.subscription.create({
      data: {
        userId: data.userId,
        name: data.name,
        amount: data.amount,
        frequency: data.frequency,
        nextBillingDate: data.nextBillingDate,
        accountId: data.accountId,
        categoryId: data.categoryId,
        notes: data.notes,
      },
      include: {
        account: true,
        category: true,
      },
    });

    return subscription as any;
  }

  async update(id: string, data: UpdateSubscriptionDTO): Promise<Subscription> {
    const subscription = await prisma.subscription.update({
      where: { id },
      data,
      include: {
        account: true,
        category: true,
      },
    });

    return subscription as any;
  }

  async delete(id: string): Promise<void> {
    await prisma.subscription.delete({
      where: { id },
    });
  }

  async processSubscription(data: ProcessSubscriptionDTO): Promise<Subscription> {
    const { subscriptionId, userId } = data;

    // Get the subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new Error('Unauthorized');
    }

    if (subscription.status !== 'ACTIVE') {
      throw new Error('Subscription is not active');
    }

    // Create an expense transaction for the subscription
    await prisma.transaction.create({
      data: {
        accountId: subscription.accountId,
        amount: subscription.amount,
        type: 'EXPENSE',
        description: `Subscription: ${subscription.name}`,
        reason: subscription.notes,
        categoryId: subscription.categoryId,
        date: new Date(),
      },
    });

    // Update account balance (subtract expense)
    await prisma.account.update({
      where: { id: subscription.accountId },
      data: { balance: { decrement: subscription.amount } },
    });

    // Calculate next billing date
    const nextBillingDate = this.calculateNextBillingDate(
      subscription.nextBillingDate,
      subscription.frequency
    );

    // Update subscription with next billing date
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        nextBillingDate,
      },
      include: {
        account: true,
        category: true,
      },
    });

    return updatedSubscription as any;
  }

  async getSummary(userId: string): Promise<SubscriptionSummary> {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
    });

    const summary: SubscriptionSummary = {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: 0,
      pausedSubscriptions: 0,
      cancelledSubscriptions: 0,
      totalMonthlyAmount: 0,
    };

    let earliestBillingDate: Date | undefined;

    subscriptions.forEach((subscription) => {
      if (subscription.status === 'ACTIVE') {
        summary.activeSubscriptions++;
        summary.totalMonthlyAmount += this.normalizeToMonthly(
          subscription.amount,
          subscription.frequency
        );

        if (!earliestBillingDate || subscription.nextBillingDate < earliestBillingDate) {
          earliestBillingDate = subscription.nextBillingDate;
        }
      } else if (subscription.status === 'PAUSED') {
        summary.pausedSubscriptions++;
      } else if (subscription.status === 'CANCELLED') {
        summary.cancelledSubscriptions++;
      }
    });

    summary.nextBillingDate = earliestBillingDate;

    return summary;
  }

  private calculateNextBillingDate(currentDate: Date, frequency: SubscriptionFrequency): Date {
    const nextDate = new Date(currentDate);

    switch (frequency) {
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'YEARLY':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  }

  private normalizeToMonthly(amount: number, frequency: SubscriptionFrequency): number {
    switch (frequency) {
      case 'WEEKLY':
        return amount * 4.33; // Average weeks per month
      case 'MONTHLY':
        return amount;
      case 'QUARTERLY':
        return amount / 3;
      case 'YEARLY':
        return amount / 12;
      default:
        return amount;
    }
  }
}
