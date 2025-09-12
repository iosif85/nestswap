import { useState } from 'react';
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
  minPrice: string;
  maxPrice: string;
  amenities: string[];
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
    minPrice: '',
    maxPrice: '',
    amenities: [],
  });

  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['/api/listings', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add non-empty filters to URL params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          if (key === 'amenities' && Array.isArray(value)) {
            if (value.length > 0) {
              params.append(key, value.join(','));
            }
          } else {
            params.append(key, value as string);
          }
        }
      });

      const response = await fetch(`/api/listings?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      return response.json();
    },
  });

  const handleFilterChange = (newFilters: Partial<SearchFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      type: '',
      guests: '',
      bedrooms: '',
      bathrooms: '',
      minPrice: '',
      maxPrice: '',
      amenities: [],
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
                We couldn't load the listings. Please try again later.
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
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
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
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <SearchFilters
                isOpen={true}
                onFiltersChange={handleFilterChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {view === 'map' ? (
          <div className="h-[600px] rounded-lg overflow-hidden border">
            <MapView 
              properties={listings?.map((listing: any) => ({
                id: listing.id,
                title: listing.title,
                type: listing.type,
                latitude: listing.latitude || 54.5, // Default to UK if missing
                longitude: listing.longitude || -2,
                price: `£${listing.pricePerNight}`,
                rating: 4.5,
                imageUrl: listing.photos?.[0]?.url || '/placeholder-image.jpg'
              })) || []}
            />
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {isLoading ? 'Loading...' : `${listings?.length || 0} properties found`}
                </span>
                {Object.values(filters).some(f => f && f !== '') && (
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

              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest rated</SelectItem>
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
                {listings?.map((listing: any) => (
                  <PropertyCard
                    key={listing.id}
                    id={listing.id}
                    title={listing.title}
                    type={listing.type}
                    location={listing.address}
                    price={`£${listing.pricePerNight}`}
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
            {!isLoading && (!listings || listings.length === 0) && (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search filters or location
                </p>
                <Button onClick={resetFilters} data-testid="button-reset-search">
                  Reset Search
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}