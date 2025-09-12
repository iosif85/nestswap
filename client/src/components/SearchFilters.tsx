import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X, MapPin, Calendar, Users } from 'lucide-react';

interface SearchFiltersProps {
  onFiltersChange?: (filters: any) => void;
  onToggle?: () => void;
  isOpen?: boolean;
}

export default function SearchFilters({ 
  onFiltersChange = () => console.log('Filters changed'),
  onToggle = () => console.log('Filters toggled'),
  isOpen = false 
}: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    guests: [2],
    priceRange: [0, 500],
    checkIn: '',
    checkOut: '',
    amenities: [] as string[],
  });

  const amenitiesList = [
    'Wi-Fi', 'Kitchen', 'Parking', 'Hot Tub', 'Fireplace', 'BBQ',
    'Outdoor Space', 'Heating', 'Pet Friendly', 'Lake Access', 'Mountain Views'
  ];

  const handleFilterChange = (key: string, value: any) => {
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
    const clearedFilters = {
      location: '',
      propertyType: '',
      guests: [2],
      priceRange: [0, 500],
      checkIn: '',
      checkOut: '',
      amenities: [],
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = [
    filters.location,
    filters.propertyType,
    filters.checkIn,
    filters.checkOut,
    ...filters.amenities
  ].filter(Boolean).length + 
  (filters.guests[0] !== 2 ? 1 : 0) + 
  (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500 ? 1 : 0);

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
        <div className="bg-card rounded-xl border border-card-border p-6 space-y-6">
          {/* Location & Dates Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <div className="relative">
                <Input
                  placeholder="Where do you want to go?"
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

          {/* Property Type & Guests Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Property Type</label>
              <Select
                value={filters.propertyType}
                onValueChange={(value) => handleFilterChange('propertyType', value)}
              >
                <SelectTrigger data-testid="select-property-type">
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any type</SelectItem>
                  <SelectItem value="caravan">Caravan</SelectItem>
                  <SelectItem value="cabin">Cabin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Guests: {filters.guests[0]}
              </label>
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={filters.guests}
                  onValueChange={(value) => handleFilterChange('guests', value)}
                  max={20}
                  min={1}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Price Range: £{filters.priceRange[0]} - £{filters.priceRange[1]} per night
            </label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => handleFilterChange('priceRange', value)}
              max={500}
              min={0}
              step={10}
              className="w-full"
            />
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

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div>
              <label className="block text-sm font-medium mb-3">Active Filters</label>
              <div className="flex flex-wrap gap-2">
                {filters.location && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>{filters.location}</span>
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange('location', '')}
                    />
                  </Badge>
                )}
                {filters.propertyType && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>{filters.propertyType}</span>
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange('propertyType', '')}
                    />
                  </Badge>
                )}
                {filters.amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="flex items-center space-x-1">
                    <span>{amenity}</span>
                    <X
                      className="h-3 w-3 cursor-pointer"
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