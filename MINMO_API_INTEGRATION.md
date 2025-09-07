# Minmo API Integration - Bitcoin/Lightning Services

## Overview
This document outlines the complete integration with Minmo API for Bitcoin and Lightning Network services. The implementation follows fintech best practices with proper authentication, error handling, and security measures.

## API Endpoints Implemented

### 1. Generate Lightning Address
- **Endpoint**: `POST /api/v1/bitcoin/address`
- **Purpose**: Creates a new Lightning address for receiving payments
- **Method**: `generateLightningAddress()`
- **Returns**: `{ success: boolean; address?: string; error?: string }`

### 2. Validate Lightning Invoice
- **Endpoint**: `POST /api/v1/bitcoin/invoice/validate`
- **Purpose**: Validates a BOLT11 Lightning invoice
- **Method**: `validateLightningInvoice(invoice: string)`
- **Returns**: `{ success: boolean; valid?: boolean; amount?: number; error?: string }`

### 3. Generate Lightning Invoice
- **Endpoint**: `POST /api/v1/bitcoin/invoice`
- **Purpose**: Creates a new BOLT11 Lightning invoice
- **Method**: `generateLightningInvoice(invoiceRequest: LightningInvoiceRequest)`
- **Returns**: `LightningInvoiceResponse`

### 4. Pay Lightning Invoice
- **Endpoint**: `POST /api/v1/bitcoin/pay`
- **Purpose**: Initiates payment of a Lightning invoice
- **Method**: `payLightningInvoice(invoice: string, amount?: number)`
- **Returns**: `{ success: boolean; paymentId?: string; error?: string }`

### 5. Check Bitcoin Balance
- **Endpoint**: `GET /api/v1/bitcoin/balance`
- **Purpose**: Gets the current Bitcoin/Lightning balance
- **Method**: `checkBitcoinBalance()`
- **Returns**: `{ success: boolean; balance?: { sats: number; btc: number }; error?: string }`

## Additional Services

### Exchange Rate Service
- **Endpoint**: `GET /api/v1/fx/rates/KES/BTC`
- **Purpose**: Retrieves current KES to BTC exchange rate
- **Method**: `getExchangeRate()`

### Currency Conversion
- **Endpoint**: `POST /api/v1/exchange/convert`
- **Purpose**: Converts KES to Satoshis
- **Method**: `convertKesToSats(kshAmount: number)`

### M-Pesa Payout Service
- **Endpoint**: `POST /api/v1/mpesa/payouts`
- **Purpose**: Processes M-Pesa payment after Lightning invoice is paid
- **Method**: `executeMpesaPayout(payoutRequest: MinmoPayoutRequest)`

### Service Health Check
- **Method**: `getServiceHealth()`
- **Purpose**: Checks if all Minmo API services are operational
- **Returns**: Comprehensive health status of all services

## Authentication

### JWT Token Authentication
All API calls require proper JWT authentication:

1. **Login**: `POST /api/v1/auth/login`
   - Requires: `email` and `password`
   - Returns: `access_token`, `token_type`, `expires_in`

2. **Token Management**: Automatic token refresh and validation
3. **Request Headers**: `Authorization: Bearer <jwt_token>`

### Environment Variables Required
```env
MINMO_EMAIL=your_minmo_email@minmo.com
MINMO_PASSWORD=your_minmo_password
MINMO_API_URL=https://api.dev.minmo.to
MINMO_WEBHOOK_SECRET=your_webhook_secret
```

## Error Handling

### Comprehensive Error Management
- All methods return structured error responses
- Proper logging for debugging and monitoring
- Graceful failure with meaningful error messages
- No fallback/mock data - fails properly when API unavailable

### Error Response Format
```typescript
{
  success: false,
  error: "Descriptive error message - Minmo API authentication required"
}
```

## Security Features

### Webhook Verification
- HMAC signature verification for incoming webhooks
- Secure payload validation
- Protection against replay attacks

### Request Security
- All requests use HTTPS
- Proper authentication headers
- Request timeout handling (30 seconds)
- Input validation and sanitization

## Integration Flow

### Complete Payment Flow
1. **User initiates payment** → Bot receives payment request
2. **Get exchange rate** → `getExchangeRate()` for current KES/BTC rate
3. **Convert amount** → `convertKesToSats()` to get satoshi amount
4. **Generate invoice** → `generateLightningInvoice()` creates BOLT11 invoice
5. **User pays invoice** → Lightning payment processed
6. **Webhook notification** → `processLightningWebhook()` handles payment confirmation
7. **M-Pesa payout** → `executeMpesaPayout()` sends money to user's M-Pesa

### Service Health Monitoring
- Regular health checks via `getServiceHealth()`
- Authentication status monitoring
- Service availability tracking
- Error rate monitoring

## Production Readiness

### Fintech Compliance
- ✅ No mock/fallback data
- ✅ Real-time exchange rates
- ✅ Secure authentication
- ✅ Comprehensive error handling
- ✅ Webhook security
- ✅ Audit logging
- ✅ Service monitoring

### Scalability Features
- Connection pooling
- Request timeout handling
- Automatic token refresh
- Rate limiting compliance
- Error recovery mechanisms

## Usage Examples

### Generate Lightning Invoice
```typescript
const minmoService = new MinmoService();
const invoice = await minmoService.generateLightningInvoice({
  amount: 1000, // sats
  description: "Airtime purchase",
  expiry: 3600 // 1 hour
});
```

### Check Balance
```typescript
const balance = await minmoService.checkBitcoinBalance();
console.log(`Balance: ${balance.balance?.sats} sats`);
```

### Validate Invoice
```typescript
const validation = await minmoService.validateLightningInvoice(invoiceString);
if (validation.valid) {
  console.log(`Valid invoice for ${validation.amount} sats`);
}
```

## Monitoring and Logging

### Comprehensive Logging
- All API calls logged with timestamps
- Error details captured for debugging
- Performance metrics tracked
- Security events monitored

### Health Monitoring
- Service availability checks
- Authentication status
- API response times
- Error rates and patterns

This implementation provides a production-ready, secure, and scalable integration with the Minmo API for Bitcoin and Lightning Network services.
