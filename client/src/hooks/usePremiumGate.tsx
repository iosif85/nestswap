import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

interface PremiumGateOptions {
  feature?: string;
  showPaywall?: () => void;
  showAuth?: () => void;
}

export function usePremiumGate() {
  const { isAuthenticated, isSubscriber } = useUser();
  const { toast } = useToast();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const checkAccess = (options: PremiumGateOptions = {}) => {
    const { feature = 'this feature', showPaywall: customPaywall, showAuth: customAuth } = options;

    // Check authentication first
    if (!isAuthenticated) {
      if (customAuth) {
        customAuth();
      } else {
        setShowAuth(true);
        toast({
          title: 'Login Required',
          description: `Please log in to access ${feature}.`,
          variant: 'destructive',
        });
      }
      return false;
    }

    // Check subscription status
    if (!isSubscriber) {
      if (customPaywall) {
        customPaywall();
      } else {
        setShowPaywall(true);
        toast({
          title: 'Premium Feature',
          description: `${feature} requires a NestSwap Premium membership.`,
          variant: 'destructive',
        });
      }
      return false;
    }

    return true;
  };

  const requireAuth = (options: Omit<PremiumGateOptions, 'showPaywall'> = {}) => {
    const { feature = 'this feature', showAuth: customAuth } = options;

    if (!isAuthenticated) {
      if (customAuth) {
        customAuth();
      } else {
        setShowAuth(true);
        toast({
          title: 'Login Required',
          description: `Please log in to access ${feature}.`,
          variant: 'destructive',
        });
      }
      return false;
    }

    return true;
  };

  const requirePremium = (options: Omit<PremiumGateOptions, 'showAuth'> = {}) => {
    const { feature = 'this feature', showPaywall: customPaywall } = options;

    if (!checkAccess({ feature, showPaywall: customPaywall })) {
      return false;
    }

    return true;
  };

  return {
    isAuthenticated,
    isSubscriber,
    checkAccess,
    requireAuth,
    requirePremium,
    showPaywall,
    setShowPaywall,
    showAuth,
    setShowAuth,
  };
}