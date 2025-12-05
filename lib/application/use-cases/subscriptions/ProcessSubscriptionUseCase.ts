import { ISubscriptionRepository } from '@/lib/domain/repositories/ISubscriptionRepository';
import { Subscription, ProcessSubscriptionDTO } from '@/lib/domain/entities/Subscription';

export class ProcessSubscriptionUseCase {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(data: ProcessSubscriptionDTO): Promise<Subscription> {
    // Verify subscription exists and belongs to user
    const subscription = await this.subscriptionRepository.findById(data.subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.userId !== data.userId) {
      throw new Error('Unauthorized');
    }

    // Process subscription (create transaction and update billing date)
    return await this.subscriptionRepository.processSubscription(data);
  }

  async processDueSubscriptions(date: Date = new Date()): Promise<Subscription[]> {
    const dueSubscriptions = await this.subscriptionRepository.findDueSubscriptions(date);
    const processed: Subscription[] = [];

    for (const subscription of dueSubscriptions) {
      try {
        const result = await this.subscriptionRepository.processSubscription({
          subscriptionId: subscription.id,
          userId: subscription.userId,
        });
        processed.push(result);
      } catch (error) {
        console.error(`Failed to process subscription ${subscription.id}:`, error);
      }
    }

    return processed;
  }
}
