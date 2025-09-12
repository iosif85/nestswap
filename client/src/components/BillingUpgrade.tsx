import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, MessageSquare, Repeat, Shield, CreditCard } from 'lucide-react';

interface BillingUpgradeProps {
  onUpgrade?: () => void;
  onManageBilling?: () => void;
  currentPlan?: 'free' | 'premium';
}

export default function BillingUpgrade({
  onUpgrade = () => console.log('Upgrade clicked'),
  onManageBilling = () => console.log('Manage billing clicked'),
  currentPlan = 'free'
}: BillingUpgradeProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onUpgrade();
    }, 1000);
  };

  const features = [
    {
      icon: <Repeat className="h-5 w-5" />,
      title: 'Unlimited Swap Requests',
      description: 'Request as many property swaps as you want',
      free: false,
      premium: true,
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: 'Direct Messaging',
      description: 'Chat directly with property owners',
      free: false,
      premium: true,
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Verified Listings',
      description: 'Access to verified properties only',
      free: false,
      premium: true,
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: 'Priority Support',
      description: '24/7 customer support',
      free: false,
      premium: true,
    },
  ];

  const freeFeatures = [
    'Browse all properties',
    'Save favorites',
    'Basic profile',
    'Read reviews',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground font-['Poppins']">
          Unlock Swaps with NestSwap Membership
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Request and confirm property swaps, access owner messaging, and join a trusted community—for just £10/year.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Free</CardTitle>
              {currentPlan === 'free' && (
                <Badge variant="secondary">Current Plan</Badge>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">£0</div>
              <div className="text-muted-foreground">Forever free</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              variant="outline" 
              className="w-full" 
              disabled={currentPlan === 'free'}
              data-testid="button-free-plan"
            >
              {currentPlan === 'free' ? 'Current Plan' : 'Downgrade'}
            </Button>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className="relative border-primary shadow-lg">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary text-white">Most Popular</Badge>
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Premium</CardTitle>
              {currentPlan === 'premium' && (
                <Badge variant="default">Current Plan</Badge>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">
                £10
                <span className="text-lg font-normal text-muted-foreground">/year</span>
              </div>
              <div className="text-muted-foreground">Everything in Free, plus:</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature.title} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5 text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{feature.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {feature.description}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            {currentPlan === 'free' ? (
              <Button 
                className="w-full" 
                onClick={handleUpgrade}
                disabled={isLoading}
                data-testid="button-upgrade"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isLoading ? 'Processing...' : 'Upgrade for £10/year'}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={onManageBilling}
                data-testid="button-manage-billing"
              >
                Manage Billing
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">Frequently Asked Questions</h2>
        <div className="grid gap-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until your current billing period ends.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Is my payment secure?</h3>
              <p className="text-muted-foreground text-sm">
                All payments are processed securely through Stripe. We never store your payment information on our servers.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">What happens if I don't renew?</h3>
              <p className="text-muted-foreground text-sm">
                Your account will automatically revert to the free plan. You'll still be able to browse properties and use basic features.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Small Print */}
      <div className="text-center text-xs text-muted-foreground space-y-1 border-t pt-6">
        <p>Auto-renewal annually • Cancel anytime • Secure Stripe payments • No hidden fees</p>
        <p>By upgrading, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  );
}