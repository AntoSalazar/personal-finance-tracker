import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { cryptoPriceUpdater } from '@/lib/infrastructure/crypto/price-updater';

/**
 * @swagger
 * /api/crypto/start-updater:
 *   post:
 *     summary: Start crypto price updater
 *     description: Start the background process to update crypto prices.
 *     tags:
 *       - Crypto
 *     responses:
 *       200:
 *         description: Price updater started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    if (cryptoPriceUpdater.isRunning()) {
      return NextResponse.json(
        { message: 'Price updater is already running' },
        { status: 200 }
      );
    }

    cryptoPriceUpdater.start();

    return NextResponse.json(
      { message: 'Price updater started successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error starting price updater:', error);
    return createErrorResponse(error);
  }
});

/**
 * @swagger
 * /api/crypto/start-updater:
 *   get:
 *     summary: Get price updater status
 *     description: Check if the crypto price updater is running.
 *     tags:
 *       - Crypto
 *     responses:
 *       200:
 *         description: Successfully retrieved status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isRunning:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  const isRunning = cryptoPriceUpdater.isRunning();
  return NextResponse.json({ isRunning });
});
