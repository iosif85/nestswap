import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { body, validationResult } from "express-validator";
import { storage } from "./storage";
import { AuthService, authenticateToken, requireSubscription, requireAdmin, type AuthRequest } from "./auth-middleware";
import { emailService } from "./email-service";
import type { InsertUser } from "@shared/schema";

// Rate limiting configurations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware
  app.use(helmet());
  app.use(generalLimiter);

  // Health check
  app.get('/api/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Authentication routes
  app.post('/api/auth/register', 
    authLimiter,
    [
      body('email').isEmail().normalizeEmail(),
      body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
      body('name').trim().isLength({ min: 1, max: 100 }),
      body('country').trim().isLength({ min: 1, max: 100 }),
      body('phone').optional().isMobilePhone('any'),
    ],
    async (req: express.Request, res: express.Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const { email, password, name, country, phone, bio } = req.body;

        // Check if user already exists
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const passwordHash = await AuthService.hashPassword(password);

        // Create user
        const userData: InsertUser = {
          email,
          name,
          country,
          phone: phone || undefined,
          bio: bio || undefined,
        };

        const user = await storage.createUser({ ...userData, passwordHash });

        // Generate email verification token
        const verificationToken = AuthService.generateEmailVerificationToken(user.id);

        // Send verification email
        await emailService.sendEmailVerification(email, name, verificationToken);

        res.status(201).json({ 
          message: 'User created successfully. Please check your email to verify your account.',
          userId: user.id 
        });
      } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
      }
    }
  );

  app.post('/api/auth/verify', 
    [body('token').notEmpty()],
    async (req: express.Request, res: express.Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ error: 'Token is required' });
        }

        const { token } = req.body;
        const decoded = AuthService.verifyEmailToken(token);

        if (!decoded) {
          return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        const user = await storage.getUserById(decoded.userId);
        if (!user) {
          return res.status(400).json({ error: 'User not found' });
        }

        if (user.isVerified) {
          return res.status(400).json({ error: 'User is already verified' });
        }

        // Verify the user
        await storage.verifyUser(user.id);

        // Send welcome email
        await emailService.sendWelcomeMessage(user.email, user.name);

        res.json({ message: 'Email verified successfully' });
      } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
      }
    }
  );

  app.post('/api/auth/login',
    authLimiter,
    [
      body('email').isEmail().normalizeEmail(),
      body('password').notEmpty(),
    ],
    async (req: express.Request, res: express.Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ error: 'Invalid email or password' });
        }

        const { email, password } = req.body;

        const user = await storage.getUserByEmail(email);
        if (!user) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValidPassword = await AuthService.comparePassword(password, user.passwordHash);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!user.isVerified) {
          return res.status(401).json({ error: 'Please verify your email address before logging in' });
        }

        const token = AuthService.generateToken(user.id);

        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            isVerified: user.isVerified,
            subscriptionStatus: user.subscriptionStatus,
            role: user.role,
          }
        });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
      }
    }
  );

  app.post('/api/auth/request-password-reset',
    authLimiter,
    [body('email').isEmail().normalizeEmail()],
    async (req: express.Request, res: express.Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ error: 'Valid email is required' });
        }

        const { email } = req.body;
        const user = await storage.getUserByEmail(email);

        // Always return success to prevent email enumeration
        if (!user) {
          return res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
        }

        const resetToken = AuthService.generatePasswordResetToken(user.id);
        await emailService.sendPasswordReset(email, user.name, resetToken);

        res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
      } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ error: 'Password reset request failed' });
      }
    }
  );

  app.post('/api/auth/reset-password',
    [
      body('token').notEmpty(),
      body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    ],
    async (req: express.Request, res: express.Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const { token, password } = req.body;
        const decoded = AuthService.verifyPasswordResetToken(token);

        if (!decoded) {
          return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const user = await storage.getUserById(decoded.userId);
        if (!user) {
          return res.status(400).json({ error: 'User not found' });
        }

        const passwordHash = await AuthService.hashPassword(password);
        await storage.updateUser(user.id, { passwordHash });

        res.json({ message: 'Password reset successfully' });
      } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Password reset failed' });
      }
    }
  );

  app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = req.user;
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        country: user.country,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        subscriptionStatus: user.subscriptionStatus,
        isSubscriber: user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing',
        role: user.role,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Failed to get user data' });
    }
  });

  // User profile routes
  app.put('/api/users/me', 
    authenticateToken,
    [
      body('name').optional().trim().isLength({ min: 1, max: 100 }),
      body('phone').optional().isMobilePhone('any'),
      body('country').optional().trim().isLength({ min: 1, max: 100 }),
      body('bio').optional().isLength({ max: 500 }),
    ],
    async (req: AuthRequest, res: express.Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        if (!req.user) {
          return res.status(401).json({ error: 'Not authenticated' });
        }

        const { name, phone, country, bio, avatarUrl } = req.body;
        const updates: any = {};

        if (name !== undefined) updates.name = name;
        if (phone !== undefined) updates.phone = phone;
        if (country !== undefined) updates.country = country;
        if (bio !== undefined) updates.bio = bio;
        if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

        const updatedUser = await storage.updateUser(req.user.id, updates);

        res.json({
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone,
          country: updatedUser.country,
          bio: updatedUser.bio,
          avatarUrl: updatedUser.avatarUrl,
          isVerified: updatedUser.isVerified,
          subscriptionStatus: updatedUser.subscriptionStatus,
          role: updatedUser.role,
        });
      } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
      }
    }
  );

  // Placeholder routes for other features
  app.get('/api/listings', async (req: express.Request, res: express.Response) => {
    // TODO: Implement listings search
    res.json({ message: 'Listings endpoint - to be implemented' });
  });

  app.post('/api/listings', authenticateToken, async (req: AuthRequest, res) => {
    // TODO: Implement create listing
    res.json({ message: 'Create listing endpoint - to be implemented' });
  });

  app.post('/api/swaps', authenticateToken, requireSubscription, async (req: AuthRequest, res) => {
    // TODO: Implement swap creation (subscription required)
    res.json({ message: 'Create swap endpoint - to be implemented (requires subscription)' });
  });

  app.get('/api/messages', authenticateToken, async (req: AuthRequest, res) => {
    // TODO: Implement messages
    res.json({ message: 'Messages endpoint - to be implemented' });
  });

  // Admin routes
  app.get('/api/admin/users', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    // TODO: Implement admin user list
    res.json({ message: 'Admin users endpoint - to be implemented' });
  });

  const httpServer = createServer(app);
  return httpServer;
}