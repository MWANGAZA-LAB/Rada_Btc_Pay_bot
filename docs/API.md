# Rada Bot API Documentation

## Overview

Rada Bot provides a REST API for managing M-Pesa to Bitcoin conversions. The API is built with Express.js and follows RESTful conventions.

## Base URL

```
Production: https://api.radabot.com
Development: http://localhost:3000
```

## Authentication

All API requests require authentication via API key in the header:

```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Health Check

Check if the service is running.

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "rada-bot"
}
```

### Exchange Rate

Get current Bitcoin exchange rate.

```http
GET /api/exchange-rate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rate": 43500000,
    "satsPerKes": 2300,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Telegram Webhook

Handle Telegram bot updates.

```http
POST /webhook
Content-Type: application/json

{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "is_bot": false,
      "first_name": "John",
      "username": "john_doe"
    },
    "chat": {
      "id": 123456789,
      "first_name": "John",
      "username": "john_doe",
      "type": "private"
    },
    "date": 1640995200,
    "text": "/start"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

### Minmo Webhook

Handle Minmo payment confirmations.

```http
POST /api/minmo/callback
Content-Type: application/json
X-Minmo-Signature: webhook_signature

{
  "checkoutRequestId": "ws_CO_010120241234567890",
  "resultCode": 0,
  "resultDesc": "Success",
  "amount": 1000,
  "mpesaReceiptNumber": "NLJ7RT61SV",
  "transactionDate": "2024-01-01T00:00:00.000Z",
  "phoneNumber": "254712345678"
}
```

**Response:**
```json
{
  "success": true
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common Error Codes

- `INVALID_REQUEST` - Invalid request format
- `UNAUTHORIZED` - Missing or invalid API key
- `VALIDATION_ERROR` - Request validation failed
- `SERVICE_UNAVAILABLE` - External service unavailable
- `PAYMENT_FAILED` - Payment processing failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Rate Limiting

API requests are rate limited to prevent abuse:

- **General endpoints**: 100 requests per minute
- **Webhook endpoints**: 1000 requests per minute
- **Exchange rate**: 10 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995260
```

## Webhooks

### Telegram Webhook Setup

1. Set webhook URL:
   ```bash
   curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{"url": "https://api.radabot.com/webhook"}'
   ```

2. Verify webhook:
   ```bash
   curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
   ```

### Minmo Webhook Setup

Configure webhook URL in Minmo dashboard:
```
https://api.radabot.com/api/minmo/callback
```

## SDKs

### JavaScript/TypeScript

```typescript
import { RadaBotAPI } from 'rada-bot-sdk';

const api = new RadaBotAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.radabot.com'
});

// Get exchange rate
const rate = await api.getExchangeRate();
console.log(`1 KES = ${rate.satsPerKes} sats`);
```

### Python

```python
import requests

class RadaBotAPI:
    def __init__(self, api_key, base_url='https://api.radabot.com'):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {'Authorization': f'Bearer {api_key}'}
    
    def get_exchange_rate(self):
        response = requests.get(
            f'{self.base_url}/api/exchange-rate',
            headers=self.headers
        )
        return response.json()

# Usage
api = RadaBotAPI('your-api-key')
rate = api.get_exchange_rate()
print(f"1 KES = {rate['data']['satsPerKes']} sats")
```

## Testing

### Postman Collection

Import our Postman collection for easy API testing:

[Download Collection](https://api.radabot.com/postman/collection.json)

### cURL Examples

**Health Check:**
```bash
curl -X GET "https://api.radabot.com/health"
```

**Exchange Rate:**
```bash
curl -X GET "https://api.radabot.com/api/exchange-rate" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- Telegram webhook support
- Minmo integration
- Exchange rate endpoint

## Support

- 📧 **Email**: api@radabot.com
- 💬 **Discord**: [Join our server](https://discord.gg/radabot)
- 📖 **Documentation**: [docs.radabot.com](https://docs.radabot.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/rada-bot/rada-bot/issues)
