import { ISubscriptionRepository } from '@/lib/domain/repositories/ISubscriptionRepository';
import { IAccountRepository } from '@/lib/domain/repositories/IAccountRepository';
import { Subscription, UpdateSubscriptionDTO } from '@/lib/domain/entities/Subscription';

export class UpdateSubscriptionUseCase {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private accountRepository: IAccountRepository
  ) {}

  async execute(id: string, userId: string, data: UpdateSubscriptionDTO): Promise<Subscription> {
    // Validate input if provided
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error('Subscription name cannot be empty');
    }

    if (data.amount !== undefined && (typeof data.amount !== 'number' || data.amount <= 0)) {
      throw new Error('Amount must be a positive number');
    }

    // Check subscription exists and belongs to user
    const subscription = await this.subscriptionRepository.findById(id);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // If changing account, verify new account exists and belongs to user
    if (data.accountId) {
      const account = await this.accountRepository.findById(data.accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      if (account.userId !== userId) {
        throw new Error('Unauthorized');
      }
    }

    // Update subscription
    return await this.subscriptionRepository.update(id, data);
  }
}
