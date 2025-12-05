import { ISubscriptionRepository } from '@/lib/domain/repositories/ISubscriptionRepository';
import { IAccountRepository } from '@/lib/domain/repositories/IAccountRepository';
import { Subscription, CreateSubscriptionDTO } from '@/lib/domain/entities/Subscription';

export class CreateSubscriptionUseCase {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private accountRepository: IAccountRepository
  ) {}

  async execute(data: CreateSubscriptionDTO): Promise<Subscription> {
    // Validate input
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Subscription name is required');
    }

    if (typeof data.amount !== 'number' || data.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    // Verify account exists and belongs to user
    const account = await this.accountRepository.findById(data.accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    if (account.userId !== data.userId) {
      throw new Error('Unauthorized');
    }

    // Create subscription
    return await this.subscriptionRepository.create(data);
  }
}
