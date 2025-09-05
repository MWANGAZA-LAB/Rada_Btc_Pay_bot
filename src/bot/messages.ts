import { ServiceType } from '../types';
import { formatAmount, formatSats } from '../utils/validation';
import { rateService } from '../services/rateService';

export const messages = {
  welcome: `🚀 *Welcome to Rada Bot!*

Seamlessly pay M-Pesa with Bitcoin Lightning payments.

*What can you do?*
• Buy Airtime with Bitcoin
• Pay bills with Bitcoin
• Buy goods with Bitcoin
• Send money with Bitcoin
• Use Lipa na Pochi with Bitcoin
• Scan QR codes with Bitcoin

*How it works:*
1️⃣ Choose a service
2️⃣ Enter payment details
3️⃣ Copy Lightning invoice to your wallet
4️⃣ M-Pesa service delivered instantly

*Ready to start?* Choose a service below! 👇`,

  help: `ℹ️ *Rada Bot Help*

*Available Services:*
📱 *Buy Airtime* - Top up your phone with Bitcoin
🏢 *Paybill* - Pay bills with Bitcoin
🛒 *Buy Goods* - Purchase goods with Bitcoin
💸 *Send Money* - Send money with Bitcoin
💰 *Lipa na Pochi* - Use Pochi with Bitcoin
📷 *Scan QR* - Scan QR codes with Bitcoin

*How to use:*
1. Select a service from the main menu
2. Follow the prompts to enter details
3. Confirm your payment with current rate
4. Copy Lightning invoice to your wallet
5. M-Pesa service delivered instantly

*How to Pay:*
• Copy the Lightning invoice to any Bitcoin wallet
• Paste into your Lightning-compatible wallet
• Complete payment and M-Pesa service is delivered instantly

*Need help?* Contact support or use the /start command to return to the main menu.`,


  serviceInstructions: {
    airtime: `📱 *Buy Airtime with Bitcoin*

Enter the phone number you want to top up:
• Format: 0712345678 or +254712345678
• Must be a valid Kenyan number

*Example:* 0712345678`,

    paybill: `🏢 *Paybill Payment*

Enter the paybill number:
• Format: 5-7 digits
• Example: 123456

*Next:* You'll be asked for the account number.`,

    goods: `🛒 *Buy Goods*

Enter the till number:
• Format: 5-7 digits
• Example: 123456

*Next:* You'll be asked for the amount.`,

    send_money: `💸 *Send Money*

Enter the recipient's phone number:
• Format: 0712345678 or +254712345678
• Must be a valid Kenyan number

*Example:* 0712345678`,

    pochi: `💰 *Lipa na Pochi*

Enter your phone number:
• Format: 0712345678 or +254712345678
• Must be a valid Kenyan number

*Example:* 0712345678`,

    qr_scan: `📷 *Scan QR Code*

Upload a QR code image or enter QR data:
• Supported formats: PNG, JPG, JPEG
• Or paste QR code text directly

*Next:* You'll be asked for the amount.`,
  },

  inputPrompts: {
    phone: `📱 *Enter Phone Number*

Please enter the phone number:
• Format: 0712345678 or +254712345678
• Must be a valid Kenyan number`,

    paybill: `🏢 *Enter Paybill Number*

Please enter the paybill number:
• Format: 5-7 digits
• Example: 123456`,

    account: `📋 *Enter Account Number*

Please enter the account number:
• This is usually your name or account reference
• Example: John Doe or ACC001`,

    till: `🛒 *Enter Till Number*

Please enter the till number:
• Format: 5-7 digits
• Example: 123456`,

    amount: `💰 *Enter Amount*

Please enter the amount in KES:
• Minimum: KES 10
• Maximum: KES 150,000
• Example: 1000`,

    qr: `📷 *Upload QR Code*

Please upload a QR code image or enter the QR data directly.`,
  },

  confirmations: {
    airtime: (phone: string, amount: number, satsAmount: number, rate: string) => 
      `📱 *Confirm Airtime Purchase*

*Phone:* ${phone}
*Amount:* ${formatAmount(amount)}

${rate}

💸 *You will spend:* ${formatSats(satsAmount)}

*Next:* Pay Lightning invoice to complete payment.`,

    paybill: (paybill: string, account: string, amount: number, satsAmount: number, rate: string) =>
      `🏢 *Confirm Paybill Payment*

*Paybill:* ${paybill}
*Account:* ${account}
*Amount:* ${formatAmount(amount)}

${rate}

💸 *You will spend:* ${formatSats(satsAmount)}

*Next:* Pay Lightning invoice to complete payment.`,

    goods: (till: string, amount: number, satsAmount: number, rate: string) =>
      `🛒 *Confirm Goods Purchase*

*Till:* ${till}
*Amount:* ${formatAmount(amount)}

${rate}

💸 *You will spend:* ${formatSats(satsAmount)}

*Next:* Pay Lightning invoice to complete payment.`,

    send_money: (phone: string, amount: number, satsAmount: number, rate: string) =>
      `💸 *Confirm Send Money*

*Recipient:* ${phone}
*Amount:* ${formatAmount(amount)}

${rate}

💸 *You will spend:* ${formatSats(satsAmount)}

*Next:* Pay Lightning invoice to complete payment.`,

    pochi: (phone: string, amount: number, satsAmount: number, rate: string) =>
      `💰 *Confirm Lipa na Pochi*

*Phone:* ${phone}
*Amount:* ${formatAmount(amount)}

${rate}

💸 *You will spend:* ${formatSats(satsAmount)}

*Next:* Pay Lightning invoice to complete payment.`,

    qr_scan: (amount: number, satsAmount: number, rate: string) =>
      `📷 *Confirm QR Payment*

*Amount:* ${formatAmount(amount)}

${rate}

💸 *You will spend:* ${formatSats(satsAmount)}

*Next:* Pay Lightning invoice to complete payment.`,
  },

  lightningInvoice: (satsAmount: number, invoice: string) =>
    `⚡ *Pay ${formatSats(satsAmount)}*

\`${invoice}\`

*Tap a wallet below, copy the invoice, or scan QR code.*`,

  paymentSuccess: (kshAmount: number, recipient: string, transactionId: string) =>
    `✅ *Payment Successful!*

*KES ${kshAmount.toLocaleString()} sent to ${recipient}*
*Transaction ID:* ${transactionId}

*Thank you for using Rada Bot!* 🚀`,

  qrScanInstructions: `📷 *QR Code Scanner*

*How to scan:*
1. Tap "📷 Scan QR" button
2. Take a photo of the QR code
3. Bot will extract the Lightning invoice
4. Complete your payment

*Supported QR codes:*
• Lightning invoices (lnbc...)
• Bitcoin addresses
• Lightning URIs (lightning:lnbc...)

*Note:* Make sure the QR code is clear and well-lit.`,

  qrScanPrompt: `📷 *Scan QR Code*

Please send a photo of the QR code you want to scan.

*Tips:*
• Ensure good lighting
• Keep the QR code centered
• Avoid blurry images
• QR code should fill most of the frame`,

  qrScanSuccess: (invoice: string, type: string) =>
    `✅ *QR Code Scanned Successfully!*

*Type:* ${type}
*Invoice:* \`${invoice}\`

*You can now complete your payment using this invoice.*`,

  qrScanError: (error: string) =>
    `❌ *QR Code Scan Failed*

*Error:* ${error}

*Please try again with a clearer image or use the copy option instead.*`,

  qrMpesaMerchant: (data: Record<string, unknown>) => {
    const merchant = data.merchantName || 'Unknown Merchant';
    const destination = data.paybillNumber ? `Paybill: ${data.paybillNumber}` : `Till: ${data.tillNumber}`;
    const account = data.accountNumber ? `\n*Account:* ${data.accountNumber}` : '';
    const amount = data.amount ? `\n*Amount:* KES ${data.amount.toLocaleString()}` : '';
    
    return `🏪 *M-Pesa Merchant Detected*

*Merchant:* ${merchant}
*Destination:* ${destination}${account}${amount}

*This will create a Lightning invoice to pay this M-Pesa merchant.*`;
  },

  qrPhoneNumber: (phoneNumber: string) =>
    `📱 *Phone Number Detected*

*Number:* ${phoneNumber}

*This will create a Lightning invoice to send money to this phone number.*

*Enter the amount you want to send:*`,

  qrCustomPayment: (data: Record<string, unknown>) => {
    const merchant = data.merchantName || 'Custom Payment';
    const amount = data.amount ? `\n*Amount:* ${data.currency || 'KES'} ${data.amount.toLocaleString()}` : '';
    const reference = data.reference ? `\n*Reference:* ${data.reference}` : '';
    
    return `💳 *Custom Payment Detected*

*Merchant:* ${merchant}${amount}${reference}

*This will create a Lightning invoice for this custom payment.*`;
  },

  qrConfirmationPrompt: (type: string, data: Record<string, unknown>) => {
    const rateStatus = rateService.getRateStatus();
    const amount = typeof data.amount === 'number' ? data.amount : 0;
    const satsAmount = rateService.convertKesToSats(amount);
    
    return `✅ *Confirm Payment*

*Type:* ${type}
*Amount:* KES ${amount.toLocaleString()}
*Bitcoin Cost:* ${formatSats(satsAmount)}
*Rate:* 1 BTC = ${rateStatus.rate.toLocaleString()} KES

*Rate valid for 2 minutes*

*Create Lightning Invoice?*`;
  },

  qrRateExpired: () =>
    `⏰ *Rate Expired*

The exchange rate has expired. Please scan the QR code again to get a fresh rate.

*Rate expires after 2 minutes for security.*`,

  paymentFailed: (reason: string) =>
    `❌ *Payment Failed*

*Reason:* ${reason}

Please try again or contact support if the issue persists.`,

  exchangeRate: (rate: number, satsPerKes: number, isFallback: boolean = false) =>
    `📊 *Current Exchange Rate*

*1 KES = ${satsPerKes} sats*
*1 BTC = ${formatAmount(rate)} KES*${isFallback ? ' (Fallback Rate)' : ''}

*Last updated:* ${new Date().toLocaleString('en-KE')}${isFallback ? '\n\n⚠️ *Note:* Using fallback rate due to API unavailability' : ''}`,

  errors: {
    invalidInput: '❌ Invalid input. Please try again.',
    serviceUnavailable: '⚠️ Service temporarily unavailable. Please try again later.',
    insufficientFloat: '⚠️ Insufficient float. Please try again later.',
    invalidPhone: '❌ Invalid phone number. Please enter a valid Kenyan number.',
    invalidAmount: '❌ Invalid amount. Please enter an amount between KES 10 and KES 150,000.',
    invalidPaybill: '❌ Invalid paybill number. Please enter 5-7 digits.',
    invalidTill: '❌ Invalid till number. Please enter 5-7 digits.',
    paymentTimeout: '⏰ Payment timeout. Please try again.',
    conversionFailed: '❌ Bitcoin conversion failed. Please try again.',
  },

  system: {
    maintenance: '🔧 System under maintenance. Please try again later.',
    rateLimit: '⏳ Too many requests. Please wait a moment and try again.',
    sessionExpired: '⏰ Session expired. Please start over with /start.',
  },
};

