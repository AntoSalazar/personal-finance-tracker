import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaTransactionRepository, PrismaAccountRepository } from '@/lib/infrastructure/database/repositories';
import { CreateTransactionUseCase } from '@/lib/application/use-cases/transactions/CreateTransactionUseCase';
import { GetTransactionsUseCase } from '@/lib/application/use-cases/transactions/GetTransactionsUseCase';
import { z, ZodError } from 'zod';

// Parse date in local timezone (Mexico City)
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // Noon local time to avoid timezone issues
};

const createTransactionSchema = z.object({
  accountId: z.string(),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['EXPENSE', 'INCOME', 'TRANSFER']),
  description: z.string().min(1, 'Description is required'),
  reason: z.string().optional(),
  categoryId: z.string(),
  date: z.string().transform(parseLocalDate),
  tags: z.array(z.string()).optional(),
});

// GET /api/transactions - Get all transactions with optional filters
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const accountId = searchParams.get('accountId') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const type = searchParams.get('type') || undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const repository = new PrismaTransactionRepository();
    const useCase = new GetTransactionsUseCase(repository);

    const transactions = await useCase.execute({
      accountId,
      categoryId,
      type: type as any,
      startDate,
      endDate,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('GET /api/transactions error:', error);
    return createErrorResponse(error);
  }
});

// POST /api/transactions - Create new transaction
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const body = await req.json();
    const validatedData = createTransactionSchema.parse(body);

    const transactionRepository = new PrismaTransactionRepository();
    const accountRepository = new PrismaAccountRepository();
    const useCase = new CreateTransactionUseCase(transactionRepository, accountRepository);

    const transaction = await useCase.execute(validatedData as any);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/transactions error:', error);
    return createErrorResponse(error);
  }
});
