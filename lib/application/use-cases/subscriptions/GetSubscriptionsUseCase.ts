import { ISubscriptionRepository } from '@/lib/domain/repositories/ISubscriptionRepository';
import { Subscription, SubscriptionFilter, SubscriptionSummary } from '@/lib/domain/entities/Subscription';

export class GetSubscriptionsUseCase {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(filter?: SubscriptionFilter): Promise<Subscription[]> {
    return await this.subscriptionRepository.findAll(filter);
  }

  async getById(id: string): Promise<Subscription | null> {
    return await this.subscriptionRepository.findById(id);
  }

  async getByUserId(userId: string, filter?: Omit<SubscriptionFilter, 'userId'>): Promise<Subscription[]> {
    return await this.subscriptionRepository.findByUserId(userId, filter);
  }

  async getDueSubscriptions(date: Date): Promise<Subscription[]> {
    return await this.subscriptionRepository.findDueSubscriptions(date);
  }

  async getSummary(userId: string): Promise<SubscriptionSummary> {
    return await this.subscriptionRepository.getSummary(userId);
  }
}
