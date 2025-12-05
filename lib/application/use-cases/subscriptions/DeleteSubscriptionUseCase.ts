import { ISubscriptionRepository } from '@/lib/domain/repositories/ISubscriptionRepository';

export class DeleteSubscriptionUseCase {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    // Verify subscription exists and belongs to user
    const subscription = await this.subscriptionRepository.findById(id);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Delete subscription
    await this.subscriptionRepository.delete(id);
  }
}
