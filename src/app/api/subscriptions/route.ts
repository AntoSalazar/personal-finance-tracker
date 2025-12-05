import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaSubscriptionRepository } from '@/lib/infrastructure/database/repositories/PrismaSubscriptionRepository';
import { PrismaAccountRepository } from '@/lib/infrastructure/database/repositories';
import { CreateSubscriptionUseCase } from '@/lib/application/use-cases/subscriptions/CreateSubscriptionUseCase';
import { GetSubscriptionsUseCase } from '@/lib/application/use-cases/subscriptions/GetSubscriptionsUseCase';
import { z, ZodError } from 'zod';

const createSubscriptionSchema = z.object({
  name: z.string().min(1, 'Subscription name is required'),
  amount: z.number().positive('Amount must be positive'),
  frequency: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  nextBillingDate: z.string().transform((val) => new Date(val)),
  accountId: z.string().min(1, 'Account ID is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  notes: z.string().optional(),
});

// GET /api/subscriptions - Get all subscriptions for the authenticated user
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const accountId = searchParams.get('accountId');

    const repository = new PrismaSubscriptionRepository();
    const useCase = new GetSubscriptionsUseCase(repository);

    const filter: any = {};
    if (status) filter.status = status;
    if (accountId) filter.accountId = accountId;

    const subscriptions = await useCase.getByUserId(userId, filter);

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('GET /api/subscriptions error:', error);
    return createErrorResponse(error);
  }
});

// POST /api/subscriptions - Create new subscription
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const body = await req.json();
    const validatedData = createSubscriptionSchema.parse(body);

    const subscriptionRepository = new PrismaSubscriptionRepository();
    const accountRepository = new PrismaAccountRepository();
    const useCase = new CreateSubscriptionUseCase(subscriptionRepository, accountRepository);

    const subscription = await useCase.execute({
      ...validatedData,
      userId,
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('POST /api/subscriptions error:', error);
    return createErrorResponse(error);
  }
});
