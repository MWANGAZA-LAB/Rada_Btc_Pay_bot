import logger from '../utils/logger';

export interface QRCodeResult {
  success: boolean;
  data?: string;
  error?: string;
  type?: 'lightning' | 'bitcoin' | 'mpesa_merchant' | 'phone_number' | 'custom_payment' | 'text' | 'unknown';
  parsedData?: ParsedQRData;
}

export interface ParsedQRData {
  merchantName?: string | undefined;
  paybillNumber?: string | undefined;
  tillNumber?: string | undefined;
  accountNumber?: string | undefined;
  phoneNumber?: string | undefined;
  amount?: number | undefined;
  currency?: string | undefined;
  reference?: string | undefined;
  lightningInvoice?: string | undefined;
  bitcoinAddress?: string | undefined;
  customData?: Record<string, unknown> | undefined;
}

class QRCodeService {
  constructor() {
    // No need to instantiate qrcode-parser as it's a function
  }

  /**
   * Parse QR code from image file
   */
  async parseQRCodeFromFile(filePath: string): Promise<QRCodeResult> {
    try {
      const { default: qrcodeParser } = await import('qrcode-parser');
      const result = await qrcodeParser(filePath);
      
      if (!result) {
        return {
          success: false,
          error: 'No QR code data found in image'
        };
      }

      return this.processQRData(result);
    } catch (error) {
      logger.error('Error parsing QR code from file:', error);
      return {
        success: false,
        error: 'Failed to parse QR code. Please ensure the image contains a valid QR code.'
      };
    }
  }

  /**
   * Parse QR code from image buffer
   */
  async parseQRCodeFromBuffer(buffer: Buffer): Promise<QRCodeResult> {
    try {
      const { default: qrcodeParser } = await import('qrcode-parser');
      // Create a File from the buffer for qrcode-parser
      const file = new File([buffer], 'qr-code.png', { type: 'image/png' });
      const result = await qrcodeParser(file);
      
      if (!result) {
        return {
          success: false,
          error: 'No QR code data found in image'
        };
      }

      return this.processQRData(result);
    } catch (error) {
      logger.error('Error parsing QR code from buffer:', error);
      return {
        success: false,
        error: 'Failed to parse QR code. Please ensure the image contains a valid QR code.'
      };
    }
  }

  /**
   * Process and categorize QR code data
   */
  private processQRData(data: string): QRCodeResult {
    try {
      // Clean the data
      const cleanData = data.trim();

      // Check if it's a Lightning invoice
      if (this.isLightningInvoice(cleanData)) {
        return {
          success: true,
          data: cleanData,
          type: 'lightning',
          parsedData: {
            lightningInvoice: cleanData
          }
        };
      }

      // Check if it's a Bitcoin address
      if (this.isBitcoinAddress(cleanData)) {
        return {
          success: true,
          data: cleanData,
          type: 'bitcoin',
          parsedData: {
            bitcoinAddress: cleanData
          }
        };
      }

      // Check if it's a Bitcoin URI
      if (this.isBitcoinURI(cleanData)) {
        const address = this.extractBitcoinAddressFromURI(cleanData);
        return {
          success: true,
          data: cleanData,
          type: 'bitcoin',
          parsedData: {
            bitcoinAddress: address
          }
        };
      }

      // Check if it's an M-Pesa merchant QR
      const mpesaData = this.parseMpesaQR(cleanData);
      if (mpesaData) {
        return {
          success: true,
          data: cleanData,
          type: 'mpesa_merchant',
          parsedData: mpesaData
        };
      }

      // Check if it's a phone number QR
      const phoneData = this.parsePhoneNumberQR(cleanData);
      if (phoneData) {
        return {
          success: true,
          data: cleanData,
          type: 'phone_number',
          parsedData: phoneData
        };
      }

      // Check if it's a custom payment QR
      const customData = this.parseCustomPaymentQR(cleanData);
      if (customData) {
        return {
          success: true,
          data: cleanData,
          type: 'custom_payment',
          parsedData: customData
        };
      }

      // Return as text
      return {
        success: true,
        data: cleanData,
        type: 'text'
      };
    } catch (error) {
      logger.error('Error processing QR data:', error);
      return {
        success: false,
        error: 'Failed to process QR code data'
      };
    }
  }

  /**
   * Check if data is a Lightning invoice
   */
  private isLightningInvoice(data: string): boolean {
    // Lightning invoices start with 'lnbc' or 'lntb' or 'lnbcrt'
    return /^(lnbc|lntb|lnbcrt)[0-9]+[munp][0-9a-z]+$/i.test(data);
  }

  /**
   * Check if data is a Bitcoin address
   */
  private isBitcoinAddress(data: string): boolean {
    // Bitcoin addresses start with 1, 3, or bc1
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(data) || 
           /^bc1[a-z0-9]{39,59}$/.test(data);
  }

  /**
   * Check if data is a Bitcoin URI
   */
  private isBitcoinURI(data: string): boolean {
    return /^bitcoin:[13][a-km-zA-HJ-NP-Z1-9]{25,34}/.test(data) ||
           /^bitcoin:bc1[a-z0-9]{39,59}/.test(data);
  }

