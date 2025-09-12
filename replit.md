# Overview

NestSwap is a caravan and cabin exchange platform that enables users to swap their properties for unique getaways. The platform operates as a property exchange marketplace where owners list their caravans, cabins, motorhomes, and other outdoor accommodations, allowing them to discover and exchange stays with other property owners.

The application follows a freemium business model with subscription-based premium features including unlimited swap requests, direct messaging, and access to verified listings. Users can browse properties on an interactive map, filter by various criteria, and communicate directly with property owners to arrange swaps.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Full-Stack Architecture
The application uses a monolithic architecture with a clear separation between frontend and backend, both housed in a single repository for simplified deployment on Replit. The frontend is built with React and Vite for fast development, while the backend uses Node.js with Express for API services.

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for build tooling
- **Routing**: Wouter for client-side navigation
- **State Management**: React Query (TanStack Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system following Airbnb-inspired patterns
- **Maps**: Leaflet with OpenStreetMap for interactive property mapping
- **Forms**: React Hook Form with Zod validation

The frontend follows a component-based architecture with reusable UI components, custom hooks for common functionality, and page-level components for routing. The design system emphasizes nature-themed colors (mountain green, sky blue, earthy tones) with Inter and Poppins fonts.

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT tokens with HttpOnly cookies and CSRF protection
- **API Design**: RESTful API with consistent error handling and validation
- **Security**: bcrypt for password hashing, rate limiting, CORS, and input sanitization
- **Email Service**: Nodemailer with SMTP support and console fallback

The backend implements a layered architecture with separate modules for authentication, storage, email services, and route handling. Authentication middleware provides user verification and subscription checking across protected routes.

## Data Storage
- **Database**: PostgreSQL with Drizzle migrations
- **Development**: Configured for Neon Database (PostgreSQL-compatible)
- **Schema Design**: Normalized relational design with tables for users, listings, photos, availability, messages, and swaps
- **Type Safety**: Generated TypeScript types from database schema using Drizzle

Key entities include users with subscription data, property listings with photos and availability windows, messaging threads between users, and swap requests with status tracking.

## Authentication & Authorization
- **User Authentication**: JWT-based with secure HttpOnly cookies
- **Password Security**: bcrypt hashing with salt rounds
- **Email Verification**: JWT tokens for email confirmation
- **Session Management**: Persistent login with token refresh capability
- **Role-Based Access**: User roles (user/admin) with different permission levels
- **Subscription Gates**: Premium features locked behind subscription status

# External Dependencies

## Payment Processing
- **Stripe Integration**: Subscription management with Stripe Checkout and Billing Portal
- **Webhook Handling**: Subscription status updates via Stripe webhooks
- **Development Mode**: Mock subscription activation for testing environments

## Email Services
- **SMTP Provider**: Configurable SMTP settings for transactional emails
- **Email Templates**: HTML email templates for verification, password reset, and notifications
- **Development Fallback**: Console logging when SMTP is not configured

## Map Services
- **Leaflet**: Open-source mapping library for interactive maps
- **OpenStreetMap**: Free map tiles and geocoding services
- **Location Services**: Property coordinate storage and search radius functionality

## UI Component Library
- **Radix UI**: Headless UI components for accessibility and functionality
- **shadcn/ui**: Pre-built styled components following design system
- **Lucide Icons**: Consistent icon library throughout the application

## Development & Deployment
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across frontend and backend
- **Replit**: Single-click deployment with integrated hosting
- **Environment Variables**: Configuration for database, SMTP, Stripe, and JWT secrets