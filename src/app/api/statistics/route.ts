import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaTransactionRepository, PrismaAccountRepository } from '@/lib/infrastructure/database/repositories';
import { GetStatisticsUseCase } from '@/lib/application/use-cases/statistics/GetStatisticsUseCase';

// GET /api/statistics - Get financial statistics
/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: Get financial statistics
 *     description: Retrieve statistics for a specified period.
 *     tags:
 *       - Statistics
 *     parameters:
 *       - name: period
 *         in: query
 *         schema:
 *           type: string
 *           default: month
 *         description: Time period for statistics (e.g., month, year)
 *     responses:
 *       200:
 *         description: Successfully retrieved statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 income:
 *                   type: number
 *                 expenses:
 *                   type: number
 *                 balance:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month';

    const transactionRepository = new PrismaTransactionRepository();
    const accountRepository = new PrismaAccountRepository();
    const useCase = new GetStatisticsUseCase(transactionRepository, accountRepository);

    const statistics = await useCase.execute(userId, period);

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('GET /api/statistics error:', error);
    return createErrorResponse(error);
  }
});
