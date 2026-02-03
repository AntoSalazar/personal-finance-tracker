import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaSubscriptionRepository } from '@/lib/infrastructure/database/repositories/PrismaSubscriptionRepository';
import { ProcessSubscriptionUseCase } from '@/lib/application/use-cases/subscriptions/ProcessSubscriptionUseCase';

// POST /api/subscriptions/process-due - Process all due subscriptions
/**
 * @swagger
 * /api/subscriptions/process-due:
 *   post:
 *     summary: Process all due subscriptions
 *     description: Trigger processing for all subscriptions that are due for billing.
 *     tags:
 *       - Subscriptions
 *     responses:
 *       200:
 *         description: Subscriptions processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 processed:
 *                   type: number
 *                 subscriptions:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const repository = new PrismaSubscriptionRepository();
    const useCase = new ProcessSubscriptionUseCase(repository);

    const processed = await useCase.processDueSubscriptions(new Date());

    return NextResponse.json({ processed: processed.length, subscriptions: processed });
  } catch (error) {
    console.error('POST /api/subscriptions/process-due error:', error);
    return createErrorResponse(error);
  }
});
