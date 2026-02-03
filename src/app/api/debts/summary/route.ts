import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaDebtRepository } from '@/lib/infrastructure/database/repositories/PrismaDebtRepository';
import { GetDebtsUseCase } from '@/lib/application/use-cases/debts/GetDebtsUseCase';

// GET /api/debts/summary - Get debts summary for the authenticated user
/**
 * @swagger
 * /api/debts/summary:
 *   get:
 *     summary: Get debts summary
 *     description: Retrieve a summary of total debts owed and total payments made.
 *     tags:
 *       - Debts
 *     responses:
 *       200:
 *         description: Successfully retrieved debts summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOwed:
 *                   type: number
 *                 totalPaid:
 *                   type: number
 *                 count:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const repository = new PrismaDebtRepository();
    const useCase = new GetDebtsUseCase(repository);

    const summary = await useCase.getSummary(userId);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('GET /api/debts/summary error:', error);
    return createErrorResponse(error);
  }
});
