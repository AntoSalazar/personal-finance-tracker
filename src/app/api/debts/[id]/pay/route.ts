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

// POST /api/debts/[id]/pay - Mark debt as paid (creates income transaction)
export const POST = withAuth(async (req: NextRequest, userId: string, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json();
    const validatedData = markAsPaidSchema.parse(body);

    const debtRepository = new PrismaDebtRepository();
    const accountRepository = new PrismaAccountRepository();
    const useCase = new MarkDebtAsPaidUseCase(debtRepository, accountRepository);

    const debt = await useCase.execute({
      debtId: params.id,
      userId,
      accountId: validatedData.accountId,
      categoryId: validatedData.categoryId,
      paidDate: validatedData.paidDate,
    });

    return NextResponse.json(debt);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('POST /api/debts/[id]/pay error:', error);
    return createErrorResponse(error);
  }
});
