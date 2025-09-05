import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { 
  LightningInvoiceRequest, 
  LightningInvoiceResponse, 
  MinmoPayoutRequest, 
  MinmoPayoutResponse,
  LightningWebhookPayload,
  MinmoPayoutWebhookPayload
} from '../types';
import logger from '../utils/logger';

class MinmoService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: config.minmo.apiUrl,
      headers: {
        'Authorization': `Bearer ${config.minmo.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add request/response interceptors for logging
    this.api.interceptors.request.use(
      (config) => {
        logger.debug('Minmo API Request:', {
          method: config.method,
          url: config.url,
          data: config.data,
        });
        return config;
      },
      (error) => {
        logger.error('Minmo API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        logger.debug('Minmo API Response:', {
          status: response.status,
          data: response.data,
        });
        return response;
      },
      (error) => {
        logger.error('Minmo API Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  async generateLightningInvoice(invoiceRequest: LightningInvoiceRequest): Promise<LightningInvoiceResponse> {
    try {
      const response = await this.api.post('/lightning/invoice', {
        ...invoiceRequest,
        callbackUrl: `${config.telegram.webhookUrl}/api/lightning/callback`,
      });

      return {
        success: true,
        invoice: response.data.invoice,
        invoiceId: response.data.invoiceId,
        expiresAt: new Date(response.data.expiresAt),
      };
    } catch (error: unknown) {
      logger.error('Failed to generate Lightning invoice:', error);
      return {
        success: false,
        invoice: '',
        invoiceId: '',
        expiresAt: new Date(),
        error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Invoice generation failed',
      };
    }
  }

  async executeMpesaPayout(payoutRequest: MinmoPayoutRequest): Promise<MinmoPayoutResponse> {
    try {
      const response = await this.api.post('/payouts/mpesa', {
        ...payoutRequest,
        callbackUrl: `${config.telegram.webhookUrl}/api/minmo/payout-callback`,
      });

      return {
        success: true,
        transactionId: response.data.transactionId,
        message: response.data.message,
      };
    } catch (error: unknown) {
      logger.error('Failed to execute M-Pesa payout:', error);
      return {
        success: false,
        transactionId: '',
        error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'M-Pesa payout failed',
      };
    }
  }

  async convertKesToSats(kshAmount: number): Promise<{ satsAmount: number; rate: number }> {
    try {
      const response = await this.api.post('/exchange/convert', {
        amount: kshAmount,
        from: 'KES',
        to: 'SATS',
      });

      return {
        satsAmount: response.data.satsAmount,
        rate: response.data.rate,
      };
    } catch (error: unknown) {
      logger.error('Failed to convert KES to sats:', error);
      throw new Error('KES to sats conversion failed');
    }
  }

  async getExchangeRate(): Promise<number> {
    try {
      const response = await this.api.get('/exchange/rate/KES/BTC');
      return response.data.rate;
    } catch (error: unknown) {
      logger.error('Failed to get exchange rate:', error);
      throw new Error('Failed to fetch exchange rate');
    }
  }

  async verifyWebhook(payload: unknown, signature: string): Promise<boolean> {
    try {
      // Implement webhook signature verification
      // This would typically involve HMAC verification
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', config.minmo.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      logger.error('Webhook verification failed:', error);
      return false;
    }
  }

  async processLightningWebhook(payload: LightningWebhookPayload): Promise<boolean> {
    try {
      logger.info('Processing Lightning webhook:', payload);
      
      if (payload.status === 'paid') {
        // Lightning invoice was paid, now trigger M-Pesa payout
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to process Lightning webhook:', error);
      return false;
    }
  }

  async processPayoutWebhook(payload: MinmoPayoutWebhookPayload): Promise<boolean> {
    try {
      logger.info('Processing M-Pesa payout webhook:', payload);
      
      if (payload.status === 'success') {
        // M-Pesa payout was successful
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to process payout webhook:', error);
      return false;
    }
  }
}

export const minmoService = new MinmoService();
