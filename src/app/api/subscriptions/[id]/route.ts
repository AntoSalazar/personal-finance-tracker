import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaSubscriptionRepository } from '@/lib/infrastructure/database/repositories/PrismaSubscriptionRepository';
import { PrismaAccountRepository } from '@/lib/infrastructure/database/repositories';
import { UpdateSubscriptionUseCase } from '@/lib/application/use-cases/subscriptions/UpdateSubscriptionUseCase';
import { DeleteSubscriptionUseCase } from '@/lib/application/use-cases/subscriptions/DeleteSubscriptionUseCase';
import { GetSubscriptionsUseCase } from '@/lib/application/use-cases/subscriptions/GetSubscriptionsUseCase';
import { SubscriptionFrequency, SubscriptionStatus } from '@/lib/domain/entities/Subscription';
import { z, ZodError } from 'zod';

const updateSubscriptionSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  frequency: z.nativeEnum(SubscriptionFrequency).optional(),
  nextBillingDate: z.string().transform((val) => new Date(val)).optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.nativeEnum(SubscriptionStatus).optional(),
  notes: z.string().optional(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateSubscriptionInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         amount:
 *           type: number
 *         frequency:
 *           type: string
 *           enum: [WEEKLY, MONTHLY, QUARTERLY, YEARLY]
 *         nextBillingDate:
 *           type: string
 *           format: date
 *         accountId:
 *           type: string
 *         categoryId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ACTIVE, PAUSED, CANCELLED]
 *         notes:
 *           type: string
 */

// GET /api/subscriptions/[id] - Get specific subscription
/**
 * @swagger
 * /api/subscriptions/{id}:
 *   get:
 *     summary: Get a subscription by ID
 *     description: Retrieve details of a specific subscription.
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
 *         description: Successfully retrieved subscription details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update a subscription
 *     description: Update details of an existing subscription.
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSubscriptionInput'
 *     responses:
 *       200:
 *         description: Subscription successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a subscription
 *     description: Permanently delete a subscription.
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
 *         description: Subscription successfully deleted
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Internal server error
 */
export const GET = withAuth(async (req: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context!.params;
    const repository = new PrismaSubscriptionRepository();
    const useCase = new GetSubscriptionsUseCase(repository);

    const subscription = await useCase.getById(id);

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
export const PUT = withAuth(async (req: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context!.params;
    const body = await req.json();
    const validatedData = updateSubscriptionSchema.parse(body);

    const subscriptionRepository = new PrismaSubscriptionRepository();
    const accountRepository = new PrismaAccountRepository();
    const useCase = new UpdateSubscriptionUseCase(subscriptionRepository, accountRepository);

    const subscription = await useCase.execute(id, userId, validatedData);

    return NextResponse.json(subscription);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('PUT /api/subscriptions/[id] error:', error);
    return createErrorResponse(error);
  }
});

// DELETE /api/subscriptions/[id] - Delete subscription
export const DELETE = withAuth(async (req: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context!.params;
    const repository = new PrismaSubscriptionRepository();
    const useCase = new DeleteSubscriptionUseCase(repository);

    await useCase.execute(id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/subscriptions/[id] error:', error);
    return createErrorResponse(error);
  }
});
