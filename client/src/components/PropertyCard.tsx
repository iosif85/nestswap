import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Users, Star, Calendar } from 'lucide-react';

interface PropertyCardProps {
  id: string;
  title: string;
  type: 'caravan' | 'cabin';
  location: string;
  rating: number;
  reviewCount: number;
  capacity: number;
  imageUrl: string;
  amenities: string[];
  availableDates?: string[];
  isFavorite?: boolean;
  onFavorite?: (id: string) => void;
  onView?: (id: string) => void;
  isSwapMode?: boolean;
}

export default function PropertyCard({
  id,
  title,
  type,
  location,
  rating,
  reviewCount,
  capacity,
  imageUrl,
  amenities,
  availableDates = [],
  isFavorite = false,
  onFavorite = () => console.log('Favorite toggled:', id),
  onView = () => console.log('View property:', id),
  isSwapMode = false,
}: PropertyCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-card-border overflow-hidden hover-elevate transition-all duration-200 group">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onLoad={() => setIsImageLoaded(true)}
        />
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(id);
          }}
          data-testid={`button-favorite-${id}`}
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </Button>

        {/* Type Badge */}
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 bg-white/90 text-gray-800 capitalize"
        >
          {type}
        </Badge>

        {/* Available Dates */}
        {availableDates.length > 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge
              variant="outline"
              className="bg-primary/90 text-white border-primary/50"
            >
              <Calendar className="h-3 w-3 mr-1" />
              {availableDates.length} dates available
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-card-foreground truncate mr-2">
            {title}
          </h3>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-sm text-muted-foreground">({reviewCount})</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm truncate">{location}</span>
        </div>

        {/* Capacity */}
        <div className="flex items-center text-muted-foreground mb-3">
          <Users className="h-4 w-4 mr-1" />
          <span className="text-sm">Up to {capacity} guests</span>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {amenities.length > 3 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div>
            {isSwapMode && (
              <div className="text-sm text-primary font-medium">
                Available for swap
              </div>
            )}
          </div>
          
          <Button
            size="sm"
            onClick={() => onView(id)}
            data-testid={`button-view-${id}`}
          >
            {isSwapMode ? 'Request Swap' : 'View Details'}
          </Button>
        </div>
      </div>
    </div>
  );
}