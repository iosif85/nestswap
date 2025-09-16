import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Menu, X, User, MessageCircle, Heart, ArrowLeftRight } from 'lucide-react';
import NotificationDropdown from '@/components/NotificationDropdown';

interface NavigationProps {
  isAuthenticated?: boolean;
  isSubscribed?: boolean;
  onLogin?: () => void;
  onSignup?: () => void;
  onSearch?: (query: string) => void;
}

export default function Navigation({ 
  isAuthenticated = false, 
  isSubscribed = false,
  onLogin = () => console.log('Login clicked'),
  onSignup = () => console.log('Signup clicked'),
  onSearch = (query) => console.log('Search:', query)
}: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary font-['Poppins']">
              NestSwap
            </h1>
            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
              BETA
            </span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search caravans, cabins, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
                data-testid="input-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NotificationDropdown />
                <Button variant="ghost" size="icon" data-testid="button-favorites">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setLocation('/messages')}
                  data-testid="button-messages"
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setLocation('/swap-requests')}
                  data-testid="button-swap-requests"
                >
                  <ArrowLeftRight className="h-5 w-5" />
                </Button>
                {!isSubscribed && (
                  <Button size="sm" data-testid="button-upgrade">
                    Upgrade £10/year
                  </Button>
                )}
                <Button variant="ghost" size="icon" data-testid="button-profile">
                  <User className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={onLogin} data-testid="button-login">
                  Log in
                </Button>
                <Button onClick={onSignup} data-testid="button-signup">
                  Sign up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-menu-toggle"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="search"
              placeholder="Search caravans, cabins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Favorites
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Messages
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                {!isSubscribed && (
                  <Button className="w-full">
                    Upgrade £10/year
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full" onClick={onLogin}>
                  Log in
                </Button>
                <Button className="w-full" onClick={onSignup}>
                  Sign up
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}