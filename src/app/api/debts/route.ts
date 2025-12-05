import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaDebtRepository } from '@/lib/infrastructure/database/repositories/PrismaDebtRepository';
import { CreateDebtUseCase } from '@/lib/application/use-cases/debts/CreateDebtUseCase';
import { GetDebtsUseCase } from '@/lib/application/use-cases/debts/GetDebtsUseCase';
import { z, ZodError } from 'zod';

const createDebtSchema = z.object({
  personName: z.string().min(1, 'Person name is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  dueDate: z.string().transform((val) => new Date(val)).optional(),
  notes: z.string().optional(),
});

// GET /api/debts - Get all debts for the authenticated user
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const isPaid = searchParams.get('isPaid');

    const repository = new PrismaDebtRepository();
    const useCase = new GetDebtsUseCase(repository);

    const filter: any = {};
    if (isPaid !== null) {
      filter.isPaid = isPaid === 'true';
    }

    const debts = await useCase.getByUserId(userId, filter);

    return NextResponse.json({ debts });
  } catch (error) {
    console.error('GET /api/debts error:', error);
    return createErrorResponse(error);
  }
});

// POST /api/debts - Create new debt
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const body = await req.json();
    const validatedData = createDebtSchema.parse(body);

    const repository = new PrismaDebtRepository();
    const useCase = new CreateDebtUseCase(repository);

    const debt = await useCase.execute({
      ...validatedData,
      userId,
    });

    return NextResponse.json(debt, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('POST /api/debts error:', error);
    return createErrorResponse(error);
  }
});
