import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Check, X, CreditCard, MessageSquare, Repeat, Shield } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
  feature?: string;
}

export default function PaywallModal({
  isOpen,
  onClose,
  onUpgrade = () => console.log('Upgrade clicked'),
  feature = 'swap request'
}: PaywallModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onUpgrade();
      onClose();
    }, 1000);
  };

  const membershipFeatures = [
    {
      icon: <Repeat className="h-5 w-5" />,
      title: 'Unlimited Swap Requests',
      description: 'Request as many property swaps as you want while active',
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: 'Direct Messaging',
      description: 'Chat directly with property owners in-app',
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Verified Community',
      description: 'Access to verified properties and trusted members',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Upgrade to Continue
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-paywall"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feature Context */}
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              To {feature}, you need a <strong>NestSwap Membership</strong>
            </p>
          </div>

          {/* Membership Benefits */}
          <div className="space-y-4">
            <h3 className="font-medium text-center">Membership includes:</h3>
            <div className="space-y-3">
              {membershipFeatures.map((feature) => (
                <div key={feature.title} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5 text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{feature.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {feature.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center p-4 border border-primary/20 rounded-lg bg-primary/5">
            <div className="text-2xl font-bold">
              £10
              <span className="text-lg font-normal text-muted-foreground">/year</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Cancel anytime • Secure payments
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={handleUpgrade}
              disabled={isLoading}
              data-testid="button-upgrade-paywall"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isLoading ? 'Processing...' : 'Upgrade for £10/year'}
            </Button>
            
            <Button
              variant="ghost"
              className="w-full"
              onClick={onClose}
              data-testid="button-not-now"
            >
              Not now
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Check className="h-3 w-3" />
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center space-x-1">
              <Check className="h-3 w-3" />
              <span>Secure billing</span>
            </div>
            <div className="flex items-center space-x-1">
              <Check className="h-3 w-3" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}