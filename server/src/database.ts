import { Pool, PoolClient } from 'pg';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { logger } from './utils/logger';

dotenv.config();

// SSL configuration based on environment
const getSslConfig = () => {
  const sslMode = process.env.DATABASE_SSL_MODE || 'require';

  if (sslMode === 'disable') {
    return false;
  }

  // In production, enforce SSL certificate validation
  if (process.env.NODE_ENV === 'production') {
    return {
      rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false'
    };
  }

  // In development, allow self-signed certificates
  return {
    rejectUnauthorized: false
  };
};

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  ssl: getSslConfig(),
  // Connection pool settings for production
  max: parseInt(process.env.DATABASE_POOL_MAX || '20'),
  idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '2000'),
});

// Handle pool errors to prevent unhandled rejections
pool.on('error', (err) => {
  logger.error({ error: err }, 'Unexpected database pool error');
});

pool.on('connect', () => {
  logger.debug('New database connection established');
});

export const query = (text: string, params?: unknown[]) => pool.query(text, params);

// Get a client from the pool for transactions
export const getClient = (): Promise<PoolClient> => pool.connect();

// Transaction helper - executes callback within a transaction
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Query within a transaction (use with withTransaction)
export const txQuery = (client: PoolClient, text: string, params?: unknown[]) =>
  client.query(text, params);

// Hash token for storage (don't store raw tokens)
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Check if token is blacklisted
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const tokenHash = hashToken(token);
  const result = await query(
    'SELECT id FROM idea_manager.token_blacklist WHERE token_hash = $1 AND expires_at > NOW()',
    [tokenHash]
  );
  return result.rows.length > 0;
};

// Add token to blacklist
export const blacklistToken = async (token: string, userId: string, expiresAt: Date): Promise<void> => {
  const tokenHash = hashToken(token);
  await query(
    'INSERT INTO idea_manager.token_blacklist (token_hash, user_id, expires_at) VALUES ($1, $2, $3) ON CONFLICT (token_hash) DO NOTHING',
    [tokenHash, userId, expiresAt]
  );
};

// Clean up expired tokens (call periodically)
export const cleanupExpiredTokens = async (): Promise<void> => {
  await query('DELETE FROM idea_manager.token_blacklist WHERE expires_at < NOW()');
  await query('DELETE FROM idea_manager.password_reset_tokens WHERE expires_at < NOW()');
};

