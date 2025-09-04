export interface UserSession {
  userId: number;
  currentService?: ServiceType;
  paymentData?: PaymentData;
  lightningInvoice?: string;
  invoiceId?: string;
  rateLock?: RateLock;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RateLock {
  rate: number;
  satsAmount: number;
  kshAmount: number;
  lockedAt: Date;
  expiresAt: Date;
  invoiceId: string;
}

export type ServiceType = 
  | 'airtime'
  | 'paybill'
  | 'goods'
  | 'send_money'
  | 'pochi'
  | 'qr_scan';

export interface PaymentData {
  service: ServiceType;
  amount: number;
  phoneNumber?: string;
  paybillNumber?: string;
  accountNumber?: string;
  tillNumber?: string;
  qrData?: string;
}

export interface LightningInvoiceRequest {
  amount: number; // in sats
  description: string;
  expiry: number; // in seconds
}

export interface LightningInvoiceResponse {
  success: boolean;
  invoice: string; // BOLT11 invoice
  invoiceId: string;
  expiresAt: Date;
  error?: string;
}

export interface MinmoPayoutRequest {
  amount: number; // in KES
  phoneNumber?: string;
  paybillNumber?: string;
  accountNumber?: string;
  tillNumber?: string;
  qrData?: string;
  invoiceId: string; // Reference to paid Lightning invoice
}

export interface MinmoPayoutResponse {
  success: boolean;
  transactionId: string;
  message?: string;
  error?: string;
}

export interface LightningWebhookPayload {
  invoiceId: string;
  status: 'paid' | 'expired' | 'failed';
  amount: number; // in sats
  paidAt?: Date;
  error?: string;
}

export interface MinmoPayoutWebhookPayload {
  invoiceId: string;
  transactionId: string;
  status: 'success' | 'failed';
  amount: number; // in KES
  mpesaReceiptNumber?: string;
  error?: string;
}

export interface BitcoinConversion {
  kshAmount: number;
  btcAmount: number;
  satsAmount: number;
  exchangeRate: number;
  lightningInvoice?: string;
  bitcoinAddress?: string;
}

export interface BotCommand {
  command: string;
  description: string;
  handler: () => Promise<void>;
}

export interface ServiceConfig {
  name: string;
  description: string;
  icon: string;
  requiredFields: string[];
  validationRules: Record<string, any>;
}
