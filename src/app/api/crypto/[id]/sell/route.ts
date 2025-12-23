import { NextRequest, NextResponse } from 'next/server';
import { SellCryptoHoldingUseCase } from '@/lib/application/use-cases/crypto/SellCryptoHoldingUseCase';
import {
  PrismaCryptoRepository,
  PrismaAccountRepository,
  PrismaTransactionRepository
} from '@/lib/infrastructure/database/repositories';
import { z, ZodError } from 'zod';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';

const sellCryptoSchema = z.object({
  salePrice: z.number().positive('Sale price must be positive'),
  saleDate: z.string().datetime(),
  saleFee: z.number().nonnegative('Fee cannot be negative').optional(),
  saleAccountId: z.string().min(1, 'Destination account is required'),
  categoryId: z.string().min(1, 'Category is required'),
});

export const POST = withAuth(async (
  request: NextRequest,
  userId: string,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: holdingId } = await context!.params;
    const body = await request.json();

    const validatedData = sellCryptoSchema.parse(body);

    // Parse date in local timezone (Mexico City)
    const saleDate = new Date(validatedData.saleDate);

    // Create repositories and use case
    const cryptoRepository = new PrismaCryptoRepository();
    const accountRepository = new PrismaAccountRepository();
    const transactionRepository = new PrismaTransactionRepository();

    const sellCryptoUseCase = new SellCryptoHoldingUseCase(
      cryptoRepository,
      accountRepository,
      transactionRepository
    );

    // Execute the use case
    const updatedHolding = await sellCryptoUseCase.execute(
      holdingId,
      {
        salePrice: validatedData.salePrice,
        saleDate,
        saleFee: validatedData.saleFee,
        saleAccountId: validatedData.saleAccountId,
        categoryId: validatedData.categoryId,
      },
      userId
    );

    return NextResponse.json(updatedHolding, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/crypto/[id]/sell error:', error);
    return createErrorResponse(error);
  }
});
