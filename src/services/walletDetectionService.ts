import logger from '../utils/logger';

export interface WalletInfo {
  name: string;
  scheme: string;
  icon: string;
  deepLink: string;
  fallbackUrl?: string | undefined;
  isInstalled?: boolean;
}

export interface WalletDetectionResult {
  detectedWallets: WalletInfo[];
  allWallets: WalletInfo[];
  hasDetectedWallets: boolean;
}

class WalletDetectionService {
  private readonly knownWallets: WalletInfo[] = [
    {
      name: 'BlueWallet',
      scheme: 'bluewallet:',
      icon: '🔵',
      deepLink: 'bluewallet:lightning:',
      fallbackUrl: 'https://bluewallet.io/'
    },
    {
      name: 'Phoenix',
      scheme: 'phoenix:',
      icon: '🔥',
      deepLink: 'phoenix:lightning:',
      fallbackUrl: 'https://phoenix.acinq.co/'
    },
    {
      name: 'Muun',
      scheme: 'muun:',
      icon: '🌙',
      deepLink: 'muun:lightning:',
      fallbackUrl: 'https://muun.com/'
    },
    {
      name: 'Zeus',
      scheme: 'zeus:',
      icon: '⚡',
      deepLink: 'zeus:lightning:',
      fallbackUrl: 'https://zeusln.app/'
    },
    {
      name: 'Breez',
      scheme: 'breez:',
      icon: '💨',
      deepLink: 'breez:lightning:',
      fallbackUrl: 'https://breez.technology/'
    },
    {
      name: 'Wallet of Satoshi',
      scheme: 'walletofsatoshi:',
      icon: '💰',
      deepLink: 'walletofsatoshi:lightning:',
      fallbackUrl: 'https://walletofsatoshi.com/'
    },
    {
      name: 'Zap',
      scheme: 'zap:',
      icon: '⚡',
      deepLink: 'zap:lightning:',
      fallbackUrl: 'https://zap.jackmallers.com/'
    },
    {
      name: 'Electrum',
      scheme: 'electrum:',
      icon: '🔌',
      deepLink: 'electrum:lightning:',
      fallbackUrl: 'https://electrum.org/'
    },
    {
      name: 'Simple Bitcoin Wallet',
      scheme: 'simplebitcoin:',
      icon: '📱',
      deepLink: 'simplebitcoin:lightning:',
      fallbackUrl: 'https://simplebitcoinwallet.com/'
    },
    {
      name: 'Generic Lightning',
      scheme: 'lightning:',
      icon: '⚡',
      deepLink: 'lightning:'
    }
  ];

  /**
   * Detect installed Lightning wallets on the user's device
   * This uses a combination of URL scheme testing and user agent detection
   */
  async detectInstalledWallets(): Promise<WalletDetectionResult> {
    try {
      logger.info('Starting wallet detection process');
      
      const detectedWallets: WalletInfo[] = [];
      
      // Test each wallet's URL scheme
      for (const wallet of this.knownWallets) {
        try {
          const isInstalled = await this.testWalletInstallation(wallet.scheme);
          if (isInstalled) {
            detectedWallets.push({
              ...wallet,
              isInstalled: true
            });
            logger.debug(`Detected wallet: ${wallet.name}`);
          }
        } catch (error) {
          logger.debug(`Wallet not detected: ${wallet.name}`);
        }
      }
      
      // Sort detected wallets by popularity/priority
      const sortedDetectedWallets = this.sortWalletsByPriority(detectedWallets);
      
      logger.info(`Wallet detection completed. Found ${detectedWallets.length} wallets`);
      
      return {
        detectedWallets: sortedDetectedWallets,
        allWallets: this.knownWallets,
        hasDetectedWallets: detectedWallets.length > 0
      };
      
    } catch (error) {
      logger.error('Error during wallet detection:', error);
      
      // Return fallback with most common wallets
      return {
        detectedWallets: this.getFallbackWallets(),
        allWallets: this.knownWallets,
        hasDetectedWallets: false
      };
    }
  }

  /**
   * Test if a wallet is installed by attempting to open its URL scheme
   * Note: In a bot context, we can't actually test URL schemes, so we'll use heuristics
   */
  private async testWalletInstallation(scheme: string): Promise<boolean> {
    // In a bot environment, we can't actually test if apps are installed
    // So we'll return false for now and rely on fallback behavior
    // In a real implementation, this could be enhanced with:
    // - User agent detection
    // - Platform-specific detection
    // - User preference tracking
    return false;
  }

  /**
   * Alternative detection method using platform detection
   * Note: In a bot context, we can't access user agent, so we'll use common wallets
   */
  private detectWalletsByPlatform(): WalletInfo[] {
    // Return most common wallets for all platforms
    const commonWallets = [
      'BlueWallet', 'Phoenix', 'Muun', 'Zeus', 'Breez'
    ];
    
    return this.knownWallets.filter(wallet => 
      commonWallets.includes(wallet.name)
    );
  }

  /**
   * Sort wallets by priority/popularity
   */
  private sortWalletsByPriority(wallets: WalletInfo[]): WalletInfo[] {
    const priorityOrder = [
      'BlueWallet', 'Phoenix', 'Muun', 'Zeus', 'Breez', 
      'Wallet of Satoshi', 'Zap', 'Electrum', 'Simple Bitcoin Wallet'
    ];
    
    return wallets.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.name);
      const bIndex = priorityOrder.indexOf(b.name);
      
      // If both are in priority list, sort by priority
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // If only one is in priority list, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // If neither is in priority list, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Get fallback wallets when detection fails
   */
  private getFallbackWallets(): WalletInfo[] {
    return this.knownWallets.slice(0, 5); // Top 5 most common wallets
  }

  /**
   * Generate simple wallet selection keyboard for Telegram
   */
  async generateWalletKeyboard(invoice: string): Promise<any> {
    const detectionResult = await this.detectInstalledWallets();
    
    // Always show the most common wallets in a simple layout
    const commonWallets = this.knownWallets.slice(0, 4); // Top 4 wallets
    const rows = this.createWalletRows(commonWallets, invoice);
    
    // Add copy and QR scan options
    rows.push([
      { text: '📋 Copy', callback_data: `copy_invoice:${invoice}` },
      { text: '📷 Scan QR', callback_data: `scan_qr:${invoice}` }
    ]);
    
    return {
      inline_keyboard: rows
    };
  }

  /**
   * Create wallet button rows - simple 2x2 grid
   */
  private createWalletRows(wallets: WalletInfo[], invoice: string): any[] {
    const rows: any[] = [];
    
    // Create 2x2 grid (2 wallets per row, 2 rows)
    for (let i = 0; i < wallets.length; i += 2) {
      const row = wallets.slice(i, i + 2).map(wallet => ({
        text: `${wallet.icon} ${wallet.name}`,
        url: `${wallet.deepLink}${invoice}`
      }));
      rows.push(row);
    }
    
    return rows;
  }

}

export const walletDetectionService = new WalletDetectionService();
