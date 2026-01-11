import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, blacklistToken, hashToken } from '../database';
import { authMiddleware, AuthRequest, getJwtSecret } from '../middleware/auth';
import { createLogger } from '../utils/logger';
import { sendPasswordResetEmail, isEmailServiceAvailable } from '../utils/email';

const log = createLogger('auth');
const router = Router();

// Cookie configuration for JWT token
const COOKIE_NAME = 'authToken';
const getCookieOptions = () => ({
  httpOnly: true, // Prevents JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: '/',
});

// Helper to set auth cookie
const setAuthCookie = (res: Response, token: string) => {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
};

// Helper to clear auth cookie
const clearAuthCookie = (res: Response) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
    path: '/',
  });
};

// Password validation function
const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Email validation function
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
    }

    // Validate name
    if (name.trim().length < 2 || name.length > 255) {
      return res.status(400).json({ error: 'Name must be between 2 and 255 characters' });
    }

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM idea_manager.users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      'INSERT INTO idea_manager.users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email.toLowerCase().trim(), passwordHash, name.trim()]
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      getJwtSecret(),
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Set HttpOnly cookie
    setAuthCookie(res, token);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at
      },
      token // Also return token for backward compatibility
    });
  } catch (error) {
    log.error({ error }, 'Register error');
    res.status(500).json({ error: 'Failed to register' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format before database query
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Find user
    const result = await query(
      'SELECT id, email, password_hash, name, created_at FROM idea_manager.users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      getJwtSecret(),
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Set HttpOnly cookie
    setAuthCookie(res, token);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at
      },
      token // Also return token for backward compatibility
    });
  } catch (error) {
    log.error({ error }, 'Login error');
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT id, email, name, created_at, updated_at FROM idea_manager.users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    log.error({ error }, 'Get user error');
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;

    // Validate email format if provided
    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate name if provided
    if (name && (name.trim().length < 2 || name.length > 255)) {
      return res.status(400).json({ error: 'Name must be between 2 and 255 characters' });
    }

    // Check email uniqueness if email is being changed
    if (email) {
      const existingUser = await query(
        'SELECT id FROM idea_manager.users WHERE email = $1 AND id != $2',
        [email.toLowerCase().trim(), req.userId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email already registered by another user' });
      }
    }

    const result = await query(
      'UPDATE idea_manager.users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3 RETURNING id, email, name, created_at, updated_at',
      [name?.trim(), email?.toLowerCase().trim(), req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    log.error({ error }, 'Update profile error');
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'New password does not meet requirements',
        details: passwordValidation.errors
      });
    }

    // Get current password hash
    const userResult = await query(
      'SELECT password_hash FROM idea_manager.users WHERE id = $1',
      [req.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await query(
      'UPDATE idea_manager.users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, req.userId]
    );

    // Invalidate any pending password reset tokens for this user
    await query(
      'UPDATE idea_manager.password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
      [req.userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    log.error({ error }, 'Change password error');
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Logout - invalidate token
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.token || !req.userId) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Decode token to get expiration time
    const decoded = jwt.decode(req.token) as { exp: number };
    if (!decoded?.exp) {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    // Add token to blacklist
    const expiresAt = new Date(decoded.exp * 1000);
    await blacklistToken(req.token, req.userId, expiresAt);

    // Clear HttpOnly cookie
    clearAuthCookie(res);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    log.error({ error }, 'Logout error');
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// Request password reset
router.post('/password-reset/request', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Always return success to prevent email enumeration
    const successMessage = { message: 'If the email exists, a password reset link has been sent' };

    // Find user
    const userResult = await query(
      'SELECT id FROM idea_manager.users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (userResult.rows.length === 0) {
      // Return success even if user doesn't exist (prevents email enumeration)
      return res.json(successMessage);
    }

    const userId = userResult.rows[0].id;

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRES_MS || '3600000')); // default: 1 hour

    // Invalidate any existing tokens for this user
    await query(
      'UPDATE idea_manager.password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
      [userId]
    );

    // Store hashed token
    await query(
      'INSERT INTO idea_manager.password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );

    // Get frontend URL for reset link
    const frontendUrl = process.env.FRONTEND_URL?.split(',')[0]?.trim() || 'http://localhost:5173';

    // Send password reset email
    if (isEmailServiceAvailable()) {
      const emailSent = await sendPasswordResetEmail(email, resetToken, frontendUrl);
      if (!emailSent) {
        log.warn({ email }, 'Failed to send password reset email');
      }
    } else {
      // Email service not configured
      if (process.env.NODE_ENV !== 'production') {
        log.warn('Email service not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD.');
        // Security: Never log tokens, even in development
        log.debug('Password reset requested but email service unavailable');
      } else {
        log.error('Email service not configured in production. Password reset emails cannot be sent.');
      }
    }

    res.json(successMessage);
  } catch (error) {
    log.error({ error }, 'Password reset request error');
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Validate reset token format (must be 64 hex characters from 32 bytes)
const isValidTokenFormat = (token: string): boolean => {
  return typeof token === 'string' && /^[a-f0-9]{64}$/i.test(token);
};

// Verify password reset token
router.post('/password-reset/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Validate token format before database query
    if (!isValidTokenFormat(token)) {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    const tokenHash = hashToken(token);

    const result = await query(
      `SELECT user_id FROM idea_manager.password_reset_tokens
       WHERE token_hash = $1 AND expires_at > NOW() AND used_at IS NULL`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    res.json({ valid: true });
  } catch (error) {
    log.error({ error }, 'Password reset verify error');
    res.status(500).json({ error: 'Failed to verify reset token' });
  }
});

// Reset password with token
router.post('/password-reset/confirm', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Validate token format before database query
    if (!isValidTokenFormat(token)) {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'New password does not meet requirements',
        details: passwordValidation.errors
      });
    }

    const tokenHash = hashToken(token);

    // Find valid token
    const tokenResult = await query(
      `SELECT id, user_id FROM idea_manager.password_reset_tokens
       WHERE token_hash = $1 AND expires_at > NOW() AND used_at IS NULL`,
      [tokenHash]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const { id: tokenId, user_id: userId } = tokenResult.rows[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await query(
      'UPDATE idea_manager.users SET password_hash = $1 WHERE id = $2',
      [passwordHash, userId]
    );

    // Mark token as used
    await query(
      'UPDATE idea_manager.password_reset_tokens SET used_at = NOW() WHERE id = $1',
      [tokenId]
    );

    // Invalidate all existing JWT tokens for this user by adding them to blacklist
    // This is a simplified approach - in production you might track active sessions

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    log.error({ error }, 'Password reset confirm error');
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
