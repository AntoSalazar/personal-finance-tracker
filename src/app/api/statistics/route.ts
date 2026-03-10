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
 *     description: Retrieve statistics for a specified period including category breakdowns, monthly trends, and top spending.
 *     tags:
 *       - Statistics
 *     parameters:
 *       - name: period
 *         in: query
 *         schema:
 *           type: string
 *           enum: [month, quarter, year, all]
 *           default: month
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Successfully retrieved statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: string
 *                 dateRange:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                       format: date-time
 *                     end:
 *                       type: string
 *                       format: date-time
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalIncome:
 *                       type: number
 *                     totalExpenses:
 *                       type: number
 *                     netIncome:
 *                       type: number
 *                     savingsRate:
 *                       type: number
 *                     netWorth:
 *                       type: number
 *                     transactionCount:
 *                       type: number
 *                     avgExpenseAmount:
 *                       type: number
 *                     avgIncomeAmount:
 *                       type: number
 *                 categoryBreakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       count:
 *                         type: number
 *                       color:
 *                         type: string
 *                 incomeCategoryBreakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       count:
 *                         type: number
 *                       color:
 *                         type: string
 *                 monthlyTrends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                       income:
 *                         type: number
 *                       expenses:
 *                         type: number
 *                       net:
 *                         type: number
 *                 accountBalances:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       balance:
 *                         type: number
 *                       type:
 *                         type: string
 *                 dailyTrend:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       amount:
 *                         type: number
 *                 topSpending:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       description:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       category:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month';

    const validPeriods = ['month', 'quarter', 'year', 'all'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: `Invalid period. Must be one of: ${validPeriods.join(', ')}` },
        { status: 400 }
      );
    }

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
