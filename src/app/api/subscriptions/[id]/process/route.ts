import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaSubscriptionRepository } from '@/lib/infrastructure/database/repositories/PrismaSubscriptionRepository';
import { ProcessSubscriptionUseCase } from '@/lib/application/use-cases/subscriptions/ProcessSubscriptionUseCase';

// POST /api/subscriptions/[id]/process - Process subscription (create transaction and update next billing date)
/**
 * @swagger
 * /api/subscriptions/{id}/process:
 *   post:
 *     summary: Manually process a subscription
 *     description: Trigger the payment processing for a subscription (creates a transaction and updates the next billing date).
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Internal server error
 */
export const POST = withAuth(async (req: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context!.params;
    const repository = new PrismaSubscriptionRepository();
    const useCase = new ProcessSubscriptionUseCase(repository);

    const subscription = await useCase.execute({
      subscriptionId: id,
      userId,
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('POST /api/subscriptions/[id]/process error:', error);
    return createErrorResponse(error);
  }
});
