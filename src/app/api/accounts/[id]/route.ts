import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaAccountRepository } from '@/lib/infrastructure/database/repositories';
import { GetAccountsUseCase } from '@/lib/application/use-cases/accounts/GetAccountsUseCase';
import { AccountType } from '@/lib/domain/entities/Account';
import { z, ZodError } from 'zod';

const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.nativeEnum(AccountType).optional(),
  balance: z.number().min(0).optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/accounts/[id] - Get account by ID
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const repository = new PrismaAccountRepository();
    const useCase = new GetAccountsUseCase(repository);

    const account = await useCase.getById(id);

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('GET /api/accounts/[id] error:', error);
    return createErrorResponse(error);
  }
});

// PUT /api/accounts/[id] - Update account
export const PUT = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const validatedData = updateAccountSchema.parse(body);

    const repository = new PrismaAccountRepository();
    const account = await repository.update(id, validatedData);

    return NextResponse.json(account);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('PUT /api/accounts/[id] error:', error);
    return createErrorResponse(error);
  }
});

// DELETE /api/accounts/[id] - Delete account
export const DELETE = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const repository = new PrismaAccountRepository();
    await repository.delete(id);

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/accounts/[id] error:', error);
    return createErrorResponse(error);
  }
});
