import { coinMarketCapClient } from './coinmarketcap-client';
import prisma from '../database/prisma-client';

export class CryptoPriceUpdater {
  private updateInterval: number;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(updateIntervalMinutes: number = 5) {
    this.updateInterval = updateIntervalMinutes * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Update prices for all holdings (automated background service)
   * This runs via cron job and updates prices for all users
   */
  async updateAllPrices(): Promise<void> {
    try {
      // Get all unique symbols from all users' holdings
      const holdings = await prisma.cryptoHolding.findMany({
        select: { symbol: true },
        distinct: ['symbol'],
      });
      const uniqueSymbols = holdings.map((h) => h.symbol);

      if (uniqueSymbols.length === 0) {
        console.log('No crypto holdings to update');
        return;
      }

      console.log(`Updating prices for ${uniqueSymbols.length} cryptocurrencies...`);

      // Fetch prices from CoinMarketCap
      const quotes = await coinMarketCapClient.fetchCryptoPrices(uniqueSymbols);

      // Update prices in database
      for (const quote of quotes) {
        // Update CryptoPrice table (global price data)
        await prisma.cryptoPrice.upsert({
          where: { symbol: quote.symbol },
          update: {
            price: quote.price,
            marketCap: quote.marketCap,
            volume24h: quote.volume24h,
            percentChange24h: quote.percentChange24h,
            percentChange7d: quote.percentChange7d,
            lastUpdated: quote.lastUpdated,
          },
          create: {
            symbol: quote.symbol,
            price: quote.price,
            marketCap: quote.marketCap,
            volume24h: quote.volume24h,
            percentChange24h: quote.percentChange24h,
            percentChange7d: quote.percentChange7d,
            lastUpdated: quote.lastUpdated,
          },
        });

        // Save to price history
        await prisma.cryptoPriceHistory.create({
          data: {
            symbol: quote.symbol,
            price: quote.price,
            timestamp: new Date(),
          },
        });

        // Update current price for all users' holdings with this symbol
        await prisma.cryptoHolding.updateMany({
          where: { symbol: quote.symbol },
          data: {
            currentPrice: quote.price,
            lastPriceUpdate: new Date(),
          },
        });
      }

      console.log(`Successfully updated prices for ${quotes.length} cryptocurrencies`);
    } catch (error: any) {
      console.error('Error updating crypto prices:', error.message);
    }
  }

  /**
   * Start automatic price updates
   */
  start(): void {
    if (this.intervalId) {
      console.log('Price updater is already running');
      return;
    }

    console.log(`Starting crypto price updater (interval: ${this.updateInterval / 1000 / 60} minutes)`);

    // Run immediately on start
    this.updateAllPrices();

    // Then run at intervals
    this.intervalId = setInterval(() => {
      this.updateAllPrices();
    }, this.updateInterval);
  }

  /**
   * Stop automatic price updates
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Crypto price updater stopped');
    }
  }

  /**
   * Check if updater is running
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }
}

// Export singleton instance
export const cryptoPriceUpdater = new CryptoPriceUpdater(5); // Update every 5 minutes
