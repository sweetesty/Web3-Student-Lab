import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import prisma from './db/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import routes from './routes/index.js';
import { validateEnvironment } from './utils/checkEnv.js';

// Load environment variables
dotenv.config();

// Validate environment variables before starting the application
validateEnvironment();

export const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Web3 Student Lab Backend is running' });
});

// API Routes
app.use('/api', routes);

// Start server only if not in test environment
let server: ReturnType<typeof app.listen> | null = null;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await prisma.$disconnect();
    server?.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGTERM', async () => {
    console.log('\nShutting down gracefully...');
    await prisma.$disconnect();
    server?.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}
