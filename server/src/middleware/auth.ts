import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from '../database';

export interface AuthRequest extends Request {
  userId?: string;
  token?: string;
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
};

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Try to get token from HttpOnly cookie first, then fall back to Authorization header
  let token: string | undefined;

  // Check HttpOnly cookie (more secure)
  if (req.cookies?.authToken) {
    token = req.cookies.authToken;
  }
  // Fall back to Authorization header for backward compatibility
  else {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; exp: number };
    req.userId = decoded.userId;
    req.token = token;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export { getJwtSecret };
