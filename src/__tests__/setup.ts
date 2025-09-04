// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock environment variables for testing
process.env.TELEGRAM_BOT_TOKEN = 'test_bot_token';
process.env.MINMO_API_KEY = 'test_api_key';
process.env.MINMO_WEBHOOK_SECRET = 'test_webhook_secret';
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';

// Global test timeout
jest.setTimeout(10000);

// Test to ensure setup works
describe('Test Setup', () => {
  it('should load environment variables', () => {
    expect(process.env.TELEGRAM_BOT_TOKEN).toBe('test_bot_token');
    expect(process.env.MINMO_API_KEY).toBe('test_api_key');
    expect(process.env.NODE_ENV).toBe('test');
  });
});
