import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { initDatabase, cleanupExpiredTokens } from './database';
import { logger } from './utils/logger';
import authRoutes from './routes/auth';
import ideasRoutes from './routes/ideas';
import memosRoutes from './routes/memos';
import historyRoutes from './routes/history';

dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variable validation
const validateEnvVars = () => {
  const required = [
    'DATABASE_HOST',
    'DATABASE_USER',
    'DATABASE_PASSWORD',
    'DATABASE_NAME',
    'JWT_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    logger.fatal({ missing }, 'Missing required environment variables');
    process.exit(1);
  }

  // Validate JWT_SECRET strength in production
  if (process.env.NODE_ENV === 'production') {
    const jwtSecret = process.env.JWT_SECRET!;
    if (jwtSecret.length < 32) {
      logger.fatal('JWT_SECRET must be at least 32 characters in production');
      process.exit(1);
    }
  }

  logger.info('Environment variables validated successfully');
};

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Koyeb (for correct IP addresses in logs)
app.set('trust proxy', 1);

// Security middleware - Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", ...(process.env.FRONTEND_URL?.split(',').map(u => u.trim()) || ['http://localhost:5173'])],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false, // Required for some external resources
  // Strict-Transport-Security (HSTS) - enforce HTTPS in production
  strictTransportSecurity: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  } : false,
  // X-Content-Type-Options
  xContentTypeOptions: true,
  // X-Frame-Options - prevent clickjacking
  xFrameOptions: { action: 'deny' },
  // Referrer-Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // X-DNS-Prefetch-Control
  xDnsPrefetchControl: { allow: false },
  // X-Download-Options
  xDownloadOptions: true,
  // X-Permitted-Cross-Domain-Policies
  xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
  // Origin-Agent-Cluster header for process isolation
  originAgentCluster: true
}));

// Permissions-Policy header (not yet supported by helmet, add manually)
app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()'
  );
  next();
});

// Rate limiting configuration (configurable via environment variables)
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // default: 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiting for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000', 10), // default: 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '10', 10),
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

// Very strict rate limiting for password reset
const passwordResetLimiter = rateLimit({
  windowMs: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_WINDOW_MS || '3600000', 10), // default: 1 hour
  max: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_MAX_REQUESTS || '3', 10),
  message: { error: 'Too many password reset attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for write operations (create, update, delete)
const writeOperationLimiter = rateLimit({
  windowMs: parseInt(process.env.WRITE_RATE_LIMIT_WINDOW_MS || '60000', 10), // default: 1 minute
  max: parseInt(process.env.WRITE_RATE_LIMIT_MAX_REQUESTS || '30', 10), // 30 writes per minute
  message: { error: 'Too many write operations, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET' // Only limit write operations
});

// Rate limiting for bulk operations
const bulkOperationLimiter = rateLimit({
  windowMs: parseInt(process.env.BULK_RATE_LIMIT_WINDOW_MS || '60000', 10), // default: 1 minute
  max: parseInt(process.env.BULK_RATE_LIMIT_MAX_REQUESTS || '10', 10), // 10 bulk ops per minute
  message: { error: 'Too many bulk operations, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// CORS configuration - strict origin checking
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

// In development, also allow common development origins
if (process.env.NODE_ENV !== 'production') {
  const devOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
  devOrigins.forEach(origin => {
    if (!allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.) only in development
    if (!origin) {
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      // In production, reject requests without origin for API calls
      return callback(null, false);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Cookie parser for HttpOnly token cookies
app.use(cookieParser());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Structured request logging with pino-http
app.use(pinoHttp({
  logger,
  // Don't log health checks
  autoLogging: {
    ignore: (req) => req.url === '/api/health' || req.url === '/api/v1/health'
  },
  // Redact sensitive data from logs
  redact: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password', 'req.body.newPassword', 'req.body.email', 'req.body.token'],
  // Custom log level based on status code
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  // Custom success message
   
  customSuccessMessage: (req, _res) => {
    return `${req.method} ${req.url} completed`;
  },
  // Custom error message
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} failed: ${err.message}`;
  }
}));

// API Routes with specific rate limiters
// Version 1 API routes (current)
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/password-reset', passwordResetLimiter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ideas/bulk', bulkOperationLimiter); // Bulk operations have stricter limits
app.use('/api/v1/ideas', writeOperationLimiter, ideasRoutes);
app.use('/api/v1/memos', writeOperationLimiter, memosRoutes);
app.use('/api/v1/history', historyRoutes);

// Backward compatible routes (redirect to v1)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/password-reset', passwordResetLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/ideas/bulk', bulkOperationLimiter); // Bulk operations have stricter limits
app.use('/api/ideas', writeOperationLimiter, ideasRoutes);
app.use('/api/memos', writeOperationLimiter, memosRoutes);
app.use('/api/history', historyRoutes);

// Health check (both versioned and non-versioned)
const healthCheck = async (req: express.Request, res: express.Response) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0',
      apiVersion: 'v1'
    });
  } catch {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
};

app.get('/api/health', healthCheck);
app.get('/api/v1/health', healthCheck);

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve static files in production (for Koyeb deployment)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');

  // Serve static assets
  app.use(express.static(distPath, {
    maxAge: '1d',
    etag: true
  }));

  // SPA fallback - serve index.html for all other routes
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling middleware
interface HttpError extends Error {
  status?: number;
}

 
app.use((err: HttpError, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err, req: { method: req.method, url: req.url } }, 'Request error');

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS not allowed' });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// Graceful shutdown handler
let server: ReturnType<typeof app.listen>;
let tokenCleanupInterval: NodeJS.Timeout | null = null;

const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Starting graceful shutdown...');

  // Clear token cleanup interval
  if (tokenCleanupInterval) {
    clearInterval(tokenCleanupInterval);
    logger.info('Token cleanup interval cleared');
  }

  // Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  try {
    // Close database pool
    await pool.end();
    logger.info('Database pool closed');
  } catch (error) {
    logger.error({ error }, 'Error closing database pool');
  }

  // Exit after cleanup
  process.exit(0);
};

// Register shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught Exception');
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection');
  // In production, gracefully shutdown to prevent inconsistent state
  if (process.env.NODE_ENV === 'production') {
    logger.fatal('Unhandled rejection in production - initiating graceful shutdown');
    shutdown('unhandledRejection');
  }
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Validate environment variables
    validateEnvVars();

    // Initialize database
    await initDatabase();

    // Start periodic token cleanup (every hour)
    tokenCleanupInterval = setInterval(async () => {
      try {
        await cleanupExpiredTokens();
        logger.debug('Expired tokens cleaned up');
      } catch (error) {
        logger.error({ error }, 'Token cleanup failed');
      }
    }, 60 * 60 * 1000); // 1 hour

    // Initial cleanup
    await cleanupExpiredTokens();

    // Start server
    server = app.listen(PORT, () => {
      logger.info({
        port: PORT,
        env: process.env.NODE_ENV || 'development',
        apiVersions: ['v1']
      }, `Server running on port ${PORT}`);

      if (process.env.NODE_ENV === 'production') {
        logger.info('Static files will be served from dist/');
      }
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
