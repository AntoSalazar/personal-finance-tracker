import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaSubscriptionRepository } from '@/lib/infrastructure/database/repositories/PrismaSubscriptionRepository';
import { ProcessSubscriptionUseCase } from '@/lib/application/use-cases/subscriptions/ProcessSubscriptionUseCase';

// POST /api/subscriptions/[id]/process - Process subscription (create transaction and update next billing date)
export const POST = withAuth(async (req: NextRequest, userId: string, { params }: { params: { id: string } }) => {
  try {
    const repository = new PrismaSubscriptionRepository();
    const useCase = new ProcessSubscriptionUseCase(repository);

    const subscription = await useCase.execute({
      subscriptionId: params.id,
      userId,
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('POST /api/subscriptions/[id]/process error:', error);
    return createErrorResponse(error);
  }
});
