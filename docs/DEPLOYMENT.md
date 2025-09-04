# Deployment Guide

This guide covers deploying Rada Bot to various platforms.

## 🚀 Quick Deploy

### Railway.app (Recommended)

1. **Connect Repository**
   - Go to [Railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the `rada-bot` repository

2. **Configure Environment Variables**
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token
   MINMO_API_KEY=your_minmo_api_key
   MINMO_WEBHOOK_SECRET=your_webhook_secret
   TELEGRAM_WEBHOOK_URL=https://your-app.railway.app/webhook
   NODE_ENV=production
   ```

3. **Deploy**
   - Railway will automatically build and deploy
   - Your bot will be available at `https://your-app.railway.app`

### Fly.io

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login and Launch**
   ```bash
   fly auth login
   fly launch
   ```

3. **Set Environment Variables**
   ```bash
   fly secrets set TELEGRAM_BOT_TOKEN=your_bot_token
   fly secrets set MINMO_API_KEY=your_minmo_api_key
   fly secrets set MINMO_WEBHOOK_SECRET=your_webhook_secret
   fly secrets set TELEGRAM_WEBHOOK_URL=https://your-app.fly.dev/webhook
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

## 🐳 Docker Deployment

### Build and Run

```bash
# Build the image
docker build -t rada-bot .

# Run the container
docker run -d \
  --name rada-bot \
  -p 3000:3000 \
  --env-file .env \
  rada-bot
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ Cloud Providers

### AWS (ECS)

1. **Create ECS Cluster**
   ```bash
   aws ecs create-cluster --cluster-name rada-bot
   ```

2. **Create Task Definition**
   ```json
   {
     "family": "rada-bot",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "rada-bot",
         "image": "your-account.dkr.ecr.region.amazonaws.com/rada-bot:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ],
         "secrets": [
           {
             "name": "TELEGRAM_BOT_TOKEN",
             "valueFrom": "arn:aws:secretsmanager:region:account:secret:rada-bot/token"
           }
         ]
       }
     ]
   }
   ```

3. **Create Service**
   ```bash
   aws ecs create-service \
     --cluster rada-bot \
     --service-name rada-bot-service \
     --task-definition rada-bot:1 \
     --desired-count 1 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
   ```

### Google Cloud (Cloud Run)

1. **Build and Push Image**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT-ID/rada-bot
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy rada-bot \
     --image gcr.io/PROJECT-ID/rada-bot \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production
   ```

3. **Set Secrets**
   ```bash
   gcloud run services update rada-bot \
     --set-secrets TELEGRAM_BOT_TOKEN=telegram-token:latest \
     --set-secrets MINMO_API_KEY=minmo-key:latest
   ```

### Azure (Container Instances)

1. **Create Resource Group**
   ```bash
   az group create --name rada-bot-rg --location eastus
   ```

2. **Deploy Container**
   ```bash
   az container create \
     --resource-group rada-bot-rg \
     --name rada-bot \
     --image your-registry.azurecr.io/rada-bot:latest \
     --dns-name-label rada-bot \
     --ports 3000 \
     --environment-variables NODE_ENV=production \
     --secure-environment-variables \
       TELEGRAM_BOT_TOKEN=your_bot_token \
       MINMO_API_KEY=your_minmo_api_key
   ```

## 🌐 Web UI Deployment

### GitHub Pages

The web UI is automatically deployed to GitHub Pages via GitHub Actions.

1. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to Pages section
   - Select "GitHub Actions" as source

2. **Configure Custom Domain** (Optional)
   - Add your domain to the repository settings
   - Update DNS records to point to GitHub Pages

### Netlify

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Connect your GitHub repository
   - Set build command: `cd web-ui && npm run build`
   - Set publish directory: `web-ui/dist`

2. **Configure Environment Variables**
   ```env
   VITE_API_URL=https://api.radabot.com
   ```

3. **Deploy**
   - Netlify will automatically build and deploy
   - Your site will be available at `https://your-site.netlify.app`

### Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd web-ui
   vercel --prod
   ```

## 🔧 Environment Configuration

### Required Variables

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook

# Minmo API
MINMO_API_KEY=your_minmo_api_key_here
MINMO_API_URL=https://api.minmo.com/v1
MINMO_WEBHOOK_SECRET=your_webhook_secret_here

# Server
PORT=3000
NODE_ENV=production

# Redis (Optional)
REDIS_URL=redis://your-redis-url:6379
```

### Optional Variables

```env
# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
CORS_ORIGIN=https://your-frontend-domain.com
```

## 📊 Monitoring

### Health Checks

All deployments include health check endpoints:

```bash
curl https://your-domain.com/health
```

### Logging

- **Development**: Console logging
- **Production**: File logging to `logs/` directory
- **Cloud**: Use platform-specific logging (CloudWatch, Stackdriver, etc.)

### Metrics

Key metrics to monitor:

- Response times
- Error rates
- Payment success rates
- Exchange rate accuracy
- Bot usage statistics

## 🔒 Security

### SSL/TLS

- Use HTTPS for all production deployments
- Configure proper SSL certificates
- Enable HSTS headers

### Secrets Management

- Never commit secrets to version control
- Use environment variables or secret management services
- Rotate secrets regularly

### Network Security

- Configure proper firewall rules
- Use VPCs for cloud deployments
- Enable DDoS protection

## 🚨 Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check webhook URL configuration
   - Verify bot token is correct
   - Check server logs for errors

2. **Payment failures**
   - Verify Minmo API credentials
   - Check webhook endpoint accessibility
   - Review payment validation logic

3. **High memory usage**
   - Monitor Redis memory usage
   - Check for memory leaks in code
   - Scale horizontally if needed

### Debug Commands

```bash
# Check bot status
curl https://your-domain.com/health

# View logs
docker logs rada-bot

# Check environment variables
docker exec rada-bot env | grep -E "(TELEGRAM|MINMO)"

# Test webhook
curl -X POST https://your-domain.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 📈 Scaling

### Horizontal Scaling

- Use load balancers for multiple instances
- Configure Redis for session sharing
- Implement proper health checks

### Vertical Scaling

- Increase CPU/memory based on usage
- Monitor resource utilization
- Optimize code for better performance

## 🔄 CI/CD

### GitHub Actions

The repository includes GitHub Actions for:

- Automated testing
- Code quality checks
- Web UI deployment
- Docker image building

### Custom CI/CD

For custom deployments, ensure:

- Run tests before deployment
- Build and test Docker images
- Deploy to staging first
- Monitor deployment success

## 📞 Support

- 📧 **Email**: deploy@radabot.com
- 💬 **Discord**: [Join our server](https://discord.gg/radabot)
- 📖 **Documentation**: [docs.radabot.com](https://docs.radabot.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/rada-bot/rada-bot/issues)
