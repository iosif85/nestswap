import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Users, Bed, Bath, Star, Heart, Calendar, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function ListingDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const listingId = params.id;

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['/api/listings', listingId],
    queryFn: async () => {
      const response = await fetch(`/api/listings/${listingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listing');
      }
      return response.json();
    },
    enabled: !!listingId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-8 w-48" />
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-80 w-full rounded-lg" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Listing Not Found</h1>
          <p className="text-muted-foreground mb-6">The listing you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => setLocation('/listings')}>
            Browse Listings
          </Button>
        </div>
      </div>
    );
  }

  const primaryPhoto = listing.photos?.[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/listings')}
            data-testid="button-back-to-listings"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold" data-testid="text-listing-title">{listing.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span data-testid="text-listing-location">{listing.city}, {listing.country}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" data-testid="button-share">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" data-testid="button-favorite">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photos */}
            <div className="space-y-4">
              {primaryPhoto ? (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={primaryPhoto.url}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    data-testid="img-listing-primary"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No photos available</span>
                </div>
              )}

              {listing.photos && listing.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {listing.photos.slice(1, 5).map((photo: any, index: number) => (
                    <div key={photo.id} className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={photo.url}
                        alt={`${listing.title} photo ${index + 2}`}
                        className="w-full h-full object-cover"
                        data-testid={`img-listing-photo-${index + 2}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span data-testid="text-max-guests">{listing.maxGuests} guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span data-testid="text-bedrooms">{listing.bedrooms} bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span data-testid="text-bathrooms">{listing.bathrooms} bathrooms</span>
                  </div>
                  <Badge variant="secondary" data-testid="badge-property-type">
                    {listing.type}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground" data-testid="text-description">
                    {listing.description}
                  </p>
                </div>

                {listing.amenities && listing.amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.amenities.map((amenity: string, index: number) => (
                        <Badge key={index} variant="outline" data-testid={`badge-amenity-${index}`}>
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {listing.houseRules && (
                  <div>
                    <h3 className="font-semibold mb-2">House Rules</h3>
                    <p className="text-muted-foreground" data-testid="text-house-rules">
                      {listing.houseRules}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Host Information */}
            <Card>
              <CardHeader>
                <CardTitle>Meet Your Host</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={listing.owner?.avatarUrl} />
                    <AvatarFallback data-testid="text-owner-initials">
                      {listing.owner?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold" data-testid="text-owner-name">
                        {listing.owner?.name || 'Anonymous Host'}
                      </h3>
                      {listing.owner?.isVerified && (
                        <Badge variant="secondary" data-testid="badge-verified">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>4.8 · 24 reviews</span>
                    </div>
                  </div>
                  <Button variant="outline" data-testid="button-contact-host">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Host
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Request a Swap</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold" data-testid="text-price-per-night">
                      £{listing.pricePerNight}
                    </div>
                    <div className="text-sm text-muted-foreground">per night</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" data-testid="button-request-swap">
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Swap
                </Button>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Or browse similar properties
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => setLocation('/listings')}
                    data-testid="button-browse-similar"
                  >
                    Browse Similar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium" data-testid="text-full-address">{listing.address}</p>
                  <p className="text-muted-foreground">{listing.city}, {listing.country}</p>
                  <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground">Map would go here</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}