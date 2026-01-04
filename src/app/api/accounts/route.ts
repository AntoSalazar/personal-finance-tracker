import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaAccountRepository } from '@/lib/infrastructure/database/repositories';
import { CreateAccountUseCase } from '@/lib/application/use-cases/accounts/CreateAccountUseCase';
import { GetAccountsUseCase } from '@/lib/application/use-cases/accounts/GetAccountsUseCase';
import { AccountType } from '@/lib/domain/entities/Account';
import { z, ZodError } from 'zod';

const createAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.nativeEnum(AccountType),
  balance: z.number(), // Allow negative balances for credit cards and liabilities
  currency: z.string().default('USD'),
  description: z.string().optional(),
});

type CreateAccountInput = z.infer<typeof createAccountSchema>;

// GET /api/accounts - Get all accounts
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const repository = new PrismaAccountRepository();
    const useCase = new GetAccountsUseCase(repository);

    const accounts = await useCase.execute(userId);
    const totalBalance = await useCase.getTotalBalance(userId);

    return NextResponse.json({
      accounts,
      totalBalance,
    });
  } catch (error) {
    console.error('GET /api/accounts error:', error);
    return createErrorResponse(error);
  }
});

// POST /api/accounts - Create new account
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const body = await req.json();
    const validatedData = createAccountSchema.parse(body);

    const repository = new PrismaAccountRepository();
    const useCase = new CreateAccountUseCase(repository);

    const account = await useCase.execute(validatedData, userId);

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/accounts error:', error);
    return createErrorResponse(error);
  }
});
