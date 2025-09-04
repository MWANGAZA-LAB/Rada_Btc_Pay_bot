# 🚀 Rada Bot

> Seamless Bitcoin payments via M-Pesa

Rada Bot is a non-custodial tool that lets users pay with M-Pesa and instantly convert their payments to Bitcoin. Built for Kenya, powered by Bitcoin.

## ✨ Features

- 📱 **Buy Airtime** - Top up your phone with Bitcoin rewards
- 🏢 **Pay Bills** - Pay utility bills and earn Bitcoin
- 🛒 **Buy Goods** - Purchase goods and receive Bitcoin
- 💸 **Send Money** - Send money and get Bitcoin rewards
- 💰 **Lipa na Pochi** - Use Pochi and earn Bitcoin
- 📷 **Scan QR Codes** - Scan QR codes for Bitcoin payments

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram Bot  │    │  Rada Backend   │    │   Minmo API     │
│                 │◄──►│                 │◄──►│                 │
│  User Interface │    │  Orchestrator   │    │ Payment & BTC   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web UI        │    │     Redis       │    │   M-Pesa API    │
│  (GitHub Pages) │    │   (Sessions)    │    │                 │
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
- **Railway.app** / **Fly.io** - Bot deployment
- **GitHub Pages** - Web UI deployment
- **Docker** - Containerization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Redis (optional, uses in-memory storage if not available)
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Minmo API credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rada-bot/rada-bot.git
   cd rada-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your credentials
   ```

4. **Start the bot**
   ```bash
   npm run dev
   ```

### Environment Variables

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook

# Minmo API
MINMO_API_KEY=your_minmo_api_key
MINMO_API_URL=https://api.minmo.com/v1
MINMO_WEBHOOK_SECRET=your_webhook_secret

# Server
PORT=3000
NODE_ENV=development

# Redis (Optional)
REDIS_URL=redis://localhost:6379
```

## 📱 Usage

1. **Start the bot** on Telegram: [@RadaBot](https://t.me/RadaBot)
2. **Choose a service** from the main menu
3. **Enter payment details** (phone, amount, etc.)
4. **Confirm payment** and complete via M-Pesa
5. **Receive Bitcoin** instantly in your wallet

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
3. Configure webhook URL: `https://your-domain.com/api/minmo/callback`

## 📊 API Endpoints

### Bot Webhook
- `POST /webhook` - Telegram bot webhook

### Minmo Integration
- `POST /api/minmo/callback` - Minmo payment webhook

### Public API
- `GET /health` - Health check
- `GET /api/exchange-rate` - Current exchange rate

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@radabot.com
- 💬 Telegram: [@RadaBot](https://t.me/RadaBot)
- 🐛 Issues: [GitHub Issues](https://github.com/rada-bot/rada-bot/issues)

## 🙏 Acknowledgments

- [grammY](https://grammy.dev/) - Amazing Telegram Bot Framework
- [Minmo](https://minmo.com/) - M-Pesa and Bitcoin integration
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

---

**Built with ❤️ for the Kenyan Bitcoin community**
