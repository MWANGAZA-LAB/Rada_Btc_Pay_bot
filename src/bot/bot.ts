import { Bot, Context } from 'grammy';
import { config } from '../config';
import { sessionManager } from '../services/sessionManager';
import { minmoService } from '../services/minmoService';
import { rateService } from '../services/rateService';
import { validatePaymentData, formatPhoneNumber } from '../utils/validation';
import { ServiceType, UserSession } from '../types';
import { 
  mainMenuKeyboard, 
  cancelKeyboard, 
  backToMenuKeyboard, 
  confirmPaymentKeyboard,
  getServiceKeyboard,
  getLightningInvoiceKeyboard
} from './keyboards';
import { messages, getServiceMessage, getInputPrompt, getConfirmationMessage } from './messages';
import logger from '../utils/logger';

export class RadaBot {
  private bot: Bot;

  constructor() {
    this.bot = new Bot(config.telegram.token);
    this.setupMiddleware();
    this.setupCommands();
    this.setupCallbacks();
    this.setupMessageHandlers();
  }

  private setupMiddleware(): void {
    // Session middleware
    this.bot.use(async (ctx, next) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      let session = await sessionManager.getSession(userId);
      if (!session) {
        session = {
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await sessionManager.setSession(userId, session);
      }

      ctx.session = session;
      await next();
    });
  }

  private setupCommands(): void {
    // Start command
    this.bot.command('start', async (ctx) => {
      await this.handleStart(ctx);
    });

    // Help command
    this.bot.command('help', async (ctx) => {
      await this.handleHelp(ctx);
    });

    // Menu command
    this.bot.command('menu', async (ctx) => {
      await this.showMainMenu(ctx);
    });

    // Cancel command
    this.bot.command('cancel', async (ctx) => {
      await this.handleCancel(ctx);
    });
  }

  private setupCallbacks(): void {
    // Main menu callbacks
    this.bot.callbackQuery('main_menu', async (ctx) => {
      await this.showMainMenu(ctx);
    });

    // Service selection callbacks
    this.bot.callbackQuery(/^service_(.+)$/, async (ctx) => {
      const service = ctx.match[1] as ServiceType;
      await this.handleServiceSelection(ctx, service);
    });

    // Input callbacks
    this.bot.callbackQuery('input_phone', async (ctx) => {
      await this.handleInputRequest(ctx, 'phone');
    });

    this.bot.callbackQuery('input_paybill', async (ctx) => {
      await this.handleInputRequest(ctx, 'paybill');
    });

    this.bot.callbackQuery('input_account', async (ctx) => {
      await this.handleInputRequest(ctx, 'account');
    });

    this.bot.callbackQuery('input_till', async (ctx) => {
      await this.handleInputRequest(ctx, 'till');
    });

    this.bot.callbackQuery('input_amount', async (ctx) => {
      await this.handleInputRequest(ctx, 'amount');
    });

    this.bot.callbackQuery('upload_qr', async (ctx) => {
      await this.handleInputRequest(ctx, 'qr');
    });

    // Confirmation callbacks
    this.bot.callbackQuery('confirm_payment', async (ctx) => {
      await this.handlePaymentConfirmation(ctx);
    });

    this.bot.callbackQuery('cancel', async (ctx) => {
      await this.handleCancel(ctx);
    });

    // Help and exchange rate callbacks
    this.bot.callbackQuery('help', async (ctx) => {
      await this.handleHelp(ctx);
    });

    this.bot.callbackQuery('exchange_rate', async (ctx) => {
      await this.handleExchangeRate(ctx);
    });

    this.bot.callbackQuery('refresh_rate', async (ctx) => {
      await this.handleRefreshRate(ctx);
    });

    // Lightning invoice callbacks
    this.bot.callbackQuery(/^copy_invoice_(.+)$/, async (ctx) => {
      await this.handleCopyInvoice(ctx);
    });
  }

  private setupMessageHandlers(): void {
    // Handle text messages for input collection
    this.bot.on('message:text', async (ctx) => {
      await this.handleTextInput(ctx);
    });

    // Handle photo messages for QR code uploads
    this.bot.on('message:photo', async (ctx) => {
      await this.handlePhotoUpload(ctx);
    });
  }

  private async handleStart(ctx: Context): Promise<void> {
    try {
      await ctx.reply(messages.welcome, {
        parse_mode: 'Markdown',
        reply_markup: mainMenuKeyboard,
      });
    } catch (error) {
      logger.error('Error in handleStart:', error);
      await ctx.reply('Welcome to Rada Bot! Please use the menu below to get started.');
    }
  }

  private async handleHelp(ctx: Context): Promise<void> {
    try {
      await ctx.reply(messages.help, {
        parse_mode: 'Markdown',
        reply_markup: backToMenuKeyboard,
      });
    } catch (error) {
      logger.error('Error in handleHelp:', error);
      await ctx.reply('Help is available. Please use /start to return to the main menu.');
    }
  }

