import { minmoService } from '../../services/minmoService';
import { MinmoPaymentRequest, MinmoWebhookPayload } from '../../types';

// Mock axios
jest.mock('axios');
const mockedAxios = require('axios');

describe('MinmoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initiatePayment', () => {
    it('should initiate payment successfully', async () => {
      const mockResponse = {
        data: {
          checkoutRequestId: 'test-checkout-id',
          qrCode: 'test-qr-code',
          stkPushSent: true,
          message: 'Payment initiated successfully',
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const paymentRequest: MinmoPaymentRequest = {
        amount: 1000,
        phoneNumber: '254712345678',
        callbackUrl: 'https://test.com/callback',
      };

      const result = await minmoService.initiatePayment(paymentRequest);

      expect(result.success).toBe(true);
      expect(result.checkoutRequestId).toBe('test-checkout-id');
      expect(result.qrCode).toBe('test-qr-code');
      expect(result.stkPushSent).toBe(true);
    });

    it('should handle payment initiation failure', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Payment failed',
          },
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const paymentRequest: MinmoPaymentRequest = {
        amount: 1000,
        phoneNumber: '254712345678',
        callbackUrl: 'https://test.com/callback',
      };

      const result = await minmoService.initiatePayment(paymentRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment failed');
    });
  });

  describe('convertToBitcoin', () => {
    it('should convert KES to Bitcoin successfully', async () => {
      const mockResponse = {
        data: {
          btcAmount: 0.000023,
          satsAmount: 2300,
          exchangeRate: 43500000,
          lightningInvoice: 'lnbc2300n1p...',
          bitcoinAddress: 'bc1q...',
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const result = await minmoService.convertToBitcoin(1000);

      expect(result.kshAmount).toBe(1000);
      expect(result.btcAmount).toBe(0.000023);
      expect(result.satsAmount).toBe(2300);
      expect(result.exchangeRate).toBe(43500000);
      expect(result.lightningInvoice).toBe('lnbc2300n1p...');
    });

    it('should handle conversion failure', async () => {
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(new Error('Conversion failed')),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      await expect(minmoService.convertToBitcoin(1000)).rejects.toThrow('Bitcoin conversion failed');
    });
  });

  describe('getExchangeRate', () => {
    it('should get exchange rate successfully', async () => {
      const mockResponse = {
        data: {
          rate: 43500000,
        },
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const rate = await minmoService.getExchangeRate();

      expect(rate).toBe(43500000);
    });

    it('should handle exchange rate failure', async () => {
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('Rate fetch failed')),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      await expect(minmoService.getExchangeRate()).rejects.toThrow('Failed to fetch exchange rate');
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

  describe('processWebhook', () => {
    it('should process successful webhook', async () => {
      const payload: MinmoWebhookPayload = {
        checkoutRequestId: 'test-checkout-id',
        resultCode: 0,
        resultDesc: 'Success',
        amount: 1000,
        mpesaReceiptNumber: 'test-receipt',
        transactionDate: '2024-01-01T00:00:00Z',
        phoneNumber: '254712345678',
      };

      const result = await minmoService.processWebhook(payload);

      expect(result).toBe(true);
    });

    it('should handle failed webhook', async () => {
      const payload: MinmoWebhookPayload = {
        checkoutRequestId: 'test-checkout-id',
        resultCode: 1,
        resultDesc: 'Failed',
        amount: 1000,
      };

      const result = await minmoService.processWebhook(payload);

      expect(result).toBe(false);
    });
  });
});
