import { Pool } from 'pg';
import dotenv from 'dotenv';

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

export const query = (text: string, params?: unknown[]) => pool.query(text, params);

export const initDatabase = async () => {
  try {
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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
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

    // Create indexes for better performance
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON idea_manager.ideas(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_status ON idea_manager.ideas(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_category ON idea_manager.ideas(category)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_priority ON idea_manager.ideas(priority)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON idea_manager.ideas(created_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_ideas_tags ON idea_manager.ideas USING GIN(tags)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_daily_memos_user_date ON idea_manager.daily_memos(user_id, date)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_idea_history_idea_id ON idea_manager.idea_history(idea_id)`);

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

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export default pool;