// Retry connection with exponential backoff
async function connectWithRetry(maxRetries = 3, baseDelayMs = 1000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      client.release();
      logger.info('Database connection verified');
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        logger.error({ error, attempt }, 'Failed to connect to database after max retries');
        throw error;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      logger.warn({ attempt, delay, error }, 'Database connection failed, retrying...');
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export const initDatabase = async () => {
  try {
    // Verify database connection with retry
    await connectWithRetry();

    // Create schema
    await query(`CREATE SCHEMA IF NOT EXISTS idea_manager`);

    // Set search path
    await query(`SET search_path TO idea_manager, public`);

    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS idea_manager.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ideas table
    await query(`
      CREATE TABLE IF NOT EXISTS idea_manager.ideas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES idea_manager.users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        tags TEXT[] DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in-progress', 'completed', 'archived')),
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        notes TEXT,
        target_market TEXT,
        potential_revenue TEXT,
        resources TEXT,
        timeline TEXT,
        deadline DATE,
        reminder_enabled BOOLEAN DEFAULT FALSE,
        reminder_days INTEGER DEFAULT 3,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new columns if they don't exist (for existing databases)
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'idea_manager' AND table_name = 'ideas' AND column_name = 'deadline') THEN
          ALTER TABLE idea_manager.ideas ADD COLUMN deadline DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'idea_manager' AND table_name = 'ideas' AND column_name = 'reminder_enabled') THEN
          ALTER TABLE idea_manager.ideas ADD COLUMN reminder_enabled BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'idea_manager' AND table_name = 'ideas' AND column_name = 'reminder_days') THEN
          ALTER TABLE idea_manager.ideas ADD COLUMN reminder_days INTEGER DEFAULT 3;
        END IF;
      END $$;
    `);

    // Daily memos table
    await query(`
      CREATE TABLE IF NOT EXISTS idea_manager.daily_memos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES idea_manager.users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      )
    `);

    // Idea history table for tracking changes
    await query(`
      CREATE TABLE IF NOT EXISTS idea_manager.idea_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        idea_id UUID NOT NULL REFERENCES idea_manager.ideas(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES idea_manager.users(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'updated', 'status_changed', 'deleted')),
        old_values JSONB,
        new_values JSONB,
        changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Token blacklist table for JWT invalidation
    await query(`
      CREATE TABLE IF NOT EXISTS idea_manager.token_blacklist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token_hash VARCHAR(64) NOT NULL UNIQUE,
        user_id UUID REFERENCES idea_manager.users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Password reset tokens table
    await query(`
      CREATE TABLE IF NOT EXISTS idea_manager.password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES idea_manager.users(id) ON DELETE CASCADE,
        token_hash VARCHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON idea_manager.ideas(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_status ON idea_manager.ideas(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_category ON idea_manager.ideas(category)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_priority ON idea_manager.ideas(priority)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON idea_manager.ideas(created_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_updated_at ON idea_manager.ideas(updated_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_tags ON idea_manager.ideas USING GIN(tags)`);

    // Composite indexes for common query patterns
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_user_status ON idea_manager.ideas(user_id, status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_user_created ON idea_manager.ideas(user_id, created_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_user_priority ON idea_manager.ideas(user_id, priority)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_user_category ON idea_manager.ideas(user_id, category)`);

    await query(`CREATE INDEX IF NOT EXISTS idx_daily_memos_user_date ON idea_manager.daily_memos(user_id, date)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_idea_history_idea_id ON idea_manager.idea_history(idea_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_idea_history_user_id ON idea_manager.idea_history(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_idea_history_changed_at ON idea_manager.idea_history(changed_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_token_blacklist_token_hash ON idea_manager.token_blacklist(token_hash)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON idea_manager.token_blacklist(expires_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON idea_manager.password_reset_tokens(token_hash)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON idea_manager.password_reset_tokens(user_id)`);

    // Try to create pg_trgm extension for better ILIKE search performance
    // This is optional - will gracefully skip if extension is not available
    try {
      await query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
      // Trigram indexes for faster ILIKE searches on title and description
      await query(`CREATE INDEX IF NOT EXISTS idx_ideas_title_trgm ON idea_manager.ideas USING GIN(title gin_trgm_ops)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_ideas_description_trgm ON idea_manager.ideas USING GIN(description gin_trgm_ops)`);
      logger.info('pg_trgm extension and trigram indexes created for improved search performance');
    } catch {
      // pg_trgm extension not available - search will still work but may be slower for large datasets
      logger.debug('pg_trgm extension not available - skipping trigram indexes');
    }

    // Create update timestamp trigger function
    await query(`
      CREATE OR REPLACE FUNCTION idea_manager.update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Apply trigger to tables
    await query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON idea_manager.users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON idea_manager.users
        FOR EACH ROW EXECUTE FUNCTION idea_manager.update_updated_at_column()
    `);

    await query(`
      DROP TRIGGER IF EXISTS update_ideas_updated_at ON idea_manager.ideas;
      CREATE TRIGGER update_ideas_updated_at
        BEFORE UPDATE ON idea_manager.ideas
        FOR EACH ROW EXECUTE FUNCTION idea_manager.update_updated_at_column()
    `);

    await query(`
      DROP TRIGGER IF EXISTS update_daily_memos_updated_at ON idea_manager.daily_memos;
      CREATE TRIGGER update_daily_memos_updated_at
        BEFORE UPDATE ON idea_manager.daily_memos
        FOR EACH ROW EXECUTE FUNCTION idea_manager.update_updated_at_column()
    `);

    logger.info('Database schema initialized successfully');
  } catch (error) {
    logger.error({ error }, 'Error initializing database');
    throw error;
  }
};

export default pool;
