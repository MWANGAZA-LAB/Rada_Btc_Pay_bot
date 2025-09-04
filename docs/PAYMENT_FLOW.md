# ⚡ Rada Bot Payment Flow (BTC → M-Pesa)

## Confirmed Implementation Flow

The implementation has been refined to match your specification exactly. Here's the confirmed flow:

### 1. User Input ✅
- Bot asks for service type (Paybill / Till / Airtime / Pochi / Send Money / QR)
- User enters recipient details (Paybill no. + Account / Phone number / QR payload)
- User enters amount in KES

### 2. Real-time Conversion ✅
- Backend calls Minmo API every ~30 seconds to refresh KES ↔ BTC rate
- Rate service automatically polls and updates exchange rates
- Example message shown in bot:
  ```
  Paybill: 123456
  Account: SCHOOLFEES
  Amount: KES 1,000

  💱 Rate: 1 BTC = 5,000,000 KES
  💸 You will spend: 20,000 sats
  ```
- Bot refreshes if rate changes before invoice creation

### 3. Confirmation ✅
- User confirms: ✅ Proceed
- Backend locks the rate for ~2 minutes (invoice TTL)
- Rate lock prevents rate changes during payment process

### 4. Lightning Invoice Generation ✅
- Backend calls Lightning Node (via Minmo LN API) to generate BOLT11 invoice
- Bot displays:
  ```
  ⚡ Pay 20,000 sats
  Tap to copy invoice:
  lnbc20000n1p...
  ```
- Inline buttons:
  - 🔗 Copy Invoice
  - 💳 Open Wallet (deep links into BlueWallet, Phoenix, Muun, Zeus, etc.)
  - 🔄 Refresh Rate
  - ❌ Cancel

### 5. User Pays ✅
- User pays from their own Lightning wallet → Rada does not touch custody
- Backend listens for invoice settled event via webhook
- Deep link automatically opens user's default Lightning wallet

### 6. M-Pesa Execution ✅
- Once Lightning invoice is paid:
- Backend → Minmo API → trigger M-Pesa STK push / B2C payout
- Funds are sent instantly to Paybill/Till/Phone

### 7. User Notified ✅
- Bot updates:
  ```
  ✅ Payment successful!
  KES 1,000 sent to Paybill 123456 (Account: SCHOOLFEES).
  TxID: QK123456789
  ```
- If failure → "❌ Payment failed, sats refunded automatically." (Minmo handles refund if LN invoice is paid but fiat fails)

## 🛠 Technical Implementation

### Rate Management
- **Real-time polling**: Every 30 seconds via `rateService`
- **Rate locking**: 2-minute TTL to guarantee sats ↔ KES rate
- **Live updates**: Bot shows current rate and refreshes on demand

### Lightning Integration
- **Invoice generation**: Via Minmo Lightning API
- **Webhook handling**: `/api/lightning/callback` for payment confirmations
- **Deep linking**: `lightning:` scheme opens default wallet
- **Multi-wallet support**: OS shows "Choose app" if multiple wallets installed

### M-Pesa Integration
- **Payout execution**: Via Minmo M-Pesa API
- **Webhook handling**: `/api/minmo/payout-callback` for payout confirmations
- **Error handling**: Automatic refunds if M-Pesa payout fails

### User Experience
- **Instant feel**: Real-time rate updates
- **Native integration**: Deep links to Lightning wallets
- **Frictionless**: Copy invoice or open wallet with one tap
- **Transparent**: Clear rate display and payment status

## 🔄 Webhook Flow

```
1. User pays Lightning invoice
   ↓
2. Lightning webhook → /api/lightning/callback
   ↓
3. Backend triggers M-Pesa payout
   ↓
4. M-Pesa payout webhook → /api/minmo/payout-callback
   ↓
5. User receives success notification
```

## 📱 Bot UI/UX Features

- **Real-time rate display**: Shows current BTC/KES rate
- **Rate refresh**: Users can refresh rates before confirming
- **Invoice copying**: One-tap copy to clipboard
- **Wallet deep links**: Automatic wallet opening
- **Progress tracking**: Clear status updates throughout process
- **Error handling**: Graceful failure with automatic refunds

## ✅ Confirmation

This implementation exactly matches your refined specification:

- ✅ **BTC → M-Pesa flow** (not M-Pesa → BTC)
- ✅ **Real-time rate polling** every 30 seconds
- ✅ **Rate locking** with 2-minute TTL
- ✅ **Lightning invoice generation** with BOLT11
- ✅ **Wallet deep linking** with `lightning:` scheme
- ✅ **Multi-wallet support** via OS app selection
- ✅ **Instant M-Pesa execution** after Lightning payment
- ✅ **Comprehensive error handling** with automatic refunds
- ✅ **Native UX** with copy/open wallet buttons

The user experience is now **instant & native**:
1. Enter KES amount
2. See sats conversion live
3. Tap to pay LN invoice
4. Receive M-Pesa confirmation

🚀 **Ready for production deployment!**
