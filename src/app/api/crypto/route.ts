import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import {
  PrismaCryptoRepository,
  PrismaAccountRepository,
  PrismaTransactionRepository
} from '@/lib/infrastructure/database/repositories';
import { CreateCryptoHoldingUseCase } from '@/lib/application/use-cases/crypto/CreateCryptoHoldingUseCase';
import { GetCryptoPortfolioUseCase } from '@/lib/application/use-cases/crypto/GetCryptoPortfolioUseCase';
import { z, ZodError } from 'zod';

// Parse date in local timezone (Mexico City)
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // Noon local time to avoid timezone issues
};

const createHoldingSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  name: z.string().min(1, 'Name is required'),
  amount: z.number().positive('Amount must be positive'),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  purchaseDate: z.string().transform(parseLocalDate),
  purchaseFee: z.number().nonnegative('Fee cannot be negative').optional(),
  notes: z.string().optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     CryptoHolding:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         symbol:
 *           type: string
 *         name:
 *           type: string
 *         amount:
 *           type: number
 *         purchasePrice:
 *           type: number
 *         currentPrice:
 *           type: number
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *         purchaseFee:
 *           type: number
 *         notes:
 *           type: string
 *     CreateCryptoHoldingInput:
 *       type: object
 *       required:
 *         - symbol
 *         - name
 *         - amount
 *         - purchasePrice
 *         - purchaseDate
 *       properties:
 *         symbol:
 *           type: string
 *         name:
 *           type: string
 *         amount:
 *           type: number
 *         purchasePrice:
 *           type: number
 *         purchaseDate:
 *           type: string
 *           format: date
 *         purchaseFee:
 *           type: number
 *         notes:
 *           type: string
 *         accountId:
 *           type: string
 *         categoryId:
 *           type: string
 */

// GET /api/crypto - Get crypto portfolio
/**
 * @swagger
 * /api/crypto:
 *   get:
 *     summary: Get crypto portfolio
 *     description: Retrieve all crypto holdings for the user.
 *     tags:
 *       - Crypto
 *     responses:
 *       200:
 *         description: Successfully retrieved crypto portfolio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 holdings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CryptoHolding'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a crypto holding
 *     description: Add a new cryptocurrency holding to the portfolio.
 *     tags:
 *       - Crypto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCryptoHoldingInput'
 *     responses:
 *       201:
 *         description: Crypto holding successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CryptoHolding'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const repository = new PrismaCryptoRepository();
    const useCase = new GetCryptoPortfolioUseCase(repository);

    const portfolio = await useCase.execute(userId);

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('GET /api/crypto error:', error);
    return createErrorResponse(error);
  }
});

// POST /api/crypto - Create new crypto holding
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const body = await req.json();
    const validatedData = createHoldingSchema.parse(body);

    const cryptoRepository = new PrismaCryptoRepository();
    const accountRepository = new PrismaAccountRepository();
    const transactionRepository = new PrismaTransactionRepository();

    const useCase = new CreateCryptoHoldingUseCase(
      cryptoRepository,
      accountRepository,
      transactionRepository
    );

    const { categoryId, ...holdingData } = validatedData as any;
    const holding = await useCase.execute(holdingData, userId, categoryId);

    return NextResponse.json(holding, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/crypto error:', error);
    return createErrorResponse(error);
  }
});
