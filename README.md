# 🚀 Rada Bot

> Seamless Bitcoin to M-Pesa payments

Rada Bot is a non-custodial tool that lets users pay with Bitcoin and instantly convert their payments to M-Pesa transactions. Built for Kenya, powered by Bitcoin Lightning Network.

## ✨ Features

- 📱 **Buy Airtime** - Pay with Bitcoin, top up any phone number
- 🏢 **Pay Bills** - Pay utility bills using Bitcoin Lightning payments
- 🛒 **Buy Goods** - Purchase goods and services with Bitcoin
- 💸 **Send Money** - Send M-Pesa payments using Bitcoin
- 💰 **Lipa na M-Pesa** - Use Bitcoin to make M-Pesa payments
- 📷 **QR Code Scanning** - Scan M-Pesa QR codes to pay with Bitcoin
- ⚡ **Lightning Network** - Fast, low-cost Bitcoin transactions
- 🔒 **Non-Custodial** - You control your Bitcoin, we never hold it
- 💱 **Real-time Rates** - Live Bitcoin to KES exchange rates
- 🔄 **Rate Locking** - Lock exchange rates during payment process

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram Bot  │    │  Rada Backend   │    │   Minmo API     │
│                 │◄──►│                 │◄──►│                 │
│  User Interface │    │  Orchestrator   │    │ Lightning & M-Pesa│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web UI        │    │     Redis       │    │   M-Pesa API    │
│  (GitHub Pages) │    │   (Sessions)    │    │   (STK Push)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Lightning      │    │  Rate Service   │    │  Webhook        │
│  Wallets        │    │  (Real-time)    │    │  Handlers       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠 Tech Stack

### Backend
- **Node.js** + **TypeScript**
- **grammY** - Telegram Bot Framework
- **Express.js** - Web server
- **Redis** - Session management
- **Jest** - Testing

### Frontend
- **React** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Lucide React** - Icons

### Infrastructure
- **Render.com** / **Fly.io** / **Railway.app** - Bot deployment
- **GitHub Pages** - Web UI deployment
- **Docker** - Containerization
- **Redis** - Session management (optional)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Redis (optional, uses in-memory storage if not available)
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Minmo API credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MWANGAZA-LAB/Rada_Btc_Pay_bot.git
   cd Rada_Btc_Pay_bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   # Create .env file with your credentials
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Start the bot**
   ```bash
   npm run dev
   ```

## 📱 Usage

1. **Start the bot** on Telegram: [@Rada_Btc_Pay_bot](https://t.me/Rada_Btc_Pay_bot)
2. **Choose a service** from the main menu (Airtime, Bills, Goods, Send Money, Lipa na M-Pesa)
3. **Enter payment details** (phone number, amount in KES, etc.) OR **scan QR codes** for instant payment
4. **Confirm payment** and see the Bitcoin amount in satoshis
5. **Pay with Lightning** using your Bitcoin wallet
6. **M-Pesa payment** is automatically executed after Lightning payment

## 💡 How It Works

### Payment Flow
1. **User selects service** (Airtime, Bills, etc.) OR **scans QR code**
2. **Enters details** (phone number, amount in KES) OR **QR data is auto-filled**
3. **Bot shows conversion** (KES amount → Bitcoin satoshis)
4. **Rate is locked** for 2 minutes to prevent fluctuations
5. **Lightning invoice** is generated via Minmo API
6. **User pays** with their Lightning wallet
7. **Webhook confirms** Lightning payment
8. **M-Pesa payout** is automatically triggered
9. **User receives** M-Pesa payment confirmation

### QR Code Scanning
The bot can automatically detect and process different types of QR codes:
- **M-Pesa Merchant QR** - Paybill/Till numbers with amounts
- **Phone Number QR** - Direct phone number payments
- **Lightning Invoice QR** - Direct Bitcoin Lightning payments
- **Bitcoin Address QR** - Bitcoin address payments
- **Custom Payment QR** - Custom payment data

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test -- --coverage
```

## 🏗 Development

### Project Structure

```
rada-bot/
├── src/                    # Backend source code
│   ├── bot/               # Telegram bot implementation
│   ├── services/          # Business logic services
│   ├── server/            # Express server
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   └── __tests__/         # Test files
├── web-ui/                # React frontend
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   └── dist/              # Build output
├── .github/               # GitHub Actions
└── docs/                  # Documentation
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode

# Linting
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint errors

# Web UI
cd web-ui
npm run dev         # Start Vite dev server
npm run build       # Build for production
npm run preview     # Preview production build
```

## 🚀 Deployment

### Bot Backend

#### Render.com (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push
4. Use the `render.yaml` configuration file

#### Railway.app
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

#### Fly.io
```bash
fly deploy
```

#### Docker
```bash
docker build -t rada-bot .
docker run -p 3000:3000 --env-file .env rada-bot
```

### Web UI

The web UI is automatically deployed to GitHub Pages on every push to main.

## 🔧 Configuration

### Telegram Bot Setup

1. Create a bot with [@BotFather](https://t.me/BotFather)
2. Get your bot token
3. Set webhook URL: `https://your-domain.com/webhook`

### Minmo API Integration

1. Sign up for Minmo API access
2. Get your API key and webhook secret
3. Configure webhook URLs:
   - Lightning webhook: `https://your-domain.com/api/lightning/callback`
   - M-Pesa payout webhook: `https://your-domain.com/api/minmo/payout-callback`

## 📊 API Endpoints

### Bot Webhook
- `POST /webhook` - Telegram bot webhook

### Minmo Integration
- `POST /api/lightning/callback` - Lightning payment webhook
- `POST /api/minmo/payout-callback` - M-Pesa payout webhook

### Public API
- `GET /health` - Health check
- `GET /api/exchange-rate` - Current Bitcoin to KES exchange rate
- `GET /api/rate-status` - Rate service status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@mwanga.com
- 💬 Telegram: [@Rada_Btc_Pay_bot](https://t.me/Rada_Btc_Pay_bot)
- 🐛 Issues: [GitHub Issues](https://github.com/MWANGAZA-LAB/Rada_Btc_Pay_bot/issues)

## 🙏 Acknowledgments

- [grammY](https://grammy.dev/) - Amazing Telegram Bot Framework
- [Minmo](https://minmo.com/) - M-Pesa and Bitcoin integration
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

---

**Built with ❤️ for the Kenyan Bitcoin community**