export function getServiceMessage(service: ServiceType): string {
  return messages.serviceInstructions[service];
}

export function getInputPrompt(field: string): string {
  return messages.inputPrompts[field as keyof typeof messages.inputPrompts] || 'Please enter the required information:';
}

interface PaymentData {
  phoneNumber?: string;
  paybillNumber?: string;
  accountNumber?: string;
  tillNumber?: string;
  amount: number;
}

export function getConfirmationMessage(service: ServiceType, data: PaymentData, satsAmount: number, rate: string): string {
  const confirmation = messages.confirmations[service];
  if (typeof confirmation === 'function') {
    switch (service) {
      case 'airtime':
        return (confirmation as (phone: string, amount: number, satsAmount: number, rate: string) => string)(data.phoneNumber!, data.amount, satsAmount, rate);
      case 'send_money':
        return (confirmation as (phone: string, amount: number, satsAmount: number, rate: string) => string)(data.phoneNumber!, data.amount, satsAmount, rate);
      case 'pochi':
        return (confirmation as (phone: string, amount: number, satsAmount: number, rate: string) => string)(data.phoneNumber!, data.amount, satsAmount, rate);
      case 'paybill':
        return (confirmation as (paybill: string, account: string, amount: number, satsAmount: number, rate: string) => string)(data.paybillNumber!, data.accountNumber!, data.amount, satsAmount, rate);
      case 'goods':
        return (confirmation as (till: string, amount: number, satsAmount: number, rate: string) => string)(data.tillNumber!, data.amount, satsAmount, rate);
      case 'qr_scan':
        return (confirmation as (amount: number, satsAmount: number, rate: string) => string)(data.amount, satsAmount, rate);
      default:
        return (confirmation as (amount: number, satsAmount: number, rate: string) => string)(data.amount, satsAmount, rate);
    }
  }
  return confirmation;
}
