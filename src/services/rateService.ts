import { minmoService } from './minmoService';
import { RateLock } from '../types';
import logger from '../utils/logger';

class RateService {
  private currentRate: number = 0;
  private lastUpdated: Date = new Date(0);
  private updateInterval: number = 30000; // 30 seconds
  private rateLocks: Map<string, RateLock> = new Map();

  constructor() {
    this.startRatePolling();
  }

  private async startRatePolling(): Promise<void> {
    try {
      await this.updateRate();
      
      setInterval(async () => {
        try {
          await this.updateRate();
        } catch (error) {
          logger.error('Failed to update exchange rate:', error);
        }
      }, this.updateInterval);
    } catch (error) {
      logger.error('Failed to start rate polling:', error);
    }
  }

  private async updateRate(): Promise<void> {
    try {
      const rate = await minmoService.getExchangeRate();
      this.currentRate = rate;
      this.lastUpdated = new Date();
      
      logger.debug('Exchange rate updated:', { rate, timestamp: this.lastUpdated });
    } catch (error) {
      logger.error('Failed to fetch exchange rate:', error);
    }
  }

  public getCurrentRate(): number {
    return this.currentRate;
  }

  public getLastUpdated(): Date {
    return this.lastUpdated;
  }

  public convertKesToSats(kshAmount: number): number {
    if (this.currentRate === 0) {
      throw new Error('Exchange rate not available');
    }
    
    // Convert KES to BTC, then to sats
    const btcAmount = kshAmount / this.currentRate;
    return Math.round(btcAmount * 100000000); // Convert BTC to sats
  }

  public convertSatsToKes(satsAmount: number): number {
    if (this.currentRate === 0) {
      throw new Error('Exchange rate not available');
    }
    
    // Convert sats to BTC, then to KES
    const btcAmount = satsAmount / 100000000;
    return btcAmount * this.currentRate;
  }

  public lockRate(kshAmount: number, invoiceId: string, ttlMinutes: number = 2): RateLock {
    const satsAmount = this.convertKesToSats(kshAmount);
    const lockedAt = new Date();
    const expiresAt = new Date(lockedAt.getTime() + ttlMinutes * 60 * 1000);

    const rateLock: RateLock = {
      rate: this.currentRate,
      satsAmount,
      kshAmount,
      lockedAt,
      expiresAt,
      invoiceId,
    };

    this.rateLocks.set(invoiceId, rateLock);
    
    // Clean up expired locks
    this.cleanupExpiredLocks();
    
    logger.info('Rate locked:', rateLock);
    
    return rateLock;
  }

  public getRateLock(invoiceId: string): RateLock | null {
    const lock = this.rateLocks.get(invoiceId);
    
    if (!lock) {
      return null;
    }
    
    if (new Date() > lock.expiresAt) {
      this.rateLocks.delete(invoiceId);
      return null;
    }
    
    return lock;
  }

  public isRateLockValid(invoiceId: string): boolean {
    const lock = this.getRateLock(invoiceId);
    return lock !== null;
  }

  private cleanupExpiredLocks(): void {
    const now = new Date();
    
    for (const [invoiceId, lock] of this.rateLocks.entries()) {
      if (now > lock.expiresAt) {
        this.rateLocks.delete(invoiceId);
        logger.debug('Expired rate lock cleaned up:', invoiceId);
      }
    }
  }

  public getRateDisplay(): string {
    const satsPerKes = this.convertKesToSats(1);
    return `💱 Rate: 1 BTC = ${this.currentRate.toLocaleString()} KES\n💸 1 KES = ${satsPerKes} sats`;
  }

  public getRateStatus(): {
    rate: number;
    satsPerKes: number;
    lastUpdated: Date;
    isStale: boolean;
  } {
    const satsPerKes = this.convertKesToSats(1);
    const isStale = Date.now() - this.lastUpdated.getTime() > this.updateInterval * 2;
    
    return {
      rate: this.currentRate,
      satsPerKes,
      lastUpdated: this.lastUpdated,
      isStale,
    };
  }
}

export const rateService = new RateService();
