import { useState } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import components
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import PropertyCard from './components/PropertyCard';
import SearchFilters from './components/SearchFilters';
import MapView from './components/MapView';
import AuthForms from './components/AuthForms';
import BillingUpgrade from './components/BillingUpgrade';
import MessageThread from './components/MessageThread';
import Footer from './components/Footer';
import PaywallModal from './components/PaywallModal';
import ThemeToggle from './components/ThemeToggle';

// Import pages
import ListingsPage from './pages/listings';
import CreateListingPage from './pages/create-listing';
import ListingDetailPage from './pages/listing-detail';

// Import generated images
import caravanImage from '@assets/generated_images/Modern_caravan_interior_design_28716383.png';
import cabinImage from '@assets/generated_images/Rustic_cabin_exterior_view_d05e4235.png';

function HomePage() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<'grid' | 'map'>('grid');
  
  // Mock data for properties //todo: remove mock functionality
  const properties = [
    {
      id: '1',
      title: 'Luxury Mountain Caravan',
      type: 'caravan' as const,
      location: 'Lake District, UK',
      price: '£85',
      rating: 4.8,
      reviewCount: 24,
      capacity: 4,
      imageUrl: caravanImage,
      amenities: ['Kitchen', 'Wi-Fi', 'Heating', 'Outdoor Space'],
      availableDates: ['2024-03-15', '2024-03-20', '2024-03-25'],
      isFavorite: false,
      latitude: 54.4609,
      longitude: -3.0886,
    },
    {
      id: '2',
      title: 'Cozy Forest Cabin',
      type: 'cabin' as const,
      location: 'Scottish Highlands',
      price: '£120',
      rating: 4.9,
      reviewCount: 18,
      capacity: 6,
      imageUrl: cabinImage,
      amenities: ['Fireplace', 'Hot Tub', 'Kitchen', 'BBQ', 'Parking'],
      availableDates: ['2024-04-01', '2024-04-10'],
      isFavorite: true,
      latitude: 56.8198,
      longitude: -5.1052,
    },
    {
      id: '3',
      title: 'Riverside Retreat Caravan',
      type: 'caravan' as const,
      location: 'Yorkshire Dales, UK',
      price: '£65',
      rating: 4.7,
      reviewCount: 31,
      capacity: 2,
      imageUrl: caravanImage,
      amenities: ['Riverside Location', 'Kitchen', 'Wi-Fi', 'Pet Friendly'],
      availableDates: ['2024-05-01', '2024-05-15'],
      isFavorite: false,
      latitude: 54.2496,
      longitude: -2.2014,
    },
    {
      id: '4',
      title: 'Mountain View Cabin',
      type: 'cabin' as const,
      location: 'Welsh Mountains',
      price: '£95',
      rating: 4.6,
      reviewCount: 12,
      capacity: 8,
      imageUrl: cabinImage,
      amenities: ['Mountain Views', 'Fireplace', 'Kitchen', 'Hiking Trails'],
      availableDates: ['2024-06-01'],
      isFavorite: false,
      latitude: 52.7069,
      longitude: -3.8306,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <Hero />
      
      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/4">
            <SearchFilters
              isOpen={isFiltersOpen}
              onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
            />
          </div>
          
          <div className="lg:w-3/4">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Available Properties</h2>
              <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as 'grid' | 'map')}>
                <TabsList>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                  <TabsTrigger value="map">Map View</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Property Grid */}
            {selectedView === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>
            )}

            {/* Map View */}
            {selectedView === 'map' && (
              <MapView properties={properties} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20">
      <div className="w-full max-w-md mx-auto p-6">
        <AuthForms />
      </div>
    </div>
  );
}

function BillingPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BillingUpgrade />
      </div>
    </div>
  );
}

function MessagesPage() {
  // Mock message data //todo: remove mock functionality
  const mockMessages = [
    {
      id: '1',
      senderId: 'other-user',
      senderName: 'Sarah Johnson',
      content: 'Hi! I\'m interested in swapping with your mountain caravan. My cabin is available for the same dates.',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: true,
    },
    {
      id: '2',
      senderId: 'current-user',
      senderName: 'You',
      content: 'That sounds great! I\'d love to see more photos of your cabin. What amenities does it have?',
      timestamp: '2024-01-15T10:35:00Z',
      isRead: true,
    },
    {
      id: '3',
      senderId: 'other-user',
      senderName: 'Sarah Johnson',
      content: 'It has a full kitchen, fireplace, hot tub, and amazing mountain views. I can send you more photos via email if you\'d like.',
      timestamp: '2024-01-15T10:40:00Z',
      isRead: true,
    },
  ];

  const otherUser = {
    id: 'other-user',
    name: 'Sarah Johnson',
    avatar: undefined,
    isOnline: true,
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full border-l border-r border-border">
        <MessageThread
          threadId="thread-1"
          propertyTitle="Luxury Mountain Caravan"
          propertyImage={caravanImage}
          propertyLocation="Lake District, UK"
          propertyRating={4.8}
          otherUser={otherUser}
          messages={mockMessages}
          currentUserId="current-user"
        />
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/listings" component={ListingsPage} />
      <Route path="/listings/:id" component={ListingDetailPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/billing" component={BillingPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/create-listing" component={CreateListingPage} />
      <Route>
        {/* 404 page */}
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
            <p className="text-muted-foreground mb-6">Page not found</p>
            <Button onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Mock authentication functions //todo: remove mock functionality
  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handleSignup = () => {
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsSubscribed(false);
  };

  const handleUpgrade = () => {
    setIsSubscribed(true);
    setShowPaywall(false);
  };

  const handleSwapRequest = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else if (!isSubscribed) {
      setShowPaywall(true);
    } else {
      console.log('Swap request initiated');
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          {/* Navigation */}
          <Navigation
            isAuthenticated={isAuthenticated}
            isSubscribed={isSubscribed}
            onLogin={() => setShowAuthModal(true)}
            onSignup={() => setShowAuthModal(true)}
          />

          {/* Theme Toggle - Fixed position */}
          <div className="fixed bottom-4 right-4 z-50">
            <ThemeToggle />
          </div>

          {/* Main Content */}
          <main className="flex-1">
            <Router />
          </main>

          {/* Footer */}
          <Footer />

          {/* Modals */}
          <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Join NestSwap</DialogTitle>
              </DialogHeader>
              <AuthForms
                onLogin={handleLogin}
                onRegister={handleLogin}
              />
            </DialogContent>
          </Dialog>

          <PaywallModal
            isOpen={showPaywall}
            onClose={() => setShowPaywall(false)}
            onUpgrade={handleUpgrade}
            feature="request a swap"
          />

          {/* Demo Controls - Fixed position */}
          <div className="fixed bottom-4 left-4 z-50 space-y-2">
            <div className="bg-card border border-card-border rounded-lg p-3 shadow-lg">
              <div className="text-xs font-medium mb-2">Demo Controls:</div>
              <div className="space-y-1 text-xs">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs h-6"
                  onClick={() => setShowPaywall(true)}
                >
                  Show Paywall
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs h-6"
                  onClick={() => setIsAuthenticated(!isAuthenticated)}
                >
                  Toggle Auth ({isAuthenticated ? 'On' : 'Off'})
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;