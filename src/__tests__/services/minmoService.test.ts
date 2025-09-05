// Mock axios
jest.mock('axios');
const mockedAxios = require('axios');

// Mock the axios.create method before importing MinmoService
const mockAxiosInstance = {
  post: jest.fn(),
  get: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

mockedAxios.create.mockReturnValue(mockAxiosInstance);

// Import after mocking
import { minmoService } from '../../services/minmoService';
import { 
  LightningInvoiceRequest, 
  MinmoPayoutRequest,
  LightningWebhookPayload,
  MinmoPayoutWebhookPayload
} from '../../types';

describe('MinmoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock instance
    mockAxiosInstance.post.mockClear();
    mockAxiosInstance.get.mockClear();
  });

  describe('generateLightningInvoice', () => {
    it('should generate lightning invoice successfully', async () => {
      const mockResponse = {
        data: {
          invoice: 'lnbc2300n1p...',
          invoiceId: 'test-invoice-id',
          amount: 2300,
          expiresAt: '2024-01-01T00:05:00Z',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const invoiceRequest: LightningInvoiceRequest = {
        amount: 2300,
        description: 'Test payment',
        expiry: 300,
      };

      const result = await minmoService.generateLightningInvoice(invoiceRequest);

      expect(result.invoice).toBe('lnbc2300n1p...');
      expect(result.invoiceId).toBe('test-invoice-id');
      expect(result.success).toBe(true);
    });

    it('should handle lightning invoice generation failure', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Invoice generation failed'));

      const invoiceRequest: LightningInvoiceRequest = {
        amount: 2300,
        description: 'Test payment',
        expiry: 300,
      };

      const result = await minmoService.generateLightningInvoice(invoiceRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invoice generation failed');
    });
  });

  describe('executeMpesaPayout', () => {
    it('should execute M-Pesa payout successfully', async () => {
      const mockResponse = {
        data: {
          transactionId: 'test-transaction-id',
          status: 'pending',
          amount: 1000,
          phoneNumber: '254712345678',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const payoutRequest: MinmoPayoutRequest = {
        invoiceId: 'test-invoice-id',
        amount: 1000,
        phoneNumber: '254712345678',
      };

      const result = await minmoService.executeMpesaPayout(payoutRequest);

      expect(result.transactionId).toBe('test-transaction-id');
      expect(result.success).toBe(true);
    });

    it('should handle M-Pesa payout failure', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Payout failed'));

      const payoutRequest: MinmoPayoutRequest = {
        invoiceId: 'test-invoice-id',
        amount: 1000,
        phoneNumber: '254712345678',
      };

      const result = await minmoService.executeMpesaPayout(payoutRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('M-Pesa payout failed');
    });
  });

  describe('convertKesToSats', () => {
    it('should convert KES to sats successfully', async () => {
      const mockResponse = {
        data: {
          satsAmount: 2300,
          rate: 43500000,
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await minmoService.convertKesToSats(1000);

      expect(result.satsAmount).toBe(2300);
      expect(result.rate).toBe(43500000);
    });

    it('should handle conversion failure', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Conversion failed'));

      await expect(minmoService.convertKesToSats(1000)).rejects.toThrow('KES to sats conversion failed');
    });
  });

  describe('getExchangeRate', () => {
    it('should get exchange rate successfully', async () => {
      const mockResponse = {
        data: {
          rate: 43500000,
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const rate = await minmoService.getExchangeRate();

      expect(rate).toBe(43500000);
    });

    it('should handle exchange rate failure', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Rate fetch failed'));

      await expect(minmoService.getExchangeRate()).rejects.toThrow();
    });
  });

  describe('verifyWebhook', () => {
    it('should verify webhook signature correctly', async () => {
      const payload = { test: 'data' };
      const signature = 'valid-signature';

      // Mock crypto
      const mockCrypto = {
        createHmac: jest.fn().mockReturnValue({
          update: jest.fn().mockReturnThis(),
          digest: jest.fn().mockReturnValue('valid-signature'),
        }),
      };

      jest.doMock('crypto', () => mockCrypto);

      const result = await minmoService.verifyWebhook(payload, signature);

      expect(result).toBe(true);
    });
  });

  describe('processLightningWebhook', () => {
    it('should process successful lightning webhook', async () => {
      const payload: LightningWebhookPayload = {
        invoiceId: 'test-invoice-id',
        status: 'paid',
        amount: 2300,
        paidAt: new Date('2024-01-01T00:00:00Z'),
      };

      const result = await minmoService.processLightningWebhook(payload);

      expect(result).toBe(true);
    });

    it('should handle failed lightning webhook', async () => {
      const payload: LightningWebhookPayload = {
        invoiceId: 'test-invoice-id',
        status: 'failed',
        amount: 2300,
      };

      const result = await minmoService.processLightningWebhook(payload);

      expect(result).toBe(false);
    });
  });

  describe('processPayoutWebhook', () => {
    it('should process successful payout webhook', async () => {
      const payload: MinmoPayoutWebhookPayload = {
        invoiceId: 'test-invoice-id',
        transactionId: 'test-transaction-id',
        status: 'success',
        amount: 1000,
      };

      const result = await minmoService.processPayoutWebhook(payload);

      expect(result).toBe(true);
    });

    it('should handle failed payout webhook', async () => {
      const payload: MinmoPayoutWebhookPayload = {
        invoiceId: 'test-invoice-id',
        transactionId: 'test-transaction-id',
        status: 'failed',
        amount: 1000,
      };

      const result = await minmoService.processPayoutWebhook(payload);

      expect(result).toBe(false);
    });
  });
});