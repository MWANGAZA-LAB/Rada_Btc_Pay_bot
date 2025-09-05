import Server from './server';
import logger from './utils/logger';

async function main(): Promise<void> {
  try {
    logger.info('Starting Rada Bot...');
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Port: ${process.env.PORT || '3000'}`);
    logger.info(`Railway Environment: ${process.env.RAILWAY_ENVIRONMENT || 'not set'}`);
    
    // Check for required environment variables
    const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'MINMO_API_KEY', 'MINMO_WEBHOOK_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      logger.warn(`Missing environment variables: ${missingVars.join(', ')}`);
      logger.warn('Bot will start but may not function properly without these variables');
    }
    
    logger.info('Initializing server...');
    const server = new Server();
    await server.start();
    logger.info('Server started successfully');
    
    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      await server.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      await server.stop();
      process.exit(0);
    });
    
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Start the application
if (require.main === module) {
  main();
}
