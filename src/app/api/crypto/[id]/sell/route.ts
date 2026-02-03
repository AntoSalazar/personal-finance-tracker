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

/**
 * @swagger
 * components:
 *   schemas:
 *     SellCryptoHoldingInput:
 *       type: object
 *       required:
 *         - salePrice
 *         - saleDate
 *         - saleAccountId
 *         - categoryId
 *       properties:
 *         salePrice:
 *           type: number
 *         saleDate:
 *           type: string
 *           format: date-time
 *         saleFee:
 *           type: number
 *         saleAccountId:
 *           type: string
 *         categoryId:
 *           type: string
 */

/**
 * @swagger
 * /api/crypto/{id}/sell:
 *   post:
 *     summary: Sell a crypto holding
 *     description: Sell an existing crypto holding or a portion of it.
 *     tags:
 *       - Crypto
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SellCryptoHoldingInput'
 *     responses:
 *       200:
 *         description: Crypto holding successfully sold
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CryptoHolding'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Crypto holding not found
 *       500:
 *         description: Internal server error
 */
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
