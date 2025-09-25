import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import PropertyCard from '@/components/PropertyCard';
import MapView from '@/components/MapView';
import SearchFilters from '@/components/SearchFilters';

interface SearchFiltersState {
  location: string;
  type: string;
  guests: string;
  bedrooms: string;
  bathrooms: string;
  checkIn: string;
  checkOut: string;
  amenities: string[];
  sortBy: string;
}

interface ListingResponse {
  listings: any[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    hasCoordinates: boolean;
    searchRadius: number | null;
    sortBy: string;
    appliedFilters: number;
  };
}

export default function ListingsPage() {
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersState>({
    location: '',
    type: '',
    guests: '',
    bedrooms: '',
    bathrooms: '',
    checkIn: '',
    checkOut: '',
    amenities: [],
    sortBy: 'newest',
  });

  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Read URL parameters on component mount to handle search from navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const locationParam = urlParams.get('location');
    const typeParam = urlParams.get('type');
    const guestsParam = urlParams.get('guests');
    const bedroomsParam = urlParams.get('bedrooms');
    const bathroomsParam = urlParams.get('bathrooms');
    const checkInParam = urlParams.get('checkIn');
    const checkOutParam = urlParams.get('checkOut');
    const amenitiesParam = urlParams.get('amenities');
    const sortByParam = urlParams.get('sortBy');

    // Update filters with URL parameters
    if (locationParam || typeParam || guestsParam || bedroomsParam || bathroomsParam || checkInParam || checkOutParam || amenitiesParam || sortByParam) {
      setFilters(prev => ({
        ...prev,
        location: locationParam || prev.location,
        type: typeParam === 'all' ? '' : (typeParam || prev.type),
        guests: guestsParam === 'all' ? '' : (guestsParam || prev.guests),
        bedrooms: bedroomsParam === 'all' ? '' : (bedroomsParam || prev.bedrooms),
        bathrooms: bathroomsParam === 'all' ? '' : (bathroomsParam || prev.bathrooms),
        checkIn: checkInParam || prev.checkIn,
        checkOut: checkOutParam || prev.checkOut,
        amenities: amenitiesParam ? amenitiesParam.split(',') : prev.amenities,
        sortBy: sortByParam || prev.sortBy,
      }));
    }
  }, []);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['/api/listings', filters, userLocation],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add all filters to URL params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'all') {
          if (key === 'amenities' && Array.isArray(value)) {
            if (value.length > 0) {
              params.append(key, value.join(','));
            }
          } else {
            params.append(key, value as string);
          }
        }
      });

      // Add user location for distance-based sorting if available
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
        params.append('radius', '50'); // Default 50km radius
      }

      console.log('Fetching listings with params:', params.toString());
      
      const response = await fetch(`/api/listings?${params}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<ListingResponse>;
    },
  });

  // Extract listings and metadata from response
  const listings = response?.listings || [];
  const metadata = response?.metadata || null;

  const handleFilterChange = (newFilters: Partial<SearchFiltersState>) => {
    console.log('Filter change:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Add all filters to URL params
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'all') {
        if (key === 'amenities' && Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(','));
          }
        } else {
          params.append(key, value as string);
        }
      }
    });

    // Update URL without triggering a page reload
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [filters]);

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      return;
    }

    setLoadingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
      });
      
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      setUserLocation(location);
      console.log('User location obtained:', location);
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      type: '',
      guests: '',
      bedrooms: '',
      bathrooms: '',
      checkIn: '',
      checkOut: '',
      amenities: [],
      sortBy: 'newest',
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <h2 className="text-xl font-semibold text-center">Error Loading Listings</h2>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                {error instanceof Error ? error.message : 'We couldn\'t load the listings. Please try again later.'}
              </p>
            </CardContent>
            <CardFooter className="justify-center">
              <Button onClick={() => window.location.reload()} data-testid="button-retry">
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Find Your Perfect Stay</h1>
              <p className="text-muted-foreground mt-1">
                Discover unique caravans and cabins for your next adventure
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={getUserLocation}
                disabled={loadingLocation}
                data-testid="button-get-location"
              >
                <MapPin className="h-4 w-4 mr-2" />
                {loadingLocation ? 'Getting location...' : 'Use my location'}
              </Button>
              
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {metadata && metadata.appliedFilters > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {metadata.appliedFilters}
                  </Badge>
                )}
              </Button>
              
              <div className="flex rounded-lg border">
                <Button
                  variant={view === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('grid')}
                  data-testid="button-view-grid"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('map')}
                  data-testid="button-view-map"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search Filters */}
          {showFilters && (
            <div className="mt-6">
              <SearchFilters
                isOpen={true}
                onFiltersChange={handleFilterChange}
                initialFilters={filters}
              />
            </div>
          )}
          
          {/* Search Status */}
          {metadata && (
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span>{metadata.total} properties found</span>
              {metadata.hasCoordinates && (
                <span>📍 Within {metadata.searchRadius}km of your location</span>
              )}
              {metadata.appliedFilters > 0 && (
                <span>🔍 {metadata.appliedFilters} filter{metadata.appliedFilters > 1 ? 's' : ''} applied</span>
              )}
              <span>📋 Sorted by {metadata.sortBy.replace('_', ' ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {view === 'map' ? (
          <div className="h-[600px] rounded-lg overflow-hidden border">
            <MapView 
              properties={listings.map((listing: any) => ({
                id: listing.id,
                title: listing.title,
                type: listing.type,
                latitude: parseFloat(listing.latitude) || 54.5,
                longitude: parseFloat(listing.longitude) || -2,
                rating: 4.5,
                imageUrl: listing.photos?.[0]?.url || '/placeholder-image.jpg'
              }))}
            />
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {isLoading ? 'Loading...' : `${listings.length} properties found`}
                </span>
                {Object.values(filters).some(f => f && f !== '' && (Array.isArray(f) ? f.length > 0 : true)) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    data-testid="button-clear-filters"
                  >
                    Clear filters
                  </Button>
                )}
              </div>

              <Select 
                value={filters.sortBy} 
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-[180px]" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  {userLocation && (
                    <SelectItem value="distance">Distance</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Listings Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <div className="flex gap-2 mb-4">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing: any) => (
                  <PropertyCard
                    key={listing.id}
                    id={listing.id}
                    title={listing.title}
                    type={listing.type}
                    location={`${listing.city}, ${listing.country}`}
                    rating={4.5} // TODO: Calculate from reviews
                    reviewCount={12} // TODO: Get from reviews
                    capacity={listing.maxGuests}
                    imageUrl={listing.photos?.[0]?.url || '/placeholder-image.jpg'}
                    amenities={listing.amenities || []}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && listings.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings found</h3>
                <p className="text-muted-foreground mb-4">
                  {metadata?.appliedFilters ? (
                    'No properties match your current search criteria. Try adjusting your filters.'
                  ) : (
                    'No properties available at the moment. Please check back later.'
                  )}
                </p>
                {metadata && metadata.appliedFilters > 0 && (
                  <Button onClick={resetFilters} data-testid="button-reset-search">
                    Reset Search
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}