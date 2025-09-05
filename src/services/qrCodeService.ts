import { QrCodeParser } from 'qrcode-parser';
import logger from '../utils/logger';

export interface QRCodeResult {
  success: boolean;
  data?: string;
  error?: string;
  type?: 'lightning' | 'bitcoin' | 'text' | 'unknown';
}

class QRCodeService {
  private parser: QrCodeParser;

  constructor() {
    this.parser = new QrCodeParser();
  }

  /**
   * Parse QR code from image file
   */
  async parseQRCodeFromFile(filePath: string): Promise<QRCodeResult> {
    try {
      const result = await this.parser.parse(filePath);
      
      if (!result || !result.data) {
        return {
          success: false,
          error: 'No QR code data found in image'
        };
      }

      return this.processQRData(result.data);
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
      const result = await this.parser.parse(buffer);
      
      if (!result || !result.data) {
        return {
          success: false,
          error: 'No QR code data found in image'
        };
      }

      return this.processQRData(result.data);
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
          type: 'lightning'
        };
      }

      // Check if it's a Bitcoin address
      if (this.isBitcoinAddress(cleanData)) {
        return {
          success: true,
          data: cleanData,
          type: 'bitcoin'
        };
      }

      // Check if it's a Bitcoin URI
      if (this.isBitcoinURI(cleanData)) {
        return {
          success: true,
          data: cleanData,
          type: 'bitcoin'
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
    if (lightningMatch) {
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
}

export const qrCodeService = new QRCodeService();
