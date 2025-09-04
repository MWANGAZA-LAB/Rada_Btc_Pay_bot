import { ServiceType } from '../types';
import { formatAmount, formatSats } from '../utils/validation';

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
3️⃣ Pay Lightning invoice
4️⃣ M-Pesa payment sent instantly

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
4. Pay Lightning invoice from your wallet
5. M-Pesa payment sent instantly

*Supported Wallets:*
• BlueWallet, Phoenix, Muun, Zeus
• Any Lightning-compatible wallet
• Deep links automatically open your wallet

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

*Lightning Invoice:*
\`${invoice}\`

*Tap to copy invoice or use the buttons below to open your wallet.*`,

  paymentSuccess: (kshAmount: number, recipient: string, transactionId: string) =>
    `✅ *Payment Successful!*

*KES ${kshAmount.toLocaleString()} sent to ${recipient}*
*Transaction ID:* ${transactionId}

*Thank you for using Rada Bot!* 🚀`,

  paymentFailed: (reason: string) =>
    `❌ *Payment Failed*

*Reason:* ${reason}

Please try again or contact support if the issue persists.`,

  exchangeRate: (rate: number, satsPerKes: number) =>
    `📊 *Current Exchange Rate*

*1 KES = ${satsPerKes} sats*
*1 BTC = ${formatAmount(rate)} KES*

*Last updated:* ${new Date().toLocaleString('en-KE')}`,

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

export function getConfirmationMessage(service: ServiceType, data: any, satsAmount: number, rate: string): string {
  const confirmation = messages.confirmations[service];
  if (typeof confirmation === 'function') {
    switch (service) {
      case 'airtime':
      case 'send_money':
      case 'pochi':
        return confirmation(data.phoneNumber, data.amount, satsAmount, rate);
      case 'paybill':
        return confirmation(data.paybillNumber, data.accountNumber, data.amount, satsAmount, rate);
      case 'goods':
        return confirmation(data.tillNumber, data.amount, satsAmount, rate);
      case 'qr_scan':
        return confirmation(data.amount, satsAmount, rate);
      default:
        return confirmation(data.amount, satsAmount, rate);
    }
  }
  return confirmation;
}
