# NestSwap Design Guidelines

## Design Approach: Reference-Based (Airbnb-Inspired)
Following the outdoor adventure and property exchange nature of NestSwap, we'll draw inspiration from Airbnb's proven patterns while incorporating nature-themed elements for the caravan/cabin market.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Mountain Green: 150 40% 35% (primary brand color)
- Forest Deep: 160 45% 25% (darker variant)
- Sky Blue: 200 60% 55% (accent for interactive elements)

**Supporting Colors:**
- Warm White: 45 20% 98% (backgrounds)
- Stone Gray: 210 8% 45% (text secondary)
- Charcoal: 220 15% 20% (text primary)
- Success Green: 140 50% 45% (confirmations)
- Warning Orange: 25 85% 55% (alerts)

### Typography
**Primary:** Inter (Google Fonts) - clean, modern readability
**Accent:** Poppins (Google Fonts) - headings and CTAs
- Body text: Inter 16px regular
- Headings: Poppins 24px-48px semibold
- Buttons: Inter 16px medium

### Layout System
**Spacing Units:** Tailwind classes using 2, 4, 6, 8, 12, 16, 24
- Micro spacing: p-2, m-2 (8px)
- Standard spacing: p-4, m-4 (16px)
- Section spacing: p-8, m-8 (32px)
- Large spacing: p-16, m-16 (64px)

### Component Library

**Navigation:** 
- Clean header with logo, search, and user menu
- Sticky navigation on scroll
- Breadcrumb navigation for deep pages

**Property Cards:**
- Image carousel with heart favorite icon
- Property type badges (Caravan/Cabin)
- Star ratings and location
- Availability indicators

**Forms:**
- Rounded input fields with subtle borders
- Primary green CTAs with white text
- Multi-step forms for listing creation
- File upload areas with drag-and-drop

**Interactive Map:**
- Leaflet integration with custom green markers
- Clustering for dense areas
- Property preview cards on hover

**Messaging Interface:**
- Chat bubbles with mountain green for user messages
- Clean conversation list sidebar
- Real-time indicators

### Visual Treatments

**Photography Style:**
- High-quality outdoor lifestyle imagery
- Warm, natural lighting
- People enjoying cabin/caravan experiences

**Gradients:**
- Subtle hero overlays: 150 40% 35% to 160 45% 25%
- Button hover states: 200 60% 55% to 180 55% 50%

**Cards & Containers:**
- Subtle shadows: shadow-sm to shadow-md
- Rounded corners: rounded-lg (8px)
- Clean white backgrounds with thin borders

### Images
**Hero Section:** Large landscape image of caravans/cabins in nature (mountains, forest, lakeside)
**Property Listings:** High-quality interior/exterior photos
**Feature Sections:** Lifestyle images showing families enjoying outdoor experiences
**Testimonials:** User photos with their properties

### Subscription UI
- Clear pricing display with green CTAs
- Feature comparison tables
- Paywall overlays with blurred backgrounds
- Billing status indicators in user dashboard

### Responsive Behavior
- Mobile-first approach
- Collapsible navigation menu
- Stacked property cards on mobile
- Touch-friendly interactive elements
- Optimized map interactions for mobile

This design creates a trustworthy, outdoor-focused platform that encourages property sharing while maintaining the professional polish users expect from modern marketplaces.