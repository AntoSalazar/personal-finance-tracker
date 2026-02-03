import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaTransactionRepository, PrismaAccountRepository } from '@/lib/infrastructure/database/repositories';
import { CreateTransactionUseCase } from '@/lib/application/use-cases/transactions/CreateTransactionUseCase';
import { GetTransactionsUseCase } from '@/lib/application/use-cases/transactions/GetTransactionsUseCase';
import { z, ZodError } from 'zod';

// Parse date in local timezone (Mexico City)
const parseLocalDate = (dateString: string): Date => {
  if (!dateString || typeof dateString !== 'string') {
    throw new Error('Date is required and must be a string');
  }

  // Support both YYYY-MM-DD and ISO 8601 formats
  const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!isoMatch) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }

  const [, year, month, day] = isoMatch.map(Number);

  // Validate the date components
  if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error('Invalid date values');
  }

  const date = new Date(year, month - 1, day, 12, 0, 0); // Noon local time to avoid timezone issues

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  return date;
};

const createTransactionSchema = z.object({
  accountId: z.string(),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['EXPENSE', 'INCOME', 'TRANSFER']),
  description: z.string().min(1, 'Description is required'),
  reason: z.string().optional(),
  categoryId: z.string(),
  date: z.string().transform(parseLocalDate),
  tags: z.array(z.string()).optional(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         accountId:
 *           type: string
 *         amount:
 *           type: number
 *         type:
 *           type: string
 *           enum: [EXPENSE, INCOME, TRANSFER]
 *         description:
 *           type: string
 *         reason:
 *           type: string
 *         categoryId:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateTransactionInput:
 *       type: object
 *       required:
 *         - accountId
 *         - amount
 *         - type
 *         - description
 *         - categoryId
 *         - date
 *       properties:
 *         accountId:
 *           type: string
 *         amount:
 *           type: number
 *         type:
 *           type: string
 *           enum: [EXPENSE, INCOME, TRANSFER]
 *         description:
 *           type: string
 *         reason:
 *           type: string
 *         categoryId:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *           description: YYYY-MM-DD
 *         tags:
 *           type: array
 *           items:
 *             type: string
 */

// GET /api/transactions - Get all transactions with optional filters
/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     description: Retrieve a list of transactions, optionally filtered by account, category, type, or date range.
 *     tags:
 *       - Transactions
 *     parameters:
 *       - name: accountId
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by account ID
 *       - name: categoryId
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [EXPENSE, INCOME, TRANSFER]
 *         description: Filter by transaction type
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter transactions after this date (YYYY-MM-DD)
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter transactions before this date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Successfully retrieved transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new transaction
 *     description: Create a new transaction entry (expense, income, or transfer).
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionInput'
 *     responses:
 *       201:
 *         description: Transaction successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const accountId = searchParams.get('accountId') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const type = searchParams.get('type') || undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const repository = new PrismaTransactionRepository();
    const useCase = new GetTransactionsUseCase(repository);

    const transactions = await useCase.execute(userId, {
      accountId,
      categoryId,
      type: type as any,
      startDate,
      endDate,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('GET /api/transactions error:', error);
    return createErrorResponse(error);
  }
});

// POST /api/transactions - Create new transaction
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const body = await req.json();
    const validatedData = createTransactionSchema.parse(body);

    const transactionRepository = new PrismaTransactionRepository();
    const accountRepository = new PrismaAccountRepository();
    const useCase = new CreateTransactionUseCase(transactionRepository, accountRepository);

    const transaction = await useCase.execute(validatedData as any);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/transactions error:', error);
    return createErrorResponse(error);
  }
});
