import { Bot, InlineKeyboard } from 'grammy';
import { config } from '../config';
import { sessionManager } from '../services/sessionManager';
import { minmoService } from '../services/minmoService';
import { rateService } from '../services/rateService';
import { qrCodeService } from '../services/qrCodeService';
import { validatePaymentData, formatPhoneNumber } from '../utils/validation';
import { ServiceType, UserSession } from '../types';
import { RadaContext } from './types';
import { 
  mainMenuKeyboard, 
  cancelKeyboard, 
  backToMenuKeyboard, 
  confirmPaymentKeyboard,
  getServiceKeyboard
} from './keyboards';
import { messages, getServiceMessage, getInputPrompt, getConfirmationMessage } from './messages';
import logger from '../utils/logger';

export class RadaBot {
  private bot: Bot<RadaContext>;

  constructor() {
    this.bot = new Bot<RadaContext>(config.telegram.token);
    this.setupMiddleware();
    this.setupCommands();
    this.setupCallbacks();
    this.setupMessageHandlers();
  }

  private setupMiddleware(): void {
    // Session middleware
    this.bot.use(async (ctx: RadaContext, next) => {
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
    this.bot.command('start', async (ctx: RadaContext) => {
      await this.handleStart(ctx);
    });

    // Help command
    this.bot.command('help', async (ctx: RadaContext) => {
      await this.handleHelp(ctx);
    });

    // Menu command
    this.bot.command('menu', async (ctx: RadaContext) => {
      await this.showMainMenu(ctx);
    });

    // Cancel command
    this.bot.command('cancel', async (ctx: RadaContext) => {
      await this.handleCancel(ctx);
    });
  }

  private setupCallbacks(): void {
    // Main menu callbacks
    this.bot.callbackQuery('main_menu', async (ctx: RadaContext) => {
      await this.showMainMenu(ctx);
    });

    // Service selection callbacks
    this.bot.callbackQuery(/^service_(.+)$/, async (ctx: RadaContext) => {
      const service = ctx.match?.[1] as ServiceType;
      if (service) {
        await this.handleServiceSelection(ctx, service);
      }
    });

    // Input callbacks
    this.bot.callbackQuery('input_phone', async (ctx: RadaContext) => {
      await this.handleInputRequest(ctx, 'phone');
    });

    this.bot.callbackQuery('input_paybill', async (ctx: RadaContext) => {
      await this.handleInputRequest(ctx, 'paybill');
    });

    this.bot.callbackQuery('input_account', async (ctx: RadaContext) => {
      await this.handleInputRequest(ctx, 'account');
    });

    this.bot.callbackQuery('input_till', async (ctx: RadaContext) => {
      await this.handleInputRequest(ctx, 'till');
    });

    this.bot.callbackQuery('input_amount', async (ctx: RadaContext) => {
      await this.handleInputRequest(ctx, 'amount');
    });

    this.bot.callbackQuery('upload_qr', async (ctx: RadaContext) => {
      await this.handleInputRequest(ctx, 'qr');
    });

    // Confirmation callbacks
    this.bot.callbackQuery('confirm_payment', async (ctx: RadaContext) => {
      await this.handlePaymentConfirmation(ctx);
    });

    this.bot.callbackQuery('cancel', async (ctx: RadaContext) => {
      await this.handleCancel(ctx);
    });

    // Help and exchange rate callbacks
    this.bot.callbackQuery('help', async (ctx: RadaContext) => {
      await this.handleHelp(ctx);
    });

    this.bot.callbackQuery('exchange_rate', async (ctx: RadaContext) => {
      await this.handleExchangeRate(ctx);
    });

    this.bot.callbackQuery('refresh_rate', async (ctx: RadaContext) => {
      await this.handleRefreshRate(ctx);
    });

    // Wallet-related callbacks
    this.bot.callbackQuery(/^copy_invoice:(.+)$/, async (ctx: RadaContext) => {
      const invoice = ctx.match?.[1];
      if (invoice) {
        await this.handleCopyInvoice(ctx, invoice);
      }
    });

    this.bot.callbackQuery(/^scan_qr:(.+)$/, async (ctx: RadaContext) => {
      const invoice = ctx.match?.[1];
      if (invoice) {
        await this.handleQRScan(ctx, invoice);
      }
    });

    this.bot.callbackQuery('cancel_qr_scan', async (ctx: RadaContext) => {
      await this.handleCancelQRScan(ctx);
    });

    this.bot.callbackQuery(/^use_invoice:(.+)$/, async (ctx: RadaContext) => {
      const invoice = ctx.match?.[1];
      if (invoice) {
        await this.handleUseInvoice(ctx, invoice);
      }
    });

    this.bot.callbackQuery(/^create_mpesa_invoice:(.+)$/, async (ctx: RadaContext) => {
      const data = ctx.match?.[1];
      if (data) {
        await this.handleCreateMpesaInvoice(ctx, data);
      }
    });

    this.bot.callbackQuery(/^create_custom_invoice:(.+)$/, async (ctx: RadaContext) => {
      const data = ctx.match?.[1];
      if (data) {
        await this.handleCreateCustomInvoice(ctx, data);
      }
    });

    this.bot.callbackQuery(/^enter_amount:(.+)$/, async (ctx: RadaContext) => {
      const phoneNumber = ctx.match?.[1];
      if (phoneNumber) {
        await this.handleEnterAmount(ctx, phoneNumber);
      }
    });

    // Lightning invoice callbacks (legacy - keeping for compatibility)
    this.bot.callbackQuery(/^copy_invoice_(.+)$/, async (ctx: RadaContext) => {
      const invoice = ctx.match?.[1];
      if (invoice) {
        await this.handleCopyInvoice(ctx, invoice);
      }
    });
  }

  private setupMessageHandlers(): void {
    // Handle text messages for input collection
    this.bot.on('message:text', async (ctx: RadaContext) => {
      await this.handleTextInput(ctx);
    });

    // Handle photo messages for QR code uploads
    this.bot.on('message:photo', async (ctx: RadaContext) => {
      await this.handlePhotoUpload(ctx);
    });
  }

  private async handleStart(ctx: RadaContext): Promise<void> {
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

  private async handleHelp(ctx: RadaContext): Promise<void> {
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

  private async showMainMenu(ctx: RadaContext): Promise<void> {
    try {
      await sessionManager.updateSession(ctx.from!.id, {});

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

  private async handleServiceSelection(ctx: RadaContext, service: ServiceType): Promise<void> {
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

  private async handleInputRequest(ctx: RadaContext, inputType: string): Promise<void> {
    try {
      const prompt = getInputPrompt(inputType);
      // Try to edit message first, fallback to reply if editing fails
      try {
        await ctx.editMessageText(prompt, {
          parse_mode: 'Markdown',
          reply_markup: cancelKeyboard,
        });
      } catch (editError) {
        // If editing fails, send a new message instead
        await ctx.reply(prompt, {
          parse_mode: 'Markdown',
          reply_markup: cancelKeyboard,
        });
      }
    } catch (error) {
      logger.error('Error in handleInputRequest:', error);
      await ctx.reply(messages.errors.invalidInput);
    }
  }

  private async handleTextInput(ctx: RadaContext): Promise<void> {
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

  private async processTextInput(ctx: RadaContext, session: UserSession, text: string): Promise<void> {
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

  private async processAmountInput(ctx: RadaContext, session: UserSession, text: string): Promise<void> {
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

  private async handlePhotoUpload(ctx: RadaContext): Promise<void> {
    try {
      const session = await sessionManager.getSession(ctx.from!.id);
      
      if (!session || !session.qrScanMode) {
        await ctx.reply('Please use the "📷 Scan QR" button first to activate QR scanning mode.');
        return;
      }

      const photo = ctx.message?.photo;
      if (!photo || photo.length === 0) {
        await ctx.reply('No photo found. Please try again.');
        return;
      }

      // Get the largest photo
      const largestPhoto = photo[photo.length - 1];
      if (!largestPhoto) {
        await ctx.reply('No valid photo found. Please try again.');
        return;
      }
      const file = await ctx.api.getFile(largestPhoto.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${config.telegram.token}/${file.file_path}`;

      // Download and process the image
      const response = await fetch(fileUrl);
      const buffer = Buffer.from(await response.arrayBuffer());

      // Parse QR code
      const qrResult = await qrCodeService.parseQRCodeFromBuffer(buffer);
      
      if (!qrResult.success) {
        await ctx.reply(messages.qrScanError(qrResult.error || 'Unknown error'));
        return;
      }

      // Handle different QR types
      await this.handleQRResult(ctx, {
        type: qrResult.type || undefined,
        parsedData: qrResult.parsedData as Record<string, unknown> || undefined,
        data: qrResult.data || undefined
      }, session.originalInvoice);

      // Clear QR scan mode
      sessionManager.updateSession(ctx.from!.id, { qrScanMode: false });
      
    } catch (error) {
      logger.error('Error processing photo upload:', error);
      await ctx.reply('Failed to process the image. Please try again with a clearer photo.');
    }
  }

  private async handlePaymentConfirmation(ctx: RadaContext): Promise<void> {
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
        const keyboard = new InlineKeyboard()
          .text('📋 Copy', `copy_invoice:${invoiceResponse.invoice}`)
          .text('📷 Scan QR', `scan_qr:${invoiceResponse.invoice}`);

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

  private async handleExchangeRate(ctx: RadaContext): Promise<void> {
    try {
      const rateStatus = rateService.getRateStatus();
      const rateMessage = messages.exchangeRate(
        rateStatus.rate,
        rateStatus.satsPerKes,
        rateStatus.isFallback
      );

      await ctx.editMessageText(rateMessage, {
        parse_mode: 'Markdown',
        reply_markup: backToMenuKeyboard,
      });
    } catch (error) {
      logger.error('Error in handleExchangeRate:', error);
      await ctx.reply('Unable to fetch exchange rate. Please try again later.');
    }
  }

  private async handleRefreshRate(ctx: RadaContext): Promise<void> {
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

  private async handleCopyInvoice(ctx: RadaContext, invoice: string): Promise<void> {
    try {
      await ctx.answerCallbackQuery('Invoice copied!');
      await ctx.reply(`📋 \`${invoice}\`\n\nPaste into any Lightning wallet.`, {
        parse_mode: 'Markdown'
      });
    } catch (error) {
      logger.error('Error in handleCopyInvoice:', error);
      await ctx.answerCallbackQuery('Failed to copy');
    }
  }

  private async handleQRScan(ctx: RadaContext, invoice: string): Promise<void> {
    try {
      await ctx.answerCallbackQuery('QR Scanner activated');
      const keyboard = new InlineKeyboard()
        .text('❌ Cancel', 'cancel_qr_scan');
      
      await ctx.reply(messages.qrScanPrompt, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
      
      // Store the original invoice in session for comparison
      sessionManager.updateSession(ctx.from!.id, { 
        qrScanMode: true, 
        originalInvoice: invoice 
      });
    } catch (error) {
      logger.error('Error in handleQRScan:', error);
      await ctx.answerCallbackQuery('Failed to activate QR scanner');
    }
  }

  private async handleCancelQRScan(ctx: RadaContext): Promise<void> {
    try {
      await ctx.answerCallbackQuery('QR scan cancelled');
      sessionManager.updateSession(ctx.from!.id, { 
        qrScanMode: false
      });
      await ctx.reply('QR scan cancelled. You can use the copy option or tap a wallet button instead.');
    } catch (error) {
      logger.error('Error in handleCancelQRScan:', error);
      await ctx.answerCallbackQuery('Failed to cancel QR scan');
    }
  }

  private async handleUseInvoice(ctx: RadaContext, invoice: string): Promise<void> {
    try {
      await ctx.answerCallbackQuery('Invoice selected');
      
      // Generate new wallet keyboard with the scanned invoice
      const keyboard = new InlineKeyboard().text('📋 Copy', `copy_invoice:${invoice}`);
      
      await ctx.reply(`✅ *Using Scanned Invoice*\n\n\`${invoice}\`\n\n*Choose your payment method:*`, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      logger.error('Error in handleUseInvoice:', error);
      await ctx.answerCallbackQuery('Failed to use invoice');
    }
  }

  private async handleQRResult(ctx: RadaContext, qrResult: { type?: string | undefined; parsedData?: Record<string, unknown> | undefined; data?: string | undefined }, originalInvoice?: string): Promise<void> {
    try {
      const { type, parsedData, data } = qrResult;

      switch (type) {
        case 'lightning':
          await this.handleLightningQR(ctx, (parsedData?.lightningInvoice as string) || data || '');
          break;
        
        case 'mpesa_merchant':
          await this.handleMpesaMerchantQR(ctx, parsedData || {});
          break;
        
        case 'phone_number':
          await this.handlePhoneNumberQR(ctx, parsedData || {});
          break;
        
        case 'custom_payment':
          await this.handleCustomPaymentQR(ctx, parsedData || {});
          break;
        
        case 'bitcoin':
          await this.handleBitcoinQR(ctx, (parsedData?.bitcoinAddress as string) || data || '');
          break;
        
        default:
          await this.handleUnknownQR(ctx, data || '', originalInvoice);
      }
    } catch (error) {
      logger.error('Error handling QR result:', error);
      await ctx.reply('Failed to process QR code. Please try again.');
    }
  }

  private async handleLightningQR(ctx: RadaContext, invoice: string): Promise<void> {
    await ctx.reply(messages.qrScanSuccess(invoice, 'lightning'), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Use This Invoice', callback_data: `use_invoice:${invoice}` }],
          [{ text: '🔄 Scan Another', callback_data: `scan_qr:${invoice}` }]
        ]
      }
    });
  }

  private async handleMpesaMerchantQR(ctx: RadaContext, data: Record<string, unknown>): Promise<void> {
    // Validate M-Pesa merchant data
    if (!qrCodeService.validateMpesaMerchant(data)) {
      await ctx.reply('❌ *Invalid M-Pesa Merchant QR*\n\nThis QR code does not contain valid M-Pesa merchant information.');
      return;
    }

    const message = messages.qrMpesaMerchant(data);
    const keyboard = new InlineKeyboard()
      .text('✅ Create Lightning Invoice', `create_mpesa_invoice:${JSON.stringify(data)}`)
      .row()
      .text('🔄 Scan Another', 'scan_qr:');

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  private async handlePhoneNumberQR(ctx: RadaContext, data: Record<string, unknown>): Promise<void> {
    if (!qrCodeService.validatePhoneNumber(data.phoneNumber as string)) {
      await ctx.reply('❌ *Invalid Phone Number*\n\nThis QR code does not contain a valid Kenyan phone number.');
      return;
    }

    const message = messages.qrPhoneNumber(data.phoneNumber as string);
    const keyboard = new InlineKeyboard()
      .text('✅ Enter Amount', `enter_amount:${data.phoneNumber}`)
      .row()
      .text('🔄 Scan Another', 'scan_qr:');

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  private async handleCustomPaymentQR(ctx: RadaContext, data: Record<string, unknown>): Promise<void> {
    const message = messages.qrCustomPayment(data);
    const keyboard = new InlineKeyboard()
      .text('✅ Create Lightning Invoice', `create_custom_invoice:${JSON.stringify(data)}`)
      .row()
      .text('🔄 Scan Another', 'scan_qr:');

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  private async handleBitcoinQR(ctx: RadaContext, address: string): Promise<void> {
    const keyboard = new InlineKeyboard()
      .text('🔄 Scan Another', 'scan_qr:');
    
    await ctx.reply(`₿ *Bitcoin Address Detected*\n\n*Address:* \`${address}\`\n\n*Note:* This is a Bitcoin address, not a Lightning invoice. For Lightning payments, please scan a Lightning invoice QR code.`, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  private async handleUnknownQR(ctx: RadaContext, data: string, originalInvoice?: string): Promise<void> {
    const keyboard = new InlineKeyboard()
      .text('🔄 Scan Another', `scan_qr:${originalInvoice || ''}`);
    
    await ctx.reply(`❓ *Unknown QR Code Type*\n\n*Data:* \`${data}\`\n\n*Type:* Unknown\n\nThis QR code could not be identified as a payment-related code. Please scan a Lightning invoice, M-Pesa merchant QR, or phone number QR.`, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  private async handleCreateMpesaInvoice(ctx: RadaContext, dataString: string): Promise<void> {
    try {
      await ctx.answerCallbackQuery('Creating Lightning invoice...');
      
      const data = JSON.parse(dataString);
      const amount = data.amount || 0;
      
      if (amount <= 0) {
        await ctx.reply('❌ *Amount Required*\n\nThis M-Pesa merchant QR does not include an amount. Please enter the amount manually:', {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '💰 Enter Amount', callback_data: `enter_mpesa_amount:${dataString}` }]
            ]
          }
        });
        return;
      }

      // Create Lightning invoice for M-Pesa payment
      await this.createQRPaymentInvoice(ctx, 'mpesa_merchant', data, amount);
      
    } catch (error) {
      logger.error('Error creating M-Pesa invoice:', error);
      await ctx.answerCallbackQuery('Failed to create invoice');
    }
  }

  private async handleCreateCustomInvoice(ctx: RadaContext, dataString: string): Promise<void> {
    try {
      await ctx.answerCallbackQuery('Creating Lightning invoice...');
      
      const data = JSON.parse(dataString);
      const amount = data.amount || 0;
      
      if (amount <= 0) {
        await ctx.reply('❌ *Amount Required*\n\nThis custom payment QR does not include an amount. Please enter the amount manually:', {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '💰 Enter Amount', callback_data: `enter_custom_amount:${dataString}` }]
            ]
          }
        });
        return;
      }

      // Create Lightning invoice for custom payment
      await this.createQRPaymentInvoice(ctx, 'custom_payment', data, amount);
      
    } catch (error) {
      logger.error('Error creating custom invoice:', error);
      await ctx.answerCallbackQuery('Failed to create invoice');
    }
  }

  private async handleEnterAmount(ctx: RadaContext, phoneNumber: string): Promise<void> {
    try {
      await ctx.answerCallbackQuery('Amount entry mode activated');
      
      // Store phone number in session for amount entry
      sessionManager.updateSession(ctx.from!.id, {
        qrScanMode: true,
        qrPaymentData: { phoneNumber, type: 'phone_number' }
      });
      
      await ctx.reply(`💰 *Enter Amount for ${phoneNumber}*\n\nEnter the amount in KES you want to send:`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '❌ Cancel', callback_data: 'cancel_qr_scan' }]
          ]
        }
      });
      
    } catch (error) {
      logger.error('Error in handleEnterAmount:', error);
      await ctx.answerCallbackQuery('Failed to activate amount entry');
    }
  }

  private async createQRPaymentInvoice(ctx: RadaContext, type: string, data: Record<string, unknown>, amount: number): Promise<void> {
    try {
      // Get current exchange rate and convert amount
      const satsAmount = rateService.convertKesToSats(amount);
      
      // Create Lightning invoice
      const invoiceResponse = await minmoService.generateLightningInvoice({
        amount: satsAmount,
        description: `QR Payment - ${type}`,
        expiry: 600 // 10 minutes
      });

      if (!invoiceResponse.success) {
        await ctx.reply('❌ *Failed to Create Invoice*\n\nUnable to generate Lightning invoice. Please try again.');
        return;
      }

      // Store payment data in session
      sessionManager.updateSession(ctx.from!.id, {
        lightningInvoice: invoiceResponse.invoice,
        invoiceId: invoiceResponse.invoiceId,
        qrPaymentData: { ...data, type, amount }
      });

      // Show confirmation and wallet options
      const confirmationMessage = messages.qrConfirmationPrompt(type, { amount });
      const keyboard = new InlineKeyboard().text('📋 Copy', `copy_invoice:${invoiceResponse.invoice}`);
      
      await ctx.reply(confirmationMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
      
    } catch (error) {
      logger.error('Error creating QR payment invoice:', error);
      await ctx.reply('❌ *Failed to Create Invoice*\n\nUnable to generate Lightning invoice. Please try again.');
    }
  }



  private async handleCancel(ctx: RadaContext): Promise<void> {
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

  public getBot(): Bot<RadaContext> {
    return this.bot;
  }
}
