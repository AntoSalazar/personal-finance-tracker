import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaSubscriptionRepository } from '@/lib/infrastructure/database/repositories/PrismaSubscriptionRepository';
import { PrismaAccountRepository } from '@/lib/infrastructure/database/repositories';
import { CreateSubscriptionUseCase } from '@/lib/application/use-cases/subscriptions/CreateSubscriptionUseCase';
import { GetSubscriptionsUseCase } from '@/lib/application/use-cases/subscriptions/GetSubscriptionsUseCase';
import { SubscriptionFrequency } from '@/lib/domain/entities/Subscription';
import { z, ZodError } from 'zod';

const createSubscriptionSchema = z.object({
  name: z.string().min(1, 'Subscription name is required'),
  amount: z.number().positive('Amount must be positive'),
  frequency: z.nativeEnum(SubscriptionFrequency),
  nextBillingDate: z.string().transform((val) => new Date(val)),
  accountId: z.string().min(1, 'Account ID is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  notes: z.string().optional(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Subscription:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         amount:
 *           type: number
 *         frequency:
 *           type: string
 *           enum: [WEEKLY, MONTHLY, QUARTERLY, YEARLY]
 *         nextBillingDate:
 *           type: string
 *           format: date-time
 *         accountId:
 *           type: string
 *         categoryId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ACTIVE, PAUSED, CANCELLED]
 *         notes:
 *           type: string
 *     CreateSubscriptionInput:
 *       type: object
 *       required:
 *         - name
 *         - amount
 *         - frequency
 *         - nextBillingDate
 *         - accountId
 *         - categoryId
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
 *         notes:
 *           type: string
 */

// GET /api/subscriptions - Get all subscriptions for the authenticated user
/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get all subscriptions
 *     description: Retrieve a list of subscriptions, optionally filtered by status or account.
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [ACTIVE, PAUSED, CANCELLED]
 *         description: Filter by subscription status
 *       - name: accountId
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by account ID
 *     responses:
 *       200:
 *         description: Successfully retrieved subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscriptions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subscription'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new subscription
 *     description: Track a recurring payment.
 *     tags:
 *       - Subscriptions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubscriptionInput'
 *     responses:
 *       201:
 *         description: Subscription successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
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
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/subscriptions error:', error);
    return createErrorResponse(error);
  }
});
