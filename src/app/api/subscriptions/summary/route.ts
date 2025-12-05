import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaSubscriptionRepository } from '@/lib/infrastructure/database/repositories/PrismaSubscriptionRepository';
import { GetSubscriptionsUseCase } from '@/lib/application/use-cases/subscriptions/GetSubscriptionsUseCase';

// GET /api/subscriptions/summary - Get subscriptions summary for the authenticated user
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const repository = new PrismaSubscriptionRepository();
    const useCase = new GetSubscriptionsUseCase(repository);

    const summary = await useCase.getSummary(userId);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('GET /api/subscriptions/summary error:', error);
    return createErrorResponse(error);
  }
});
