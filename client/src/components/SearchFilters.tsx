import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X, MapPin, Calendar, Users } from 'lucide-react';

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

interface SearchFiltersProps {
  onFiltersChange?: (filters: SearchFiltersState) => void;
  onToggle?: () => void;
  isOpen?: boolean;
  initialFilters?: Partial<SearchFiltersState>;
}

export default function SearchFilters({ 
  onFiltersChange = () => console.log('Filters changed'),
  onToggle = () => console.log('Filters toggled'),
  isOpen = false,
  initialFilters = {}
}: SearchFiltersProps) {
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
    ...initialFilters
  });

  const amenitiesList = [
    'Wi-Fi', 'Kitchen', 'Parking', 'Hot Tub', 'Fireplace', 'BBQ',
    'Outdoor Space', 'Heating', 'Pet Friendly', 'Lake Access', 'Mountain Views',
    'Air Conditioning', 'Washer', 'Dryer', 'Pool', 'Gym', 'Workspace'
  ];

  const propertyTypes = [
    { value: 'all', label: 'Any type' },
    { value: 'caravan', label: 'Caravan' },
    { value: 'cabin', label: 'Cabin' },
    { value: 'motorhome', label: 'Motorhome' },
    { value: 'tent', label: 'Tent' },
    { value: 'other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'distance', label: 'Distance' }
  ];

  const handleFilterChange = (key: keyof SearchFiltersState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    handleFilterChange('amenities', newAmenities);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFiltersState = {
      location: '',
      type: '',
      guests: '',
      bedrooms: '',
      bathrooms: '',
      checkIn: '',
      checkOut: '',
      amenities: [],
      sortBy: 'newest'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = [
    filters.location,
    filters.type,
    filters.guests,
    filters.bedrooms,
    filters.bathrooms,
    filters.checkIn,
    filters.checkOut,
    ...filters.amenities
  ].filter(Boolean).length;

  return (
    <div className="w-full">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={onToggle}
          className="flex items-center space-x-2"
          data-testid="button-filter-toggle"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="ml-2 h-5 px-2 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="bg-card rounded-xl border p-6 space-y-6">
          {/* Location & Dates Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <div className="relative">
                <Input
                  placeholder="City, country, or property name"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="pl-9"
                  data-testid="input-filter-location"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Check In</label>
              <div className="relative">
                <Input
                  type="date"
                  value={filters.checkIn}
                  onChange={(e) => handleFilterChange('checkIn', e.target.value)}
                  className="pl-9"
                  data-testid="input-filter-check-in"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Check Out</label>
              <div className="relative">
                <Input
                  type="date"
                  value={filters.checkOut}
                  onChange={(e) => handleFilterChange('checkOut', e.target.value)}
                  className="pl-9"
                  data-testid="input-filter-check-out"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Property Type & Sort Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Property Type</label>
              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger data-testid="select-property-type">
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger data-testid="select-sort-by">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Capacity & Rooms Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Guests</label>
              <Select
                value={filters.guests}
                onValueChange={(value) => handleFilterChange('guests', value)}
              >
                <SelectTrigger data-testid="select-guests">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}+ guest{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Bedrooms</label>
              <Select
                value={filters.bedrooms}
                onValueChange={(value) => handleFilterChange('bedrooms', value)}
              >
                <SelectTrigger data-testid="select-bedrooms">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}+ bedroom{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Bathrooms</label>
              <Select
                value={filters.bathrooms}
                onValueChange={(value) => handleFilterChange('bathrooms', value)}
              >
                <SelectTrigger data-testid="select-bathrooms">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}+ bathroom{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>


          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium mb-3">Amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={filters.amenities.includes(amenity)}
                    onCheckedChange={() => handleAmenityToggle(amenity)}
                    data-testid={`checkbox-amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <label
                    htmlFor={amenity}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div>
              <label className="block text-sm font-medium mb-3">Active Filters</label>
              <div className="flex flex-wrap gap-2">
                {filters.location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>📍 {filters.location}</span>
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleFilterChange('location', '')}
                    />
                  </Badge>
                )}
                {filters.type && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>{propertyTypes.find(t => t.value === filters.type)?.label}</span>
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleFilterChange('type', '')}
                    />
                  </Badge>
                )}
                {filters.guests && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>{filters.guests}+ guests</span>
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleFilterChange('guests', '')}
                    />
                  </Badge>
                )}
                {filters.bedrooms && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>{filters.bedrooms}+ bedrooms</span>
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleFilterChange('bedrooms', '')}
                    />
                  </Badge>
                )}
                {filters.bathrooms && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>{filters.bathrooms}+ bathrooms</span>
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleFilterChange('bathrooms', '')}
                    />
                  </Badge>
                )}
                {filters.checkIn && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>From {filters.checkIn}</span>
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleFilterChange('checkIn', '')}
                    />
                  </Badge>
                )}
                {filters.checkOut && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>To {filters.checkOut}</span>
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleFilterChange('checkOut', '')}
                    />
                  </Badge>
                )}
                {filters.amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                    <span>{amenity}</span>
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleAmenityToggle(amenity)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}