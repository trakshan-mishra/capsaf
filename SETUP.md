# CAPSAF - Complete Setup Guide

## Production-Ready Crypto & Tax Management System

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Local Installation](#local-installation)
3. [Docker Setup](#docker-setup)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [API Keys & Services](#api-keys--services)
7. [Running the Application](#running-the-application)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **Node.js**: 22.x or higher
- **npm**: 10.x or higher
- **MongoDB**: 6.0 or higher (local or cloud)
- **RAM**: 2GB minimum
- **Disk Space**: 1GB minimum

### Recommended Requirements
- **Node.js**: 22.12.0 or latest LTS
- **RAM**: 4GB or higher
- **MongoDB**: MongoDB Atlas (managed)
- **Redis**: For caching (optional but recommended)

---

## Local Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/capsaf.git
cd capsaf
```

### Step 2: Run Installation Script

#### macOS/Linux:
```bash
chmod +x install.sh
./install.sh
```

#### Windows:
```bash
install.bat
```

### Step 3: Manual Installation (if scripts don't work)

```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env

# Create necessary directories
mkdir -p uploads logs config models routes middleware

# Install global dependencies (optional)
npm install -g nodemon
```

---

## Docker Setup

### Prerequisites
- Docker Desktop installed
- Docker Compose 2.0+

### One-Command Setup

```bash
# Start all services (MongoDB, Redis, Backend, Frontend)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

---

## Database Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/capsaf?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB

```bash
# macOS (using Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Linux (Ubuntu/Debian)
sudo apt-get install -y mongodb
sudo systemctl start mongodb

# Windows
# Download from mongodb.com/try/download/community
# Install and MongoDB will start automatically
```

Test connection:
```bash
mongosh mongodb://localhost:27017/capsaf
```

### Option 3: Docker MongoDB

```bash
docker run -d \
  --name capsaf-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=capsaf \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0
```

---

## Environment Configuration

### 1. Create `.env` File

```bash
cp .env.example .env
```

### 2. Required Variables

```env
# Server
NODE_ENV=development
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/capsaf
MONGODB_LOCAL=mongodb://localhost:27017/capsaf

# JWT
JWT_SECRET=your-32-character-secret-key-here
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your-refresh-secret-key
REFRESH_TOKEN_EXPIRE=30d

# Cache (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 3. Optional Variables (for full features)

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-id
GITHUB_CLIENT_SECRET=your-github-secret

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-key

# AI Models
GROQ_API_KEY=gsk_your-api-key
OPENAI_API_KEY=sk_your-api-key

# Crypto APIs
COINGECKO_API_KEY=your-key
COINMARKETCAP_API_KEY=your-key
BINANCE_API_KEY=your-key
BINANCE_API_SECRET=your-secret
```

---

## API Keys & Services

### Free API Keys to Generate

| Service | Purpose | URL | Free Tier |
|---------|---------|-----|-----------|
| Groq | AI Models | groq.com | 30 requests/min |
| CoinGecko | Crypto Prices | coingecko.com/api | Unlimited |
| Twilio | SMS | twilio.com | $15 trial credit |
| SendGrid | Email | sendgrid.com | 100/day free |
| Firebase | Notifications | firebase.google.com | 100 notifications/day |

### Getting API Keys

#### Groq (Free AI - Recommended)
```bash
1. Go to console.groq.com
2. Sign up/login
3. Create API key
4. Add to .env: GROQ_API_KEY=your-key
```

#### Google OAuth
```bash
1. Go to console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web)
5. Add authorized redirect URIs
6. Copy credentials to .env
```

#### Stripe (Optional - for payments)
```bash
1. Sign up at stripe.com
2. Go to Dashboard → API Keys
3. Copy test keys to .env
```

---

## Running the Application

### Development Mode

```bash
# Install nodemon first
npm install -g nodemon

# Start with auto-reload
npm run dev

# Or manually
node --watch server.js
```

Server runs on: `http://localhost:3001`
Frontend: `http://localhost:3000`

### Production Mode

```bash
# Build if needed
npm run build

# Start server
npm start
```

### Run Tests

```bash
npm test
```

### Seed Database with Sample Data

```bash
npm run seed
```

---

## Deployment

### Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create capsaf-app

# Add MongoDB URI to Heroku
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

### Railway.app Deployment

```bash
1. Connect GitHub repo
2. Add environment variables
3. Deploy automatically
```

### AWS/DigitalOcean/Linode

```bash
# Build Docker image
docker build -t capsaf:latest .

# Run on server
docker run -d \
  -p 3001:3001 \
  -e MONGODB_URI=your-uri \
  -e JWT_SECRET=your-secret \
  capsaf:latest
```

### Vercel (Frontend Only)

```bash
# Deploy HTML frontend
vercel --prod
```

---

## Troubleshooting

### Issue: MongoDB Connection Failed

**Solution:**
```bash
# Check if MongoDB is running
mongosh mongodb://localhost:27017

# If local MongoDB not installed, use MongoDB Atlas
# Update MONGODB_URI in .env
```

### Issue: Port Already in Use

**Solution:**
```bash
# Kill process on port 3001 (macOS/Linux)
lsof -ti:3001 | xargs kill -9

# Kill process on port 3001 (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Install with legacy peer deps
npm install --legacy-peer-deps

# Or use yarn
npm install -g yarn
yarn install
```

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Issue: CORS errors

**Solution:**
```env
# Update .env with your frontend URL
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

---

## Next Steps

1. ✅ Complete setup following this guide
2. 📚 Read [API_ENDPOINTS.md](./API_ENDPOINTS.md) for API documentation
3. 🔐 Secure your production environment
4. 🚀 Deploy to production
5. 📈 Monitor and scale

---

## Support

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Email**: support@capsaf.com

---

## License

CAPSAF is licensed under the MIT License.
