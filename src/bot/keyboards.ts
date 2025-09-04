import { InlineKeyboard, Keyboard } from 'grammy';
import { ServiceType } from '../types';

export const mainMenuKeyboard = new InlineKeyboard([
  [
    { text: '📱 Buy Airtime', callback_data: 'service_airtime' },
    { text: '🏢 Paybill', callback_data: 'service_paybill' },
  ],
  [
    { text: '🛒 Buy Goods', callback_data: 'service_goods' },
    { text: '💸 Send Money', callback_data: 'service_send_money' },
  ],
  [
    { text: '💰 Lipa na Pochi', callback_data: 'service_pochi' },
    { text: '📷 Scan QR Code', callback_data: 'service_qr_scan' },
  ],
  [
    { text: 'ℹ️ Help', callback_data: 'help' },
    { text: '📊 Exchange Rate', callback_data: 'exchange_rate' },
  ],
]);

export const cancelKeyboard = new InlineKeyboard([
  [{ text: '❌ Cancel', callback_data: 'cancel' }],
]);

export const backToMenuKeyboard = new InlineKeyboard([
  [{ text: '🏠 Back to Menu', callback_data: 'main_menu' }],
]);

export const confirmPaymentKeyboard = new InlineKeyboard([
  [
    { text: '✅ Confirm Payment', callback_data: 'confirm_payment' },
    { text: '❌ Cancel', callback_data: 'cancel' },
  ],
]);

export function getLightningInvoiceKeyboard(invoice: string): InlineKeyboard {
  return new InlineKeyboard([
    [
      { text: '🔗 Copy Invoice', callback_data: `copy_invoice_${invoice.substring(0, 20)}` },
    ],
    [
      { text: '💳 Open Wallet', url: `lightning:${invoice}` },
    ],
    [
      { text: '🔄 Refresh Rate', callback_data: 'refresh_rate' },
      { text: '❌ Cancel', callback_data: 'cancel' },
    ],
  ]);
}

export function getServiceKeyboard(service: ServiceType): InlineKeyboard {
  const keyboards: Record<ServiceType, InlineKeyboard> = {
    airtime: new InlineKeyboard([
      [{ text: '📱 Enter Phone Number', callback_data: 'input_phone' }],
      [{ text: '🏠 Back to Menu', callback_data: 'main_menu' }],
    ]),
    
    paybill: new InlineKeyboard([
      [{ text: '🏢 Enter Paybill Number', callback_data: 'input_paybill' }],
      [{ text: '🏠 Back to Menu', callback_data: 'main_menu' }],
    ]),
    
    goods: new InlineKeyboard([
      [{ text: '🛒 Enter Till Number', callback_data: 'input_till' }],
      [{ text: '🏠 Back to Menu', callback_data: 'main_menu' }],
    ]),
    
    send_money: new InlineKeyboard([
      [{ text: '💸 Enter Phone Number', callback_data: 'input_phone' }],
      [{ text: '🏠 Back to Menu', callback_data: 'main_menu' }],
    ]),
    
    pochi: new InlineKeyboard([
      [{ text: '💰 Enter Phone Number', callback_data: 'input_phone' }],
      [{ text: '🏠 Back to Menu', callback_data: 'main_menu' }],
    ]),
    
    qr_scan: new InlineKeyboard([
      [{ text: '📷 Upload QR Image', callback_data: 'upload_qr' }],
      [{ text: '🏠 Back to Menu', callback_data: 'main_menu' }],
    ]),
  };

  return keyboards[service];
}

export const helpKeyboard = new InlineKeyboard([
  [{ text: '🏠 Back to Menu', callback_data: 'main_menu' }],
]);

export const exchangeRateKeyboard = new InlineKeyboard([
  [{ text: '🔄 Refresh Rate', callback_data: 'exchange_rate' }],
  [{ text: '🏠 Back to Menu', callback_data: 'main_menu' }],
]);
