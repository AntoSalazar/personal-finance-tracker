import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaTransactionRepository, PrismaAccountRepository } from '@/lib/infrastructure/database/repositories';
import { CreateTransferUseCase } from '@/lib/application/use-cases/transactions/CreateTransferUseCase';
import { z, ZodError } from 'zod';
import prisma from '@/lib/infrastructure/database/prisma-client';

const createTransferSchema = z.object({
  fromAccountId: z.string().min(1, 'Source account is required'),
  toAccountId: z.string().min(1, 'Destination account is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().transform((val) => new Date(val)),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateTransferInput:
 *       type: object
 *       required:
 *         - fromAccountId
 *         - toAccountId
 *         - amount
 *         - description
 *         - date
 *       properties:
 *         fromAccountId:
 *           type: string
 *         toAccountId:
 *           type: string
 *         amount:
 *           type: number
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 */

// POST /api/transfers - Create new transfer between accounts
/**
 * @swagger
 * /api/transfers:
 *   post:
 *     summary: Create a transfer
 *     description: Transfer money between two accounts.
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransferInput'
 *     responses:
 *       201:
 *         description: Transfer successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const body = await req.json();
    const validatedData = createTransferSchema.parse(body);

    // Find or create a "Transfer" category for this user
    let transferCategory = await prisma.category.findFirst({
      where: {
        name: 'Transfer',
        type: 'EXPENSE',
        userId, // SECURITY: Filter by user
      },
    });

    if (!transferCategory) {
      transferCategory = await prisma.category.create({
        data: {
          name: 'Transfer',
          description: 'Internal transfers between accounts',
          type: 'EXPENSE',
          color: '#6B7280',
          icon: 'ArrowRightLeft',
          userId, // SECURITY: Assign to user
        },
      });
    }

    const transactionRepository = new PrismaTransactionRepository();
    const accountRepository = new PrismaAccountRepository();
    const useCase = new CreateTransferUseCase(transactionRepository, accountRepository);

    const transfer = await useCase.execute({
      ...validatedData,
      categoryId: transferCategory.id,
    } as any, userId); // SECURITY: Pass userId

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/transfers error:', error);
    return createErrorResponse(error);
  }
});
