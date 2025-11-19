import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { cryptoPriceUpdater } from '@/lib/infrastructure/crypto/price-updater';

// POST /api/crypto/update-prices - Manually trigger price update
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    await cryptoPriceUpdater.updateAllPrices();

    return NextResponse.json({ message: 'Crypto prices updated successfully' });
  } catch (error) {
    console.error('POST /api/crypto/update-prices error:', error);
    return createErrorResponse(error);
  }
});
