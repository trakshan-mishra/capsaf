import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongooseConnection from './config/database.js';
import authRoutes from './routes/auth.js';
import portfolioRoutes from './routes/portfolio.js';
import transactionRoutes from './routes/transactions.js';
import invoiceRoutes from './routes/invoices.js';
import advisorRoutes from './routes/advisor.js';
import notificationRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';
import errorHandler from './middleware/errorHandler.js';
import { verifyToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later'
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongooseConnection.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', verifyToken, portfolioRoutes);
app.use('/api/transactions', verifyToken, transactionRoutes);
app.use('/api/invoices', verifyToken, invoiceRoutes);
app.use('/api/advisor', verifyToken, advisorRoutes);
app.use('/api/notifications', verifyToken, notificationRoutes);
app.use('/api/settings', verifyToken, settingsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error Handler
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   CAPSAF Backend Server Started        ║
║   🚀 Running on port ${PORT}              ║
║   📍 Environment: ${process.env.NODE_ENV || 'development'}       ║
║   🗄️  Database: ${process.env.DB_TYPE || 'MongoDB'}            ║
╚════════════════════════════════════════╝
  `);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
