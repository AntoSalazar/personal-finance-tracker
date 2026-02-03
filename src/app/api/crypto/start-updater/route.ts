import { NextResponse } from 'next/server';
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
 *       500:
 *         description: Internal server error
 */
export async function POST() {
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
    return NextResponse.json(
      { error: 'Failed to start price updater' },
      { status: 500 }
    );
  }
}

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
 */
export async function GET() {
  const isRunning = cryptoPriceUpdater.isRunning();
  return NextResponse.json({ isRunning });
}
