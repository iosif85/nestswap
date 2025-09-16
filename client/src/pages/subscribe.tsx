import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Check, Crown, Zap, Shield, Calendar, MessageCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Type definition for subscription data
type SubscriptionData = {
  isSubscribed?: boolean;
  subscriptionStatus?: string;
  subscriptionCurrentPeriodEnd?: string;
};

export default function SubscribePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get current subscription status
  const { data: subscriptionData, isLoading } = useQuery<SubscriptionData>({
    queryKey: ['/api/subscription-status'],
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/create-subscription', {});
    },
    onSuccess: (data: any) => {
      if (data?.mockMode) {
        toast({
          title: 'Success!',
          description: 'Your NestSwap membership is now active! (Development mode)',
        });
      } else {
        toast({
          title: 'Success!',
          description: 'Your NestSwap membership is now active!',
        });
      }
      // Refresh subscription status
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create subscription',
        variant: 'destructive',
      });
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/cancel-subscription', {});
    },
    onSuccess: () => {
      toast({
        title: 'Subscription Canceled',
        description: 'Your subscription has been canceled successfully.',
      });
      // Refresh subscription status
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel subscription',
        variant: 'destructive',
      });
    },
  });

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      await createSubscriptionMutation.mutateAsync();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      await cancelSubscriptionMutation.mutateAsync();
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'Unlimited Swap Requests',
      description: 'Send as many swap requests as you want - no monthly limits',
    },
    {
      icon: Crown,
      title: 'Priority Listing Placement',
      description: 'Your listings appear higher in search results',
    },
    {
      icon: Search,
      title: 'Advanced Search Filters',
      description: 'Access powerful filters to find your perfect swap match',
    },
    {
      icon: MessageCircle,
      title: 'Direct Messaging',
      description: 'Chat directly with property owners through our secure messaging system',
    },
    {
      icon: Calendar,
      title: 'Calendar Integration',
      description: 'Sync your availability with popular calendar apps',
    },
    {
      icon: Shield,
      title: 'Priority Support',
      description: 'Get faster support response times when you need help',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const isSubscribed = subscriptionData?.isSubscribed || false;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">NestSwap Membership</h1>
            <p className="text-muted-foreground">
              Unlock the full potential of caravan and cabin swapping
            </p>
          </div>
        </div>

        {/* Current Status */}
        {isSubscribed && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-800 dark:text-green-200">
                  Active Membership
                </CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {subscriptionData?.subscriptionStatus || 'active'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 dark:text-green-300 mb-2">
                    You're enjoying all premium NestSwap features!
                  </p>
                  {subscriptionData?.subscriptionCurrentPeriodEnd && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Membership renews on {new Date(subscriptionData.subscriptionCurrentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={cancelSubscriptionMutation.isPending}
                  data-testid="button-cancel-subscription"
                >
                  {cancelSubscriptionMutation.isPending ? 'Canceling...' : 'Cancel Subscription'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Card */}
        {!isSubscribed && (
          <Card className="mb-8 border-primary">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold mb-2">£10 / year</CardTitle>
              <p className="text-muted-foreground">
                Just 83p per month - unlock unlimited swapping potential
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                size="lg"
                onClick={handleSubscribe}
                disabled={isProcessing || createSubscriptionMutation.isPending}
                className="w-full max-w-md"
                data-testid="button-subscribe"
              >
                {isProcessing || createSubscriptionMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Start Your Membership
                  </>
                )}
              </Button>
              
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>✓ Cancel anytime</p>
                <p>✓ Secure payment processing</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Everything you need for successful swapping
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  {isSubscribed && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your NestSwap membership at any time. You'll continue to have access to premium features until the end of your current billing period.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">What happens to my swap requests if I cancel?</h3>
              <p className="text-sm text-muted-foreground">
                Any ongoing swap arrangements will continue as normal. However, you won't be able to send new swap requests without a membership.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Is my payment information secure?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely. We use Stripe, a leading payment processor trusted by millions of businesses worldwide. Your payment details are encrypted and never stored on our servers.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-sm text-muted-foreground">
                Get immediate access to all premium features for just £10/year. You can cancel your subscription anytime from your account settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}