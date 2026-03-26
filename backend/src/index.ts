import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import prisma from './db/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import routes from './routes/index.js';
import { rateLimit } from 'express-rate-limit';
import { validateEnvironment } from './utils/checkEnv.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

// Validate environment variables before starting the application
validateEnvironment();

export const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

app.use(limiter);
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Web3 Student Lab Backend is running',
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api', routes);

// Start server only if not in test environment
let server: ReturnType<typeof app.listen> | null = null;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down gracefully...');
    await prisma.$disconnect();
    server?.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGTERM', async () => {
    logger.info('Shutting down gracefully...');
    await prisma.$disconnect();
    server?.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}
