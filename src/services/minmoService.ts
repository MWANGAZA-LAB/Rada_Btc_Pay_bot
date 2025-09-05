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

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

class MinmoService {
  private api: AxiosInstance;
  private authApi: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    // API instance for authenticated requests
    this.api = axios.create({
      baseURL: config.minmo.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Separate instance for authentication requests
    this.authApi = axios.create({
      baseURL: config.minmo.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      async (config) => {
        // Ensure we have a valid token before making requests
        await this.ensureAuthenticated();
        
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        
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

    // Add response interceptors for logging
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

    this.authApi.interceptors.response.use(
      (response) => {
        logger.debug('Minmo Auth API Response:', {
          status: response.status,
          data: response.data,
        });
        return response;
      },
      (error) => {
        logger.error('Minmo Auth API Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Authenticate with Minmo API using email and password
   */
  private async authenticate(): Promise<void> {
    try {
      // For now, we'll use the API key as a password and a default email
      // In production, you should have proper credentials
      const loginRequest: LoginRequest = {
        email: process.env.MINMO_EMAIL || 'bot@minmo.com',
        password: config.minmo.apiKey, // Using API key as password for now
      };

      const response = await this.authApi.post<LoginResponse>('/api/v1/auth/login', loginRequest);
      
      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      logger.info('Successfully authenticated with Minmo API');
    } catch (error: unknown) {
      logger.error('Failed to authenticate with Minmo API:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Ensure we have a valid authentication token
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  async generateLightningInvoice(invoiceRequest: LightningInvoiceRequest): Promise<LightningInvoiceResponse> {
    try {
      // Try the new API endpoint first
      const response = await this.api.post('/api/v1/lightning/invoices', {
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
      logger.error('Failed to generate Lightning invoice with new API:', error);
      
      // Fallback to old endpoint if new API is not available
      try {
        logger.info('Attempting fallback to legacy Lightning invoice endpoint');
        const fallbackResponse = await this.api.post('/lightning/invoice', {
          ...invoiceRequest,
          callbackUrl: `${config.telegram.webhookUrl}/api/lightning/callback`,
        });

        return {
          success: true,
          invoice: fallbackResponse.data.invoice,
          invoiceId: fallbackResponse.data.invoiceId,
          expiresAt: new Date(fallbackResponse.data.expiresAt),
        };
      } catch (fallbackError: unknown) {
        logger.error('Fallback Lightning invoice generation also failed:', fallbackError);
        return {
          success: false,
          invoice: '',
          invoiceId: '',
          expiresAt: new Date(),
          error: 'Lightning invoice generation failed - API endpoints not available',
        };
      }
    }
  }

  async executeMpesaPayout(payoutRequest: MinmoPayoutRequest): Promise<MinmoPayoutResponse> {
    try {
      // Try the new API endpoint first
      const response = await this.api.post('/api/v1/mpesa/payouts', {
        ...payoutRequest,
        callbackUrl: `${config.telegram.webhookUrl}/api/minmo/payout-callback`,
      });

      return {
        success: true,
        transactionId: response.data.transactionId,
        message: response.data.message,
      };
    } catch (error: unknown) {
      logger.error('Failed to execute M-Pesa payout with new API:', error);
      
      // Fallback to old endpoint if new API is not available
      try {
        logger.info('Attempting fallback to legacy M-Pesa payout endpoint');
        const fallbackResponse = await this.api.post('/payouts/mpesa', {
          ...payoutRequest,
          callbackUrl: `${config.telegram.webhookUrl}/api/minmo/payout-callback`,
        });

        return {
          success: true,
          transactionId: fallbackResponse.data.transactionId,
          message: fallbackResponse.data.message,
        };
      } catch (fallbackError: unknown) {
        logger.error('Fallback M-Pesa payout also failed:', fallbackError);
        return {
          success: false,
          transactionId: '',
          error: 'M-Pesa payout failed - API endpoints not available',
        };
      }
    }
  }

  async convertKesToSats(kshAmount: number): Promise<{ satsAmount: number; rate: number }> {
    try {
      const response = await this.api.post('/api/v1/exchange/convert', {
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
      // Try the new API endpoint first
      const response = await this.api.get('/api/v1/exchange/rates/KES/BTC');
      return response.data.rate;
    } catch (error: unknown) {
      logger.error('Failed to get exchange rate from new Minmo API:', error);
      
      // Fallback to old endpoint if new API is not available
      try {
        logger.info('Attempting fallback to legacy exchange rate endpoint');
        const fallbackResponse = await this.api.get('/exchange/rate/KES/BTC');
        return fallbackResponse.data.rate;
      } catch (fallbackError: unknown) {
        logger.error('Fallback exchange rate endpoint also failed:', fallbackError);
        // Return a fallback rate when API is unavailable
        logger.info('Using fallback exchange rate: 43,500,000 KES per BTC');
        return 43500000; // Fallback rate: ~$1 = 150 KES, 1 BTC = $65,000
      }
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