  private async showMainMenu(ctx: Context): Promise<void> {
    try {
      await sessionManager.updateSession(ctx.from!.id, { 
        currentService: undefined, 
        paymentData: undefined 
      });

      await ctx.editMessageText(messages.welcome, {
        parse_mode: 'Markdown',
        reply_markup: mainMenuKeyboard,
      });
    } catch (error) {
      logger.error('Error in showMainMenu:', error);
      await ctx.reply('Welcome to Rada Bot! Please use the menu below to get started.', {
        reply_markup: mainMenuKeyboard,
      });
    }
  }

  private async handleServiceSelection(ctx: Context, service: ServiceType): Promise<void> {
    try {
      await sessionManager.updateSession(ctx.from!.id, { currentService: service });

      const serviceMessage = getServiceMessage(service);
      const keyboard = getServiceKeyboard(service);

      await ctx.editMessageText(serviceMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    } catch (error) {
      logger.error('Error in handleServiceSelection:', error);
      await ctx.reply(messages.errors.invalidInput);
    }
  }

  private async handleInputRequest(ctx: Context, inputType: string): Promise<void> {
    try {
      const prompt = getInputPrompt(inputType);
      await ctx.editMessageText(prompt, {
        parse_mode: 'Markdown',
        reply_markup: cancelKeyboard,
      });
    } catch (error) {
      logger.error('Error in handleInputRequest:', error);
      await ctx.reply(messages.errors.invalidInput);
    }
  }

  private async handleTextInput(ctx: Context): Promise<void> {
    try {
      const session = ctx.session as UserSession;
      const text = ctx.message?.text?.trim();

      if (!session.currentService || !text) {
        await ctx.reply(messages.errors.invalidInput);
        return;
      }

      // Handle different input types based on current service and session state
      await this.processTextInput(ctx, session, text);
    } catch (error) {
      logger.error('Error in handleTextInput:', error);
      await ctx.reply(messages.errors.invalidInput);
    }
  }

  private async processTextInput(ctx: Context, session: UserSession, text: string): Promise<void> {
    const service = session.currentService!;
    const paymentData = session.paymentData || { service, amount: 0 };

    switch (service) {
      case 'airtime':
      case 'send_money':
      case 'pochi':
        if (!paymentData.phoneNumber) {
          paymentData.phoneNumber = formatPhoneNumber(text);
          await sessionManager.updateSession(session.userId, { paymentData });
          await this.handleInputRequest(ctx, 'amount');
        } else {
          await this.processAmountInput(ctx, session, text);
        }
        break;

      case 'paybill':
        if (!paymentData.paybillNumber) {
          paymentData.paybillNumber = text;
          await sessionManager.updateSession(session.userId, { paymentData });
          await this.handleInputRequest(ctx, 'account');
        } else if (!paymentData.accountNumber) {
          paymentData.accountNumber = text;
          await sessionManager.updateSession(session.userId, { paymentData });
          await this.handleInputRequest(ctx, 'amount');
        } else {
          await this.processAmountInput(ctx, session, text);
        }
        break;

      case 'goods':
        if (!paymentData.tillNumber) {
          paymentData.tillNumber = text;
          await sessionManager.updateSession(session.userId, { paymentData });
          await this.handleInputRequest(ctx, 'amount');
        } else {
          await this.processAmountInput(ctx, session, text);
        }
        break;

      case 'qr_scan':
        if (!paymentData.qrData) {
          paymentData.qrData = text;
          await sessionManager.updateSession(session.userId, { paymentData });
          await this.handleInputRequest(ctx, 'amount');
        } else {
          await this.processAmountInput(ctx, session, text);
        }
        break;
    }
  }

  private async processAmountInput(ctx: Context, session: UserSession, text: string): Promise<void> {
    const amount = parseFloat(text);
    if (isNaN(amount) || amount < 10 || amount > 150000) {
      await ctx.reply(messages.errors.invalidAmount);
      return;
    }

    const paymentData = { ...session.paymentData!, amount };
    await sessionManager.updateSession(session.userId, { paymentData });

    // Get current rate and convert to sats
    try {
      const satsAmount = rateService.convertKesToSats(amount);
      const rateDisplay = rateService.getRateDisplay();
      
      // Show confirmation with real-time rate
      const confirmationMessage = getConfirmationMessage(
        session.currentService!, 
        paymentData, 
        satsAmount, 
        rateDisplay
      );
      
      await ctx.reply(confirmationMessage, {
        parse_mode: 'Markdown',
        reply_markup: confirmPaymentKeyboard,
      });
    } catch (error) {
      logger.error('Error processing amount input:', error);
      await ctx.reply(messages.errors.serviceUnavailable);
    }
  }

  private async handlePhotoUpload(ctx: Context): Promise<void> {
    try {
      const session = ctx.session as UserSession;
      
      if (session.currentService !== 'qr_scan') {
        await ctx.reply('Please select "Scan QR Code" service first.');
        return;
      }

      // For now, we'll ask user to enter QR data manually
      // In a real implementation, you'd process the image
      await ctx.reply('Please enter the QR code data manually:', {
        reply_markup: cancelKeyboard,
      });
    } catch (error) {
      logger.error('Error in handlePhotoUpload:', error);
      await ctx.reply(messages.errors.invalidInput);
    }
  }

  private async handlePaymentConfirmation(ctx: Context): Promise<void> {
    try {
      const session = ctx.session as UserSession;
      const paymentData = session.paymentData;

      if (!paymentData) {
        await ctx.reply(messages.errors.invalidInput);
        return;
      }

      // Validate payment data
      const validation = validatePaymentData(session.currentService!, paymentData);
      if (!validation.isValid) {
        await ctx.reply(validation.error!);
        return;
      }

      // Lock the rate and generate Lightning invoice
      const satsAmount = rateService.convertKesToSats(paymentData.amount);
      const invoiceId = `rada_${Date.now()}_${session.userId}`;
      
      const rateLock = rateService.lockRate(paymentData.amount, invoiceId, 2); // 2 minutes TTL
      
      const invoiceRequest = {
        amount: satsAmount,
        description: `Rada Bot - ${session.currentService} payment`,
        expiry: 120, // 2 minutes
      };

      const invoiceResponse = await minmoService.generateLightningInvoice(invoiceRequest);

      if (invoiceResponse.success) {
        await sessionManager.updateSession(session.userId, { 
          lightningInvoice: invoiceResponse.invoice,
          invoiceId: invoiceResponse.invoiceId,
          rateLock: rateLock
        });

        const invoiceMessage = messages.lightningInvoice(satsAmount, invoiceResponse.invoice);
        const keyboard = getLightningInvoiceKeyboard(invoiceResponse.invoice);

        await ctx.reply(invoiceMessage, {
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        });
      } else {
        await ctx.reply(`❌ Invoice generation failed: ${invoiceResponse.error}`);
      }
    } catch (error) {
      logger.error('Error in handlePaymentConfirmation:', error);
      await ctx.reply(messages.errors.serviceUnavailable);
    }
  }

  private async handleExchangeRate(ctx: Context): Promise<void> {
    try {
      const rateStatus = rateService.getRateStatus();
      const rateDisplay = rateService.getRateDisplay();

      await ctx.editMessageText(
        `📊 *Current Exchange Rate*\n\n${rateDisplay}\n\n*Last updated:* ${rateStatus.lastUpdated.toLocaleString('en-KE')}`,
        {
          parse_mode: 'Markdown',
          reply_markup: backToMenuKeyboard,
        }
      );
    } catch (error) {
      logger.error('Error in handleExchangeRate:', error);
      await ctx.reply('Unable to fetch exchange rate. Please try again later.');
    }
  }

  private async handleRefreshRate(ctx: Context): Promise<void> {
    try {
      const session = ctx.session as UserSession;
      
      if (!session.paymentData) {
        await ctx.reply('No active payment session. Please start over.');
        return;
      }

      // Refresh the rate and show updated confirmation
      const satsAmount = rateService.convertKesToSats(session.paymentData.amount);
      const rateDisplay = rateService.getRateDisplay();
      
      const confirmationMessage = getConfirmationMessage(
        session.currentService!, 
        session.paymentData, 
        satsAmount, 
        rateDisplay
      );
      
      await ctx.editMessageText(confirmationMessage, {
        parse_mode: 'Markdown',
        reply_markup: confirmPaymentKeyboard,
      });
    } catch (error) {
      logger.error('Error in handleRefreshRate:', error);
      await ctx.reply('Unable to refresh rate. Please try again.');
    }
  }

  private async handleCopyInvoice(ctx: Context): Promise<void> {
    try {
      const session = ctx.session as UserSession;
      
      if (!session.lightningInvoice) {
        await ctx.reply('No invoice available to copy.');
        return;
      }

      await ctx.answerCallbackQuery('Invoice copied to clipboard!');
      
      // In a real implementation, you might want to send the invoice
      // in a separate message for easier copying
      await ctx.reply(
        `📋 *Invoice copied!*\n\n\`${session.lightningInvoice}\`\n\n*Tap and hold to copy the invoice above.*`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      logger.error('Error in handleCopyInvoice:', error);
      await ctx.answerCallbackQuery('Failed to copy invoice');
    }
  }

  private async handleCancel(ctx: Context): Promise<void> {
    try {
      await sessionManager.clearSession(ctx.from!.id);
      await this.showMainMenu(ctx);
    } catch (error) {
      logger.error('Error in handleCancel:', error);
      await ctx.reply('Operation cancelled. Use /start to begin again.');
    }
  }

  public async start(): Promise<void> {
    try {
      await this.bot.start();
      logger.info('Rada Bot started successfully');
    } catch (error) {
      logger.error('Failed to start bot:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      await this.bot.stop();
      logger.info('Rada Bot stopped');
    } catch (error) {
      logger.error('Error stopping bot:', error);
    }
  }

  public getBot(): Bot {
    return this.bot;
  }
}
