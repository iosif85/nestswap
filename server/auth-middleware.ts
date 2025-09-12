import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import type { UserWithSubscription } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'temp-jwt-secret-for-development-only';
const JWT_EXPIRES_IN = '7d';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: Using temporary JWT_SECRET for development. Set JWT_SECRET environment variable for production.');
}

export interface AuthRequest extends Request {
  user?: UserWithSubscription;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  static verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded;
    } catch (error) {
      return null;
    }
  }

  static generateEmailVerificationToken(userId: string): string {
    return jwt.sign({ userId, type: 'email_verification' }, JWT_SECRET, { expiresIn: '24h' });
  }

  static generatePasswordResetToken(userId: string): string {
    return jwt.sign({ userId, type: 'password_reset' }, JWT_SECRET, { expiresIn: '1h' });
  }

  static verifyEmailToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
      if (decoded.type !== 'email_verification') return null;
      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }

  static verifyPasswordResetToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
      if (decoded.type !== 'password_reset') return null;
      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = AuthService.verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  try {
    const user = await storage.getUserById(decoded.userId);
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication error' });
  }
};

export const requireSubscription = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.isSubscriber) {
    return res.status(402).json({ 
      error: 'Subscription required', 
      code: 'SUB_REQUIRED',
      message: 'This feature requires an active NestSwap membership' 
    });
  }

  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};