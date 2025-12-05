import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaDebtRepository } from '@/lib/infrastructure/database/repositories/PrismaDebtRepository';
import { GetDebtsUseCase } from '@/lib/application/use-cases/debts/GetDebtsUseCase';

// GET /api/debts/summary - Get debts summary for the authenticated user
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
