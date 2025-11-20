import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaTransactionRepository, PrismaAccountRepository } from '@/lib/infrastructure/database/repositories';
import { GetStatisticsUseCase } from '@/lib/application/use-cases/statistics/GetStatisticsUseCase';

// GET /api/statistics - Get financial statistics
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
