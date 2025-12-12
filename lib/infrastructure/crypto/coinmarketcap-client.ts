import axios, { AxiosInstance } from 'axios';

export interface CryptoQuote {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
  percentChange24h: number;
  percentChange7d: number;
  lastUpdated: Date;
}

export interface CoinMarketCapResponse {
  data: {
    [key: string]: {
      id: number;
      name: string;
      symbol: string;
      quote: {
        [currency: string]: {
          price: number;
          volume_24h: number;
          volume_change_24h: number;
          percent_change_1h: number;
          percent_change_24h: number;
          percent_change_7d: number;
          percent_change_30d: number;
          market_cap: number;
          market_cap_dominance: number;
          fully_diluted_market_cap: number;
          last_updated: string;
        };
      };
    };
  };
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
  };
}

export class CoinMarketCapClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.COINMARKETCAP_API_KEY || '';

    if (!this.apiKey) {
      console.warn('CoinMarketCap API key is not configured. Crypto price updates will not work.');
    }

    this.client = axios.create({
      baseURL: 'https://pro-api.coinmarketcap.com/v1',
      headers: {
        'X-CMC_PRO_API_KEY': this.apiKey,
        Accept: 'application/json',
      },
      timeout: 10000,
    });
  }

  /**
   * Fetch current prices for multiple crypto symbols
   */
  async fetchCryptoPrices(symbols: string[], currency: string = 'MXN'): Promise<CryptoQuote[]> {
    if (!this.apiKey) {
      throw new Error('CoinMarketCap API key is not configured');
    }

    if (symbols.length === 0) {
      return [];
    }

    try {
      const response = await this.client.get<CoinMarketCapResponse>(
        '/cryptocurrency/quotes/latest',
        {
          params: {
            symbol: symbols.join(','),
            convert: currency,
          },
        }
      );

      const quotes: CryptoQuote[] = [];

      for (const symbol of symbols) {
        const data = response.data.data[symbol];
        if (data && data.quote && data.quote[currency]) {
          const currencyQuote = data.quote[currency];
          quotes.push({
            symbol: data.symbol,
            name: data.name,
            price: currencyQuote.price,
            marketCap: currencyQuote.market_cap,
            volume24h: currencyQuote.volume_24h,
            percentChange24h: currencyQuote.percent_change_24h,
            percentChange7d: currencyQuote.percent_change_7d,
            lastUpdated: new Date(currencyQuote.last_updated),
          });
        }
      }

      return quotes;
    } catch (error: any) {
      console.error('Error fetching crypto prices from CoinMarketCap:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw new Error(`Failed to fetch crypto prices: ${error.message}`);
    }
  }

  /**
   * Fetch details for a single cryptocurrency
   */
  async fetchCryptoDetails(symbol: string): Promise<CryptoQuote | null> {
    const quotes = await this.fetchCryptoPrices([symbol]);
    return quotes.length > 0 ? quotes[0] : null;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      await this.client.get('/key/info');
      return true;
    } catch (error) {
      console.error('CoinMarketCap API connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const coinMarketCapClient = new CoinMarketCapClient();
