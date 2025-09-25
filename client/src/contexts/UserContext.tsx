import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isVerified: boolean;
  subscriptionStatus: string;
  isSubscriber: boolean;
  role: string;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isSubscriber: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user has auth token on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  // Fetch user data when authenticated
  const { data: userData, isLoading, refetch } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update user state when data changes
  useEffect(() => {
    if (userData) {
      setUser(userData);
    } else if (!isLoading && isAuthenticated) {
      // If no user data but we think we're authenticated, clear auth
      handleLogout();
    }
  }, [userData, isLoading, isAuthenticated]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      
      if (response && response.token) {
        localStorage.setItem('authToken', response.token);
        setIsAuthenticated(true);
        setUser(response.user);
        refetch(); // Fetch latest user data
      } else {
        throw new Error('Login failed - no token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = () => {
    if (isAuthenticated) {
      refetch();
    }
  };

  const value: UserContextType = {
    user,
    isAuthenticated: isAuthenticated && !!user,
    isSubscriber: user?.isSubscriber || false,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    refreshUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Note: usePremiumGate is now in @/hooks/usePremiumGate.tsx to avoid duplication