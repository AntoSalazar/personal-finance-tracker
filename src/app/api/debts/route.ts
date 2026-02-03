import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaDebtRepository } from '@/lib/infrastructure/database/repositories/PrismaDebtRepository';
import { CreateDebtUseCase } from '@/lib/application/use-cases/debts/CreateDebtUseCase';
import { GetDebtsUseCase } from '@/lib/application/use-cases/debts/GetDebtsUseCase';
import { z, ZodError } from 'zod';

const createDebtSchema = z.object({
  personName: z.string().min(1, 'Person name is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  dueDate: z.string().transform((val) => new Date(val)).optional(),
  notes: z.string().optional(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Debt:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         personName:
 *           type: string
 *         amount:
 *           type: number
 *         description:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 *         isPaid:
 *           type: boolean
 *         paidDate:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *     CreateDebtInput:
 *       type: object
 *       required:
 *         - personName
 *         - amount
 *       properties:
 *         personName:
 *           type: string
 *         amount:
 *           type: number
 *         description:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date
 *         notes:
 *           type: string
 */

// GET /api/debts - Get all debts for the authenticated user
/**
 * @swagger
 * /api/debts:
 *   get:
 *     summary: Get all debts
 *     description: Retrieve a list of debts, optionally filtered by paid status.
 *     tags:
 *       - Debts
 *     parameters:
 *       - name: isPaid
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Filter by paid status
 *     responses:
 *       200:
 *         description: Successfully retrieved debts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 debts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Debt'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new debt record
 *     description: Track a new debt owed to or by someone.
 *     tags:
 *       - Debts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDebtInput'
 *     responses:
 *       201:
 *         description: Debt successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Debt'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const isPaid = searchParams.get('isPaid');

    const repository = new PrismaDebtRepository();
    const useCase = new GetDebtsUseCase(repository);

    const filter: any = {};
    if (isPaid !== null) {
      filter.isPaid = isPaid === 'true';
    }

    const debts = await useCase.getByUserId(userId, filter);

    return NextResponse.json({ debts });
  } catch (error) {
    console.error('GET /api/debts error:', error);
    return createErrorResponse(error);
  }
});

// POST /api/debts - Create new debt
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const body = await req.json();
    const validatedData = createDebtSchema.parse(body);

    const repository = new PrismaDebtRepository();
    const useCase = new CreateDebtUseCase(repository);

    const debt = await useCase.execute({
      ...validatedData,
      userId,
    });

    return NextResponse.json(debt, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/debts error:', error);
    return createErrorResponse(error);
  }
});
