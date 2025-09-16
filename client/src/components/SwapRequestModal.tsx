import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ListingWithPhotos } from '@shared/schema';

const swapRequestSchema = z.object({
  requesterListingId: z.string().min(1, 'Please select one of your listings'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

type SwapRequestForm = z.infer<typeof swapRequestSchema>;

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestedListing: ListingWithPhotos;
}

export default function SwapRequestModal({ isOpen, onClose, requestedListing }: SwapRequestModalProps) {
  const { toast } = useToast();

  // Get user's listings to offer for swap
  const { data: userListings = [], isLoading: listingsLoading } = useQuery<ListingWithPhotos[]>({
    queryKey: ['/api/listings/my-listings'],
    enabled: isOpen,
  });

  const form = useForm<SwapRequestForm>({
    resolver: zodResolver(swapRequestSchema),
    defaultValues: {
      requesterListingId: '',
      startDate: '',
      endDate: '',
      notes: '',
    },
  });

  const createSwapMutation = useMutation({
    mutationFn: async (data: SwapRequestForm) => {
      if (!requestedListing.owner?.id) {
        throw new Error('Unable to identify property owner');
      }
      return apiRequest('POST', '/api/swaps', {
        requestedUserId: requestedListing.owner.id,
        requesterListingId: data.requesterListingId,
        requestedListingId: requestedListing.id,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Swap Request Sent!',
        description: 'Your swap request has been sent to the property owner.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/swaps'] });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send swap request',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: SwapRequestForm) => {
    createSwapMutation.mutate(data);
  };

  const selectedListing = userListings.find(
    (listing) => listing.id === form.watch('requesterListingId')
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request a Swap</DialogTitle>
          <DialogDescription>
            Send a swap request to exchange your property with "{requestedListing.title}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Property you want */}
            <div>
              <h3 className="font-semibold mb-3">Property You Want</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {requestedListing.photos?.[0] && (
                      <div className="w-20 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={requestedListing.photos[0].url}
                          alt={requestedListing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{requestedListing.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {requestedListing.city}, {requestedListing.country}
                      </p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline">{requestedListing.type}</Badge>
                        <Badge variant="outline">{requestedListing.maxGuests} guests</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Property to offer */}
            <FormField
              control={form.control}
              name="requesterListingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property You're Offering</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={listingsLoading}>
                    <FormControl>
                      <SelectTrigger data-testid="select-requester-listing">
                        <SelectValue placeholder={listingsLoading ? "Loading your listings..." : "Select your property"} />
                        <ChevronDown className="h-4 w-4" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {userListings.map((listing) => (
                        <SelectItem key={listing.id} value={listing.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{listing.title}</span>
                            <span className="text-muted-foreground text-sm">
                              ({listing.city})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {userListings.length === 0 && !listingsLoading && (
                    <FormDescription className="text-orange-600">
                      You need to have at least one active listing to request swaps. 
                      <Button variant="ghost" className="p-0 h-auto ml-1" onClick={() => window.location.href = '/create-listing'}>
                        Create one now
                      </Button>
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />

            {/* Selected listing preview */}
            {selectedListing && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {selectedListing.photos?.[0] && (
                      <div className="w-20 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={selectedListing.photos[0].url}
                          alt={selectedListing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{selectedListing.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedListing.city}, {selectedListing.country}
                      </p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline">{selectedListing.type}</Badge>
                        <Badge variant="outline">{selectedListing.maxGuests} guests</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-start-date"
                        min={new Date().toISOString().split('T')[0]} // Today or later
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-end-date"
                        min={form.watch('startDate') || new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Introduce yourself and explain why you'd like to swap properties..."
                      {...field}
                      data-testid="textarea-notes"
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Share why you're interested in this swap and any special requirements
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createSwapMutation.isPending || userListings.length === 0}
                data-testid="button-send-request"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {createSwapMutation.isPending ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}