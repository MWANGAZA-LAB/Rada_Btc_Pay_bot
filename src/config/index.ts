import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Telegram Bot
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN!,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL!,
  },

  // Minmo API
  minmo: {
    apiKey: process.env.MINMO_API_KEY!,
    apiUrl: process.env.MINMO_API_URL || 'https://api.dev.minmo.to',
    webhookSecret: process.env.MINMO_WEBHOOK_SECRET!,
  },

  // Server
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Validation
  validation: {
    minAmount: 10, // Minimum KES amount
    maxAmount: 150000, // Maximum KES amount (M-Pesa limit)
    phoneNumberRegex: /^(\+254|254|0)?[17]\d{8}$/,
    paybillRegex: /^\d{5,7}$/,
    tillRegex: /^\d{5,7}$/,
  },
} as const;

// Validate required environment variables
const requiredEnvVars = [
  'TELEGRAM_BOT_TOKEN',
  'MINMO_API_KEY',
  'MINMO_WEBHOOK_SECRET',
];

// Only validate in production or when explicitly required
// Skip validation for Railway deployment to allow health checks to work
const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_SERVICE_ID;
if ((process.env.NODE_ENV === 'production' || process.env.VALIDATE_ENV === 'true') && !isRailway) {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}
