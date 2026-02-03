import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaSubscriptionRepository } from '@/lib/infrastructure/database/repositories/PrismaSubscriptionRepository';
import { GetSubscriptionsUseCase } from '@/lib/application/use-cases/subscriptions/GetSubscriptionsUseCase';

// GET /api/subscriptions/summary - Get subscriptions summary for the authenticated user
/**
 * @swagger
 * /api/subscriptions/summary:
 *   get:
 *     summary: Get subscriptions summary
 *     description: Retrieve total monthly and yearly costs of active subscriptions.
 *     tags:
 *       - Subscriptions
 *     responses:
 *       200:
 *         description: Successfully retrieved summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalMonthly:
 *                   type: number
 *                 totalYearly:
 *                   type: number
 *                 count:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
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
