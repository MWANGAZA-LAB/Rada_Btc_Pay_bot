import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server as HttpServer } from 'http';
import { config } from '../config';
import { RadaBot } from '../bot/bot';
import { sessionManager } from '../services/sessionManager';
import { minmoService } from '../services/minmoService';
import { LightningWebhookPayload, MinmoPayoutWebhookPayload, MinmoPayoutRequest } from '../types';
import { messages } from '../bot/messages';
import logger from '../utils/logger';

class Server {
  private app: express.Application;
  private bot: RadaBot;
  private server: HttpServer | null = null;

  constructor() {
    this.app = express();
    this.bot = new RadaBot();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({ 
        message: 'Rada Bot API is running',
        timestamp: new Date().toISOString(),
        service: 'rada-bot'
      });
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      try {
        res.json({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          service: 'rada-bot',
          uptime: process.uptime(),
          environment: config.server.nodeEnv
        });
      } catch (error) {
        logger.error('Health check error:', error);
        res.status(500).json({ 
          status: 'unhealthy', 
          error: 'Health check failed',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Telegram webhook endpoint
    this.app.post('/webhook', async (req, res) => {
      try {
        await this.bot.getBot().handleUpdate(req.body);
        res.status(200).json({ success: true });
      } catch (error) {
        logger.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
      }
    });

    // Lightning webhook endpoint
    this.app.post('/api/lightning/callback', async (req, res) => {
      try {
        await this.handleLightningWebhook(req, res);
      } catch (error) {
        logger.error('Lightning webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
      }
    });

    // Minmo payout webhook endpoint
    this.app.post('/api/minmo/payout-callback', async (req, res) => {
      try {
        await this.handleMinmoPayoutWebhook(req, res);
      } catch (error) {
        logger.error('Minmo payout webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
      }
    });

    // Exchange rate endpoint
    this.app.get('/api/exchange-rate', async (req, res) => {
      try {
        const rate = await minmoService.getExchangeRate();
        const satsPerKes = Math.round(100000000 / rate);
        
        res.json({
          success: true,
          data: {
            rate,
            satsPerKes,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        logger.error('Exchange rate error:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to fetch exchange rate' 
        });
      }
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });

    // Error handler
    this.app.use((error: Error, req: express.Request, res: express.Response) => {
      logger.error('Unhandled error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  private async handleLightningWebhook(req: express.Request, res: express.Response): Promise<void> {
    try {
      const signature = req.get('X-Minmo-Signature');
      const payload: LightningWebhookPayload = req.body;

      // Verify webhook signature
      if (!signature || !await minmoService.verifyWebhook(payload, signature)) {
        logger.warn('Invalid Lightning webhook signature');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      // Process the Lightning webhook
      const success = await minmoService.processLightningWebhook(payload);
      
      if (success && payload.status === 'paid') {
        // Find user session by invoice ID
        const userId = await this.findUserByInvoiceId(payload.invoiceId);
        
        if (userId) {
          // Trigger M-Pesa payout
          await this.processLightningPayment(userId, payload);
        }

        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ error: 'Lightning payment processing failed' });
      }
    } catch (error) {
      logger.error('Lightning webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  private async handleMinmoPayoutWebhook(req: express.Request, res: express.Response): Promise<void> {
    try {
      const signature = req.get('X-Minmo-Signature');
      const payload: MinmoPayoutWebhookPayload = req.body;

      // Verify webhook signature
      if (!signature || !await minmoService.verifyWebhook(payload, signature)) {
        logger.warn('Invalid Minmo payout webhook signature');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      // Process the payout webhook
      const success = await minmoService.processPayoutWebhook(payload);
      
      if (success) {
        // Find user session by invoice ID
        const userId = await this.findUserByInvoiceId(payload.invoiceId);
        
        if (userId) {
          // Notify user of successful payout
          await this.processSuccessfulPayout(userId, payload);
        }

        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ error: 'Payout processing failed' });
      }
    } catch (error) {
      logger.error('Minmo payout webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  private async findUserByInvoiceId(invoiceId: string): Promise<number | null> {
    try {
      // In a real implementation, you'd store invoice IDs in a database
      // For now, we'll use Redis to find the user
      if (config.redis.url) {
        const { createClient } = require('redis');
        const redis = createClient({ url: config.redis.url });
        await redis.connect();
        
        const userId = await redis.get(`invoice:${invoiceId}`);
        await redis.quit();
        
        return userId ? parseInt(userId) : null;
      }
      
      return null;
    } catch (error) {
      logger.error('Error finding user by invoice ID:', error);
      return null;
    }
  }

  private async processLightningPayment(userId: number, payload: LightningWebhookPayload): Promise<void> {
    try {
      // Get user session to retrieve payment details
      const session = await sessionManager.getSession(userId);
      if (!session || !session.paymentData || !session.rateLock) {
        logger.error('Invalid session for Lightning payment processing');
        return;
      }

      // Execute M-Pesa payout
      const payoutRequest: MinmoPayoutRequest = {
        amount: session.paymentData.amount,
        invoiceId: payload.invoiceId,
      };

      // Add optional fields only if they exist
      if (session.paymentData.phoneNumber) {
        payoutRequest.phoneNumber = session.paymentData.phoneNumber;
      }
      if (session.paymentData.paybillNumber) {
        payoutRequest.paybillNumber = session.paymentData.paybillNumber;
      }
      if (session.paymentData.accountNumber) {
        payoutRequest.accountNumber = session.paymentData.accountNumber;
      }
      if (session.paymentData.tillNumber) {
        payoutRequest.tillNumber = session.paymentData.tillNumber;
      }
      if (session.paymentData.qrData) {
        payoutRequest.qrData = session.paymentData.qrData;
      }

      const payoutResponse = await minmoService.executeMpesaPayout(payoutRequest);

      if (payoutResponse.success) {
        // Store transaction ID for payout webhook
        await sessionManager.updateSession(userId, { 
          transactionId: payoutResponse.transactionId 
        });
        
        logger.info('M-Pesa payout initiated', {
          userId,
          invoiceId: payload.invoiceId,
          transactionId: payoutResponse.transactionId,
        });
      } else {
        // Handle payout failure
        await this.bot.getBot().api.sendMessage(
          userId,
          '❌ *M-Pesa Payout Failed*\n\n' +
          'Your Lightning payment was received but the M-Pesa payout failed. ' +
          'Your sats will be refunded automatically.',
          { parse_mode: 'Markdown' }
        );
      }
    } catch (error) {
      logger.error('Error processing Lightning payment:', error);
    }
  }

  private async processSuccessfulPayout(userId: number, payload: MinmoPayoutWebhookPayload): Promise<void> {
    try {
      // Get user session to retrieve payment details
      const session = await sessionManager.getSession(userId);
      if (!session || !session.paymentData) {
        logger.error('Invalid session for payout processing');
        return;
      }

      // Determine recipient description
      let recipient = '';
      if (session.paymentData.phoneNumber) {
        recipient = session.paymentData.phoneNumber;
      } else if (session.paymentData.paybillNumber) {
        recipient = `Paybill ${session.paymentData.paybillNumber}`;
        if (session.paymentData.accountNumber) {
          recipient += ` (Account: ${session.paymentData.accountNumber})`;
        }
      } else if (session.paymentData.tillNumber) {
        recipient = `Till ${session.paymentData.tillNumber}`;
      }

      // Send success notification
      await this.bot.getBot().api.sendMessage(
        userId,
        messages.paymentSuccess(
          session.paymentData.amount,
          recipient,
          payload.transactionId
        ),
        { parse_mode: 'Markdown' }
      );

      // Clear user session
      await sessionManager.clearSession(userId);
      
      logger.info('Payout processed successfully', {
        userId,
        amount: session.paymentData.amount,
        transactionId: payload.transactionId,
      });
    } catch (error) {
      logger.error('Error processing successful payout:', error);
      
      // Send error notification to user
      try {
        await this.bot.getBot().api.sendMessage(
          userId,
          '❌ *Payout Processing Error*\n\n' +
          'There was an error processing your payout. ' +
          'Please contact support with your transaction details.',
          { parse_mode: 'Markdown' }
        );
      } catch (notificationError) {
        logger.error('Failed to send error notification:', notificationError);
      }
    }
  }

  public async start(): Promise<void> {
    try {
      // Initialize services (Redis is optional)
      try {
        await sessionManager.initialize();
        logger.info('Session manager initialized successfully');
      } catch (error) {
        logger.warn('Session manager initialization failed (Redis may be unavailable):', error);
        logger.warn('Continuing without Redis - sessions will not persist across restarts');
      }
      
      // Start the server
      this.server = this.app.listen(config.server.port, '0.0.0.0', () => {
        logger.info(`Server running on port ${config.server.port}`);
        logger.info(`Environment: ${config.server.nodeEnv}`);
        logger.info('Health check endpoint available at /health');
      });

      // Start the bot (make it optional for health checks)
      try {
        await this.bot.start();
        logger.info('Telegram bot started successfully');
      } catch (error) {
        logger.warn('Telegram bot failed to start:', error);
        logger.warn('Server will continue running for health checks');
      }
      
      logger.info('Rada Bot server started successfully');
    } catch (error) {
      logger.error('Failed to start server:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      if (this.server) {
        this.server.close();
      }
      
      await this.bot.stop();
      await sessionManager.close();
      
      logger.info('Server stopped successfully');
    } catch (error) {
      logger.error('Error stopping server:', error);
    }
  }
}

export default Server;
