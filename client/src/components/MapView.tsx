import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Maximize2, Minimize2, Plus, Minus } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  type: 'caravan' | 'cabin' | 'motorhome' | 'tent' | 'other';
  latitude: number;
  longitude: number;
  price?: string;
  rating: number;
  imageUrl: string;
  address?: string;
  amenities?: string[];
}

interface MapViewProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  userLocation?: { lat: number; lng: number } | null;
  center?: { lat: number; lng: number };
  zoom?: number;
}


export default function MapView({
  properties = [],
  onPropertySelect = () => console.log('Property selected'),
  isFullscreen = false,
  onToggleFullscreen = () => console.log('Toggle fullscreen'),
  userLocation = null,
  center,
  zoom: initialZoom = 10
}: MapViewProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [zoom, setZoom] = useState(initialZoom);
  const [mapCenter, setMapCenter] = useState(() => {
    if (center) return center;
    if (properties.length > 0) {
      // Calculate center from properties
      const avgLat = properties.reduce((sum, p) => sum + p.latitude, 0) / properties.length;
      const avgLng = properties.reduce((sum, p) => sum + p.longitude, 0) / properties.length;
      return { lat: avgLat, lng: avgLng };
    }
    return { lat: 54.5, lng: -2 }; // Default to UK center
  });

  // Calculate map bounds and positioning
  const calculatePosition = (lat: number, lng: number) => {
    // Simple mercator projection for demo purposes
    // In a real app, you'd use a proper map library like Leaflet or Mapbox
    const bounds = {
      north: mapCenter.lat + (10 / zoom),
      south: mapCenter.lat - (10 / zoom),
      east: mapCenter.lng + (15 / zoom),
      west: mapCenter.lng - (15 / zoom)
    };
    
    const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * 100;
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * 100;
    
    return {
      left: Math.max(5, Math.min(95, x)) + '%',
      top: Math.max(5, Math.min(95, y)) + '%'
    };
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    onPropertySelect(property);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedProperty(null);
    }
  };

  const recenterMap = () => {
    if (properties.length > 0) {
      const avgLat = properties.reduce((sum, p) => sum + p.latitude, 0) / properties.length;
      const avgLng = properties.reduce((sum, p) => sum + p.longitude, 0) / properties.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
    }
  };

  const goToUserLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setZoom(12);
    }
  };

  return (
    <div 
      className={`relative bg-muted rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'h-96'}`}
      onClick={handleMapClick}
    >
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={onToggleFullscreen}
          data-testid="button-toggle-fullscreen"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        
        <div className="bg-white rounded-lg shadow-lg">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setZoom(Math.min(20, zoom + 1))}
            className="rounded-b-none"
            data-testid="button-zoom-in"
            disabled={zoom >= 20}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setZoom(Math.max(1, zoom - 1))}
            className="rounded-t-none border-t"
            data-testid="button-zoom-out"
            disabled={zoom <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
        
        {properties.length > 0 && (
          <Button
            size="icon"
            variant="secondary"
            onClick={recenterMap}
            title="Center on properties"
            data-testid="button-recenter"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        )}
        
        {userLocation && (
          <Button
            size="icon"
            variant="secondary"
            onClick={goToUserLocation}
            title="Go to my location"
            data-testid="button-user-location"
          >
            📍
          </Button>
        )}
      </div>
      
      {/* Map Info */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur rounded-lg px-3 py-2 text-sm">
        <div className="font-medium">{properties.length} properties</div>
        <div className="text-muted-foreground">Zoom: {zoom}</div>
        {userLocation && (
          <div className="text-muted-foreground text-xs">📍 Location enabled</div>
        )}
      </div>

      {/* Mock Map Background */}
      <div 
        className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 relative overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)
          `
        }}
      >
        {/* Mock Geographic Features */}
        <div className="absolute inset-0">
          {/* Rivers/Roads */}
          <div className="absolute top-20 left-10 w-96 h-1 bg-blue-300 rotate-12 rounded-full opacity-60"></div>
          <div className="absolute top-40 right-20 w-64 h-1 bg-blue-300 -rotate-45 rounded-full opacity-60"></div>
          
          {/* Forest Areas */}
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-green-200 rounded-full opacity-40"></div>
          <div className="absolute top-10 right-10 w-40 h-40 bg-green-200 rounded-full opacity-40"></div>
        </div>

        {/* User Location Marker */}
        {userLocation && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={calculatePosition(userLocation.lat, userLocation.lng)}
          >
            <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg animate-pulse">
              📍
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Your location
            </div>
          </div>
        )}
        
        {/* Property Markers */}
        {properties.map((property) => {
          const position = calculatePosition(property.latitude, property.longitude);
          const isSelected = selectedProperty?.id === property.id;
          
          return (
            <div
              key={property.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover-elevate transition-all duration-200 z-10 ${
                isSelected ? 'scale-110 z-30' : ''
              }`}
              style={position}
              onClick={(e) => {
                e.stopPropagation();
                handlePropertyClick(property);
              }}
            >
              {/* Marker Pin */}
              <div className="relative">
                <div className={`px-3 py-1 rounded-full shadow-lg flex items-center space-x-1 text-sm font-medium transition-colors ${
                  isSelected 
                    ? 'bg-accent text-accent-foreground ring-2 ring-accent' 
                    : 'bg-primary text-white'
                }`}>
                  <MapPin className="h-3 w-3" />
                  <span>{property.price || 'Swap'}</span>
                </div>
                
                {/* Marker Point */}
                <div className={`absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent ${
                  isSelected ? 'border-t-accent' : 'border-t-primary'
                }`}></div>
                
                {/* Property Type Badge */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <Badge 
                    variant="secondary" 
                    className="text-xs capitalize opacity-75 hover:opacity-100 transition-opacity"
                  >
                    {property.type}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}

        {/* Property Preview Card */}
        {selectedProperty && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 bg-white rounded-lg shadow-xl border overflow-hidden z-40">
            <div className="relative">
              <img
                src={selectedProperty.imageUrl}
                alt={selectedProperty.title}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.jpg';
                }}
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 bg-white/80 backdrop-blur"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProperty(null);
                }}
                data-testid="button-close-preview"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </Button>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base truncate mb-1">
                    {selectedProperty.title}
                  </h4>
                  {selectedProperty.address && (
                    <p className="text-sm text-muted-foreground truncate">
                      {selectedProperty.address}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs capitalize ml-2">
                  {selectedProperty.type}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-muted-foreground">
                  ⭐ {selectedProperty.rating} rating
                </div>
                {selectedProperty.price && (
                  <div className="text-lg font-semibold text-primary">
                    {selectedProperty.price}/night
                  </div>
                )}
              </div>
              
              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {selectedProperty.amenities.slice(0, 3).map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {selectedProperty.amenities.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedProperty.amenities.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
              
              <Button 
                className="w-full" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/listing/${selectedProperty.id}`;
                }}
                data-testid="button-view-property"
              >
                View Property
              </Button>
            </div>
          </div>
        )}

        {/* Map Attribution */}
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-white/80 backdrop-blur px-2 py-1 rounded">
          © NestSwap Maps • Mock implementation
        </div>
        
        {/* No Properties Message */}
        {properties.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8 bg-white/90 backdrop-blur rounded-lg shadow-lg">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties on map</h3>
              <p className="text-muted-foreground">
                Properties will appear here when search results are available
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}