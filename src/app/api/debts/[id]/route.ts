import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaDebtRepository } from '@/lib/infrastructure/database/repositories/PrismaDebtRepository';
import { UpdateDebtUseCase } from '@/lib/application/use-cases/debts/UpdateDebtUseCase';
import { DeleteDebtUseCase } from '@/lib/application/use-cases/debts/DeleteDebtUseCase';
import { GetDebtsUseCase } from '@/lib/application/use-cases/debts/GetDebtsUseCase';
import { z, ZodError } from 'zod';

const updateDebtSchema = z.object({
  personName: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  dueDate: z.string().transform((val) => new Date(val)).optional(),
  notes: z.string().optional(),
});

// GET /api/debts/[id] - Get specific debt
export const GET = withAuth(async (req: NextRequest, userId: string, { params }: { params: { id: string } }) => {
  try {
    const repository = new PrismaDebtRepository();
    const useCase = new GetDebtsUseCase(repository);

    const debt = await useCase.getById(params.id);

    if (!debt) {
      return NextResponse.json({ error: 'Debt not found' }, { status: 404 });
    }

    if (debt.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(debt);
  } catch (error) {
    console.error('GET /api/debts/[id] error:', error);
    return createErrorResponse(error);
  }
});

// PUT /api/debts/[id] - Update debt
export const PUT = withAuth(async (req: NextRequest, userId: string, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json();
    const validatedData = updateDebtSchema.parse(body);

    const repository = new PrismaDebtRepository();
    const useCase = new UpdateDebtUseCase(repository);

    const debt = await useCase.execute(params.id, validatedData);

    return NextResponse.json(debt);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('PUT /api/debts/[id] error:', error);
    return createErrorResponse(error);
  }
});

// DELETE /api/debts/[id] - Delete debt
export const DELETE = withAuth(async (req: NextRequest, userId: string, { params }: { params: { id: string } }) => {
  try {
    const repository = new PrismaDebtRepository();
    const useCase = new DeleteDebtUseCase(repository);

    await useCase.execute(params.id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/debts/[id] error:', error);
    return createErrorResponse(error);
  }
});
