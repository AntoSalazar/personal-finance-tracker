import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaDebtRepository } from '@/lib/infrastructure/database/repositories/PrismaDebtRepository';
import { PrismaAccountRepository } from '@/lib/infrastructure/database/repositories';
import { MarkDebtAsPaidUseCase } from '@/lib/application/use-cases/debts/MarkDebtAsPaidUseCase';
import { z, ZodError } from 'zod';

const markAsPaidSchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  paidDate: z.string().transform((val) => new Date(val)).optional(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     MarkDebtAsPaidInput:
 *       type: object
 *       required:
 *         - accountId
 *         - categoryId
 *       properties:
 *         accountId:
 *           type: string
 *         categoryId:
 *           type: string
 *         paidDate:
 *           type: string
 *           format: date
 *           description: YYYY-MM-DD
 */

// POST /api/debts/[id]/pay - Mark debt as paid (creates income transaction)
/**
 * @swagger
 * /api/debts/{id}/pay:
 *   post:
 *     summary: Mark a debt as paid
 *     description: Mark an existing debt as paid, automatically creating the corresponding transaction.
 *     tags:
 *       - Debts
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
 *             $ref: '#/components/schemas/MarkDebtAsPaidInput'
 *     responses:
 *       200:
 *         description: Debt successfully marked as paid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Debt'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Debt not found
 *       500:
 *         description: Internal server error
 */
export const POST = withAuth(async (req: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context!.params;
    const body = await req.json();
    const validatedData = markAsPaidSchema.parse(body);

    const debtRepository = new PrismaDebtRepository();
    const accountRepository = new PrismaAccountRepository();
    const useCase = new MarkDebtAsPaidUseCase(debtRepository, accountRepository);

    const debt = await useCase.execute({
      debtId: id,
      userId,
      accountId: validatedData.accountId,
      categoryId: validatedData.categoryId,
      paidDate: validatedData.paidDate,
    });

    return NextResponse.json(debt);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/debts/[id]/pay error:', error);
    return createErrorResponse(error);
  }
});
