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

  // Listings routes
  app.get('/api/listings', async (req: express.Request, res: express.Response) => {
    try {
      const { 
        lat, 
        lng, 
        radius = 50, 
        type, 
        guests, 
        bedrooms, 
        bathrooms,
        amenities,
        minPrice,
        maxPrice,
        sortBy = 'newest',
        page = 1,
        limit = 20 
      } = req.query;

      const filters: any = {};
      
      if (type) filters.type = type;
      if (guests) filters.maxGuests = { gte: parseInt(guests as string) };
      if (bedrooms) filters.bedrooms = { gte: parseInt(bedrooms as string) };
      if (bathrooms) filters.bathrooms = { gte: parseInt(bathrooms as string) };
      if (minPrice) filters.pricePerNight = { gte: parseInt(minPrice as string) };
      if (maxPrice) filters.pricePerNight = { lte: parseInt(maxPrice as string) };

      let coordinates: { lat: number; lng: number } | undefined;
      if (lat && lng) {
        coordinates = {
          lat: parseFloat(lat as string),
          lng: parseFloat(lng as string)
        };
      }

      const listings = await storage.searchListings(
        filters,
        coordinates,
        parseInt(radius as string),
        sortBy as string,
        parseInt(page as string),
        parseInt(limit as string),
        amenities ? (amenities as string).split(',') : undefined
      );

      res.json(listings);
    } catch (error) {
      console.error('Search listings error:', error);
      res.status(500).json({ error: 'Failed to search listings' });
    }
  });

  app.get('/api/listings/:id', async (req: express.Request, res: express.Response) => {
    try {
      const listing = await storage.getListingById(req.params.id);
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      res.json(listing);
    } catch (error) {
      console.error('Get listing error:', error);
      res.status(500).json({ error: 'Failed to get listing' });
    }
  });

  app.post('/api/listings', 
    authenticateToken,
    [
      body('title').trim().isLength({ min: 5, max: 100 }),
      body('description').trim().isLength({ min: 20, max: 2000 }),
      body('type').isIn(['caravan', 'cabin', 'motorhome', 'tent', 'other']),
      body('address').trim().isLength({ min: 5, max: 200 }),
      body('city').optional().trim().isLength({ min: 1, max: 100 }),
      body('country').optional().trim().isLength({ min: 1, max: 100 }),
      body('latitude').isFloat({ min: -90, max: 90 }),
      body('longitude').isFloat({ min: -180, max: 180 }),
      body('maxGuests').isInt({ min: 1, max: 50 }),
      body('bedrooms').isInt({ min: 0, max: 20 }),
      body('bathrooms').isInt({ min: 0, max: 10 }),
      body('pricePerNight').isFloat({ min: 0 }),
      body('amenities').optional().isArray(),
      body('photos').optional().isArray(),
      body('houseRules').optional().trim().isLength({ max: 1000 }),
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

        const {
          title,
          description,
          type,
          address,
          city,
          country,
          latitude,
          longitude,
          maxGuests,
          bedrooms,
          bathrooms,
          pricePerNight,
          amenities,
          photos,
          houseRules
        } = req.body;

        const listingData = {
          ownerId: req.user.id,
          title,
          description,
          type,
          address,
          city: city || address.split(',')[1]?.trim() || 'Unknown',
          country: country || 'UK',
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          maxGuests,
          bedrooms,
          bathrooms,
          pricePerNight: pricePerNight.toString(),
          amenities: amenities || [],
          houseRules: houseRules || null,
        };

        const listing = await storage.createListing(listingData);

        // Add photos if provided
        if (photos && photos.length > 0) {
          await storage.addPhotosToListing(listing.id, photos.map((photo: any, index: number) => ({
            filename: photo.filename || `photo-${index}.jpg`,
            url: photo.url,
            position: index,
          })));
        }

        const listingWithPhotos = await storage.getListingById(listing.id);
        res.status(201).json(listingWithPhotos);
      } catch (error) {
        console.error('Create listing error:', error);
        res.status(500).json({ error: 'Failed to create listing' });
      }
    }
  );

  app.put('/api/listings/:id',
    authenticateToken,
    [
      body('title').optional().trim().isLength({ min: 5, max: 100 }),
      body('description').optional().trim().isLength({ min: 20, max: 2000 }),
      body('type').optional().isIn(['caravan', 'cabin', 'motorhome', 'tent', 'other']),
      body('address').optional().trim().isLength({ min: 5, max: 200 }),
      body('latitude').optional().isFloat({ min: -90, max: 90 }),
      body('longitude').optional().isFloat({ min: -180, max: 180 }),
      body('maxGuests').optional().isInt({ min: 1, max: 50 }),
      body('bedrooms').optional().isInt({ min: 0, max: 20 }),
      body('bathrooms').optional().isInt({ min: 0, max: 10 }),
      body('pricePerNight').optional().isFloat({ min: 0 }),
      body('amenities').optional().isArray(),
      body('isActive').optional().isBoolean(),
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

        const listing = await storage.getListingById(req.params.id);
        if (!listing) {
          return res.status(404).json({ error: 'Listing not found' });
        }

        if (listing.ownerId !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Not authorized to edit this listing' });
        }

        const updates: any = {};
        const allowedFields = [
          'title', 'description', 'type', 'address', 'city', 'country', 'latitude', 'longitude',
          'maxGuests', 'bedrooms', 'bathrooms', 'pricePerNight', 'amenities', 'houseRules', 'isActive'
        ];

        allowedFields.forEach(field => {
          if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
          }
        });

        const updatedListing = await storage.updateListing(req.params.id, updates);
        res.json(updatedListing);
      } catch (error) {
        console.error('Update listing error:', error);
        res.status(500).json({ error: 'Failed to update listing' });
      }
    }
  );

  app.delete('/api/listings/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const listing = await storage.getListingById(req.params.id);
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      if (listing.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this listing' });
      }

      await storage.deleteListing(req.params.id);
      res.json({ message: 'Listing deleted successfully' });
    } catch (error) {
      console.error('Delete listing error:', error);
      res.status(500).json({ error: 'Failed to delete listing' });
    }
  });

  // Get user's own listings
  app.get('/api/users/me/listings', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const listings = await storage.getListingsByOwner(req.user.id);
      res.json(listings);
    } catch (error) {
      console.error('Get user listings error:', error);
      res.status(500).json({ error: 'Failed to get user listings' });
    }
  });

  // Photo management routes
  app.post('/api/listings/:id/photos',
    authenticateToken,
    [
      body('url').isURL(),
      body('caption').optional().isLength({ max: 200 }),
      body('sortOrder').optional().isInt({ min: 0 }),
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

        const listing = await storage.getListingById(req.params.id);
        if (!listing) {
          return res.status(404).json({ error: 'Listing not found' });
        }

        if (listing.ownerId !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Not authorized to manage photos for this listing' });
        }

        const { url, caption, sortOrder } = req.body;
        const photo = await storage.addPhoto({
          listingId: req.params.id,
          url,
          caption: caption || null,
          sortOrder: sortOrder || 0,
        });

        res.status(201).json(photo);
      } catch (error) {
        console.error('Add photo error:', error);
        res.status(500).json({ error: 'Failed to add photo' });
      }
    }
  );

  app.delete('/api/photos/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const photo = await storage.getPhotoById(req.params.id);
      if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
      }

      const listing = await storage.getListingById(photo.listingId);
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      if (listing.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this photo' });
      }

      await storage.deletePhoto(req.params.id);
      res.json({ message: 'Photo deleted successfully' });
    } catch (error) {
      console.error('Delete photo error:', error);
      res.status(500).json({ error: 'Failed to delete photo' });
    }
  });

  // Availability management routes
  app.get('/api/listings/:id/availability', async (req: express.Request, res: express.Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const availability = await storage.getAvailability(
        req.params.id,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(availability);
    } catch (error) {
      console.error('Get availability error:', error);
      res.status(500).json({ error: 'Failed to get availability' });
    }
  });

  app.post('/api/listings/:id/availability',
    authenticateToken,
    [
      body('date').isDate(),
      body('isAvailable').isBoolean(),
      body('priceOverride').optional().isFloat({ min: 0 }),
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

        const listing = await storage.getListingById(req.params.id);
        if (!listing) {
          return res.status(404).json({ error: 'Listing not found' });
        }

        if (listing.ownerId !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Not authorized to manage availability for this listing' });
        }

        const { date, isAvailable, priceOverride } = req.body;
        const availability = await storage.setAvailability({
          listingId: req.params.id,
          date: new Date(date),
          isAvailable,
          priceOverride: priceOverride || null,
        });

        res.status(201).json(availability);
      } catch (error) {
        console.error('Set availability error:', error);
        res.status(500).json({ error: 'Failed to set availability' });
      }
    }
  );

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