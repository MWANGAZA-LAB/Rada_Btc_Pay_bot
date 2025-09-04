import { 
  validatePaymentData, 
  formatPhoneNumber, 
  formatAmount, 
  formatSats 
} from '../../utils/validation';

describe('Validation Utils', () => {
  describe('validatePaymentData', () => {
    it('should validate airtime payment data correctly', () => {
      const data = {
        phoneNumber: '0712345678',
        amount: 100,
      };
      
      const result = validatePaymentData('airtime', data);
      
      expect(result.isValid).toBe(true);
      expect(result.validatedData).toEqual({
        service: 'airtime',
        phoneNumber: '0712345678',
        amount: 100,
      });
    });

    it('should validate paybill payment data correctly', () => {
      const data = {
        paybillNumber: '123456',
        accountNumber: 'John Doe',
        amount: 500,
      };
      
      const result = validatePaymentData('paybill', data);
      
      expect(result.isValid).toBe(true);
      expect(result.validatedData).toEqual({
        service: 'paybill',
        paybillNumber: '123456',
        accountNumber: 'John Doe',
        amount: 500,
      });
    });

    it('should reject invalid phone numbers', () => {
      const data = {
        phoneNumber: 'invalid',
        amount: 100,
      };
      
      const result = validatePaymentData('airtime', data);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('valid Kenyan phone number');
    });

    it('should reject amounts below minimum', () => {
      const data = {
        phoneNumber: '0712345678',
        amount: 5,
      };
      
      const result = validatePaymentData('airtime', data);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Minimum amount is KES 10');
    });

    it('should reject amounts above maximum', () => {
      const data = {
        phoneNumber: '0712345678',
        amount: 200000,
      };
      
      const result = validatePaymentData('airtime', data);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Maximum amount is KES 150,000');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format phone numbers correctly', () => {
      expect(formatPhoneNumber('0712345678')).toBe('254712345678');
      expect(formatPhoneNumber('254712345678')).toBe('254712345678');
      expect(formatPhoneNumber('712345678')).toBe('254712345678');
      expect(formatPhoneNumber('+254712345678')).toBe('254712345678');
    });
  });

  describe('formatAmount', () => {
    it('should format amounts correctly', () => {
      expect(formatAmount(1000)).toBe('KES 1,000');
      expect(formatAmount(100.50)).toBe('KES 100.5');
      expect(formatAmount(0)).toBe('KES 0');
    });
  });

  describe('formatSats', () => {
    it('should format sats correctly', () => {
      expect(formatSats(1000)).toBe('1,000 sats');
      expect(formatSats(1000000)).toBe('1,000,000 sats');
      expect(formatSats(0)).toBe('0 sats');
    });
  });
});
