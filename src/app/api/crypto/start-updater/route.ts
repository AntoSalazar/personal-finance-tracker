import { NextResponse } from 'next/server';
import { cryptoPriceUpdater } from '@/lib/infrastructure/crypto/price-updater';

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

export async function GET() {
  const isRunning = cryptoPriceUpdater.isRunning();
  return NextResponse.json({ isRunning });
}
