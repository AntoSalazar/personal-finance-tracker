import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaSubscriptionRepository } from '@/lib/infrastructure/database/repositories/PrismaSubscriptionRepository';
import { PrismaAccountRepository } from '@/lib/infrastructure/database/repositories';
import { UpdateSubscriptionUseCase } from '@/lib/application/use-cases/subscriptions/UpdateSubscriptionUseCase';
import { DeleteSubscriptionUseCase } from '@/lib/application/use-cases/subscriptions/DeleteSubscriptionUseCase';
import { GetSubscriptionsUseCase } from '@/lib/application/use-cases/subscriptions/GetSubscriptionsUseCase';
import { z, ZodError } from 'zod';

const updateSubscriptionSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  frequency: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  nextBillingDate: z.string().transform((val) => new Date(val)).optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
});

// GET /api/subscriptions/[id] - Get specific subscription
export const GET = withAuth(async (req: NextRequest, userId: string, { params }: { params: { id: string } }) => {
  try {
    const repository = new PrismaSubscriptionRepository();
    const useCase = new GetSubscriptionsUseCase(repository);

    const subscription = await useCase.getById(params.id);

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (subscription.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('GET /api/subscriptions/[id] error:', error);
    return createErrorResponse(error);
  }
});

// PUT /api/subscriptions/[id] - Update subscription
export const PUT = withAuth(async (req: NextRequest, userId: string, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json();
    const validatedData = updateSubscriptionSchema.parse(body);

    const subscriptionRepository = new PrismaSubscriptionRepository();
    const accountRepository = new PrismaAccountRepository();
    const useCase = new UpdateSubscriptionUseCase(subscriptionRepository, accountRepository);

    const subscription = await useCase.execute(params.id, userId, validatedData);

    return NextResponse.json(subscription);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('PUT /api/subscriptions/[id] error:', error);
    return createErrorResponse(error);
  }
});

// DELETE /api/subscriptions/[id] - Delete subscription
export const DELETE = withAuth(async (req: NextRequest, userId: string, { params }: { params: { id: string } }) => {
  try {
    const repository = new PrismaSubscriptionRepository();
    const useCase = new DeleteSubscriptionUseCase(repository);

    await useCase.execute(params.id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/subscriptions/[id] error:', error);
    return createErrorResponse(error);
  }
});
