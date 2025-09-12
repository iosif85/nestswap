import { useState } from 'react';
import { Switch, Route } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare } from 'lucide-react';

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
import SubscribePage from './pages/subscribe';
import ListingDetailPage from './pages/listing-detail';

// Import shared types
import { User, Message, MessageWithSender, MessageThreadSummary } from '@shared/schema';

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
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get user info to know current user ID
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });

  // Get message threads
  const { data: threads = [], isLoading: threadsLoading } = useQuery<MessageThreadSummary[]>({
    queryKey: ['/api/messages/threads'],
    enabled: !!user,
  });

  // Get messages for selected thread
  const { data: messages = [], isLoading: messagesLoading } = useQuery<MessageWithSender[]>({
    queryKey: ['/api/messages/thread', selectedThreadId],
    enabled: !!selectedThreadId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation<Message, Error, { threadId: string; receiverId: string; body: string }>({
    mutationFn: async (vars) => {
      return apiRequest<Message>('POST', '/api/messages', vars);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/thread', selectedThreadId] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/threads'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    },
  });

  const handleSendMessage = async (content: string) => {
    if (!selectedThreadId || !user) return;
    
    const currentThread = threads.find((t) => t.threadId === selectedThreadId);
    if (!currentThread) return;

    try {
      await sendMessageMutation.mutateAsync({
        threadId: selectedThreadId,
        receiverId: currentThread.otherUser.id,
        body: content,
      });
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  if (userLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in</h2>
          <p className="text-muted-foreground mb-6">You need to be logged in to view messages</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Thread List Sidebar */}
      <div className="w-80 border-r border-border bg-muted/30">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-semibold">Messages</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {threadsLoading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading conversations...</p>
            </div>
          ) : threads.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">No conversations yet</p>
              <p className="text-muted-foreground text-xs mt-2">Start messaging property owners from listings</p>
            </div>
          ) : (
            threads.map((thread: any) => (
              <div
                key={thread.threadId}
                className={`p-4 border-b border-border cursor-pointer hover-elevate ${
                  selectedThreadId === thread.threadId ? 'bg-muted' : ''
                }`}
                onClick={() => setSelectedThreadId(thread.threadId)}
                data-testid={`thread-${thread.threadId}`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={thread.otherUser.avatarUrl} />
                    <AvatarFallback>{thread.otherUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{thread.otherUser.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(thread.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {thread.lastMessage.body}
                    </p>
                    {thread.unreadCount > 0 && (
                      <Badge variant="default" className="mt-2 text-xs">
                        {thread.unreadCount} new
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Thread View */}
      <div className="flex-1 flex flex-col">
        {!selectedThreadId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
              <p className="text-muted-foreground">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        ) : messagesLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          </div>
        ) : (
          (() => {
            const currentThread = threads.find((t) => t.threadId === selectedThreadId);
            if (!currentThread) return null;

            // Transform messages to match MessageThread component format
            const transformedMessages = messages.map((msg: any) => ({
              id: msg.id,
              senderId: msg.senderId,
              senderName: msg.sender?.name || 'Unknown',
              senderAvatar: msg.sender?.avatarUrl,
              content: msg.body,
              timestamp: msg.createdAt,
              isRead: !!msg.readAt,
            }));

            return (
              <MessageThread
                threadId={selectedThreadId}
                otherUser={{
                  id: currentThread.otherUser.id,
                  name: currentThread.otherUser.name,
                  avatar: currentThread.otherUser.avatarUrl,
                  isOnline: false, // TODO: Implement online status
                }}
                messages={transformedMessages}
                currentUserId={user.id}
                onSendMessage={handleSendMessage}
              />
            );
          })()
        )}
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
      <Route path="/subscribe" component={SubscribePage} />
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