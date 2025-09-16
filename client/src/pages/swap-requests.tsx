import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar, Clock, Check, X, MessageCircle, ArrowLeftRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { SwapWithDetails } from '@shared/schema';

function SwapRequestCard({ swap, isIncoming }: { swap: SwapWithDetails; isIncoming: boolean }) {
  const { toast } = useToast();

  const updateSwapMutation = useMutation({
    mutationFn: async (status: 'accepted' | 'declined' | 'cancelled') => {
      return apiRequest('PATCH', `/api/swaps/${swap.id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/swaps'] });
      toast({
        title: 'Request Updated',
        description: 'The swap request has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update swap request',
        variant: 'destructive',
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      accepted: 'default',
      declined: 'destructive',
      cancelled: 'outline',
    } as const;

    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      declined: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200',
    } as const;

    return (
      <Badge className={colors[status as keyof typeof colors]} data-testid={`badge-status-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const otherUser = isIncoming ? swap.requester : swap.requestedUser;
  const userListing = isIncoming ? swap.requestedListing : swap.requesterListing;
  const otherListing = isIncoming ? swap.requesterListing : swap.requestedListing;

  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatarUrl || undefined} />
              <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold" data-testid={`text-user-name-${swap.id}`}>
                {otherUser.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isIncoming ? 'wants to swap with you' : 'you requested to swap with'}
              </p>
            </div>
          </div>
          <div className="text-right">
            {getStatusBadge(swap.status)}
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(swap.createdAt.toString())}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Property Exchange Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium">
                  {isIncoming ? 'Your Property' : 'Their Property'}
                </span>
              </div>
              <h4 className="font-medium" data-testid={`text-user-listing-${swap.id}`}>
                {userListing.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {userListing.city}, {userListing.country}
              </p>
            </div>
            
            <ArrowLeftRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            
            <div className="flex-1 bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">
                  {isIncoming ? 'Their Property' : 'Your Property'}
                </span>
              </div>
              <h4 className="font-medium" data-testid={`text-other-listing-${swap.id}`}>
                {otherListing.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {otherListing.city}, {otherListing.country}
              </p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 py-2 px-3 bg-muted/30 rounded-lg">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <span className="font-medium" data-testid={`text-start-date-${swap.id}`}>
              {formatDate(swap.startDate.toString())}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium" data-testid={`text-end-date-${swap.id}`}>
              {formatDate(swap.endDate.toString())}
            </span>
          </div>
          <div className="text-sm text-muted-foreground ml-auto">
            {Math.ceil((new Date(swap.endDate.toString()).getTime() - new Date(swap.startDate.toString()).getTime()) / (1000 * 60 * 60 * 24))} days
          </div>
        </div>

        {/* Notes */}
        {swap.notes && (
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-sm font-medium mb-1">Message:</p>
            <p className="text-sm text-muted-foreground" data-testid={`text-notes-${swap.id}`}>
              {swap.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        {swap.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            {isIncoming ? (
              // Incoming request - can accept/decline
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="default" 
                      className="flex-1"
                      data-testid={`button-accept-${swap.id}`}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Accept Swap Request?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will confirm the property exchange with {otherUser.name} from {formatDate(swap.startDate.toString())} to {formatDate(swap.endDate.toString())}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => updateSwapMutation.mutate('accepted')}
                        disabled={updateSwapMutation.isPending}
                      >
                        {updateSwapMutation.isPending ? 'Accepting...' : 'Accept Swap'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      data-testid={`button-decline-${swap.id}`}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Decline Swap Request?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will decline the swap request from {otherUser.name}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => updateSwapMutation.mutate('declined')}
                        disabled={updateSwapMutation.isPending}
                      >
                        {updateSwapMutation.isPending ? 'Declining...' : 'Decline'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              // Outgoing request - can cancel
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    data-testid={`button-cancel-${swap.id}`}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Request
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Swap Request?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel your swap request to {otherUser.name}. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => updateSwapMutation.mutate('cancelled')}
                      disabled={updateSwapMutation.isPending}
                    >
                      {updateSwapMutation.isPending ? 'Cancelling...' : 'Cancel Request'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            <Button 
              variant="outline" 
              size="icon"
              data-testid={`button-message-${swap.id}`}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        )}

        {swap.status !== 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              data-testid={`button-message-final-${swap.id}`}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact {otherUser.name}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SwapRequestsPage() {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

  const { data: swaps = [], isLoading, error } = useQuery<SwapWithDetails[]>({
    queryKey: ['/api/swaps'],
  });

  const incomingRequests = swaps.filter((swap) => swap.requestedUser);
  const outgoingRequests = swaps.filter((swap) => swap.requester);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Unable to Load Swap Requests</h1>
          <p className="text-muted-foreground mb-6">There was an error loading your swap requests.</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Swap Requests</h1>
            <p className="text-muted-foreground mt-2">
              Manage your incoming and outgoing property swap requests
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'incoming' | 'outgoing')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="incoming" data-testid="tab-incoming">
                Incoming ({incomingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="outgoing" data-testid="tab-outgoing">
                Outgoing ({outgoingRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="incoming" className="space-y-4">
              {incomingRequests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Incoming Requests</h3>
                    <p className="text-muted-foreground">
                      When others want to swap with your properties, their requests will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {incomingRequests.map((swap) => (
                    <SwapRequestCard 
                      key={swap.id} 
                      swap={swap} 
                      isIncoming={true} 
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="outgoing" className="space-y-4">
              {outgoingRequests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Outgoing Requests</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't sent any swap requests yet. Browse properties to start swapping!
                    </p>
                    <Button onClick={() => window.location.href = '/listings'}>
                      Browse Properties
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {outgoingRequests.map((swap) => (
                    <SwapRequestCard 
                      key={swap.id} 
                      swap={swap} 
                      isIncoming={false} 
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}