import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prdRouter from './routes/prd';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

// Load environmental variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : []),
];

// Enable CORS for frontend requests (must allow specific origin for credentials/cookies)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}));

// Better Auth route handler (mounted before body parser)
app.all("/api/auth/*", toNodeHandler(auth));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI PRD Generator Backend is running.' });
});

// PRD Document & Generator Routes
app.use('/api/prd', prdRouter);

// Global Error Handler Middleware
import { errorHandler } from './middlewares/errorHandler';
app.use(errorHandler);

// Start listening
app.listen(port, () => {
  console.log(`[Server]: AI PRD Generator API listening at http://localhost:${port}`);
});