  /**
   * Extract Lightning invoice from various formats
   */
  extractLightningInvoice(data: string): string | null {
    // Direct Lightning invoice
    if (this.isLightningInvoice(data)) {
      return data;
    }

          // Lightning URI format: lightning:lnbc...
      const lightningMatch = data.match(/^lightning:(lnbc|lntb|lnbcrt)[0-9]+[munp][0-9a-z]+$/i);
      if (lightningMatch && lightningMatch[1]) {
        return lightningMatch[1] + data.substring(lightningMatch[0].length - lightningMatch[1].length);
      }

    // Extract from any text that contains a Lightning invoice
    const invoiceMatch = data.match(/(lnbc|lntb|lnbcrt)[0-9]+[munp][0-9a-z]+/i);
    if (invoiceMatch) {
      return invoiceMatch[0];
    }

    return null;
  }

  /**
   * Validate Lightning invoice format
   */
  validateLightningInvoice(invoice: string): boolean {
    return this.isLightningInvoice(invoice);
  }

  /**
   * Parse M-Pesa merchant QR codes
   */
  private parseMpesaQR(data: string): ParsedQRData | null {
    try {
      // M-Pesa QR format examples:
      // "MPESA*123456*1000*Account Reference"
      // "MPESA*TILL*987654*Account Reference"
      // "PAYBILL*123456*Account Reference*1000"
      
      const mpesaMatch = data.match(/^MPESA\*([^*]+)\*([^*]+)(?:\*([^*]+))?(?:\*([^*]+))?$/i);
      if (mpesaMatch) {
        const [, type, number, amount, reference] = mpesaMatch;
        
        if (type && type.toUpperCase() === 'TILL') {
          return {
            tillNumber: number,
            accountNumber: reference || undefined,
            amount: amount ? parseFloat(amount) : undefined,
            currency: 'KES'
          };
        } else if (type && (type.toUpperCase() === 'PAYBILL' || /^\d+$/.test(type))) {
          return {
            paybillNumber: number,
            accountNumber: reference || undefined,
            amount: amount ? parseFloat(amount) : undefined,
            currency: 'KES'
          };
        }
      }

      // Alternative PAYBILL format
      const paybillMatch = data.match(/^PAYBILL\*([^*]+)\*([^*]+)(?:\*([^*]+))?(?:\*([^*]+))?$/i);
      if (paybillMatch) {
        const [, paybill, account, amount, reference] = paybillMatch;
        return {
          paybillNumber: paybill,
          accountNumber: account,
          reference: reference || undefined,
          amount: amount ? parseFloat(amount) : undefined,
          currency: 'KES'
        };
      }

      return null;
    } catch (error) {
      logger.error('Error parsing M-Pesa QR:', error);
      return null;
    }
  }

  /**
   * Parse phone number QR codes
   */
  private parsePhoneNumberQR(data: string): ParsedQRData | null {
    try {
      // Phone number formats:
      // "0712345678"
      // "+254712345678"
      // "tel:+254712345678"
      // "sms:+254712345678"
      
      const phoneMatch = data.match(/^(?:tel:|sms:)?(\+?254|0)(\d{9})$/);
      if (phoneMatch) {
        const [, prefix, number] = phoneMatch;
        let fullNumber = number;
        
        if (prefix === '0') {
          fullNumber = '254' + number;
        } else if (prefix === '+254') {
          fullNumber = '254' + number;
        }
        
        return {
          phoneNumber: fullNumber
        };
      }

      // Direct phone number
      if (/^(?:254|0)\d{9}$/.test(data)) {
        let phoneNumber = data;
        if (data.startsWith('0')) {
          phoneNumber = '254' + data.substring(1);
        }
        return {
          phoneNumber: phoneNumber
        };
      }

      return null;
    } catch (error) {
      logger.error('Error parsing phone number QR:', error);
      return null;
    }
  }

  /**
   * Parse custom payment QR codes (JSON format)
   */
  private parseCustomPaymentQR(data: string): ParsedQRData | null {
    try {
      // Try to parse as JSON
      const jsonData = JSON.parse(data);
      
      if (jsonData.type === 'payment' || jsonData.payment) {
        return {
          merchantName: jsonData.merchant || jsonData.merchantName,
          paybillNumber: jsonData.paybill,
          tillNumber: jsonData.till,
          accountNumber: jsonData.account,
          phoneNumber: jsonData.phone,
          amount: jsonData.amount,
          currency: jsonData.currency || 'KES',
          reference: jsonData.reference,
          customData: jsonData
        };
      }

      return null;
    } catch (error) {
      // Not JSON, try other custom formats
      logger.debug('Not a JSON custom payment QR');
      return null;
    }
  }

  /**
   * Extract Bitcoin address from Bitcoin URI
   */
  private extractBitcoinAddressFromURI(uri: string): string {
    const match = uri.match(/^bitcoin:([^?]+)/);
    return match ? match[1] || uri : uri;
  }

  /**
   * Validate M-Pesa merchant data
   */
  validateMpesaMerchant(data: ParsedQRData): boolean {
    if (!data.paybillNumber && !data.tillNumber) {
      return false;
    }

    // Validate paybill number (5-7 digits)
    if (data.paybillNumber && !/^\d{5,7}$/.test(data.paybillNumber)) {
      return false;
    }

    // Validate till number (6-7 digits)
    if (data.tillNumber && !/^\d{6,7}$/.test(data.tillNumber)) {
      return false;
    }

    return true;
  }

  /**
   * Validate phone number
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Kenyan phone number validation
    return /^254\d{9}$/.test(phoneNumber);
  }
}

export const qrCodeService = new QRCodeService();
