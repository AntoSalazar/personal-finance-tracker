import {
  Subscription,
  CreateSubscriptionDTO,
  UpdateSubscriptionDTO,
  SubscriptionFilter,
  SubscriptionSummary,
  ProcessSubscriptionDTO,
} from '../entities/Subscription';

export interface ISubscriptionRepository {
  findAll(filter?: SubscriptionFilter): Promise<Subscription[]>;
  findById(id: string): Promise<Subscription | null>;
  findByUserId(userId: string, filter?: Omit<SubscriptionFilter, 'userId'>): Promise<Subscription[]>;
  findDueSubscriptions(date: Date): Promise<Subscription[]>; // Find subscriptions due for billing
  create(data: CreateSubscriptionDTO): Promise<Subscription>;
  update(id: string, data: UpdateSubscriptionDTO): Promise<Subscription>;
  delete(id: string): Promise<void>;
  processSubscription(data: ProcessSubscriptionDTO): Promise<Subscription>; // Create transaction and update next billing date
  getSummary(userId: string): Promise<SubscriptionSummary>;
}
