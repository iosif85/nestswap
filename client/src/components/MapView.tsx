import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Maximize2, Minimize2, Plus, Minus } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  type: 'caravan' | 'cabin';
  latitude: number;
  longitude: number;
  price?: string;
  rating: number;
  imageUrl: string;
}

interface MapViewProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export default function MapView({
  properties = [],
  onPropertySelect = () => console.log('Property selected'),
  isFullscreen = false,
  onToggleFullscreen = () => console.log('Toggle fullscreen'),
}: MapViewProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [zoom, setZoom] = useState(10);

  // Mock map implementation - in real app would use Leaflet
  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    onPropertySelect(property);
  };

  return (
    <div className={`relative bg-muted rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'h-96'}`}>
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
            onClick={() => setZoom(zoom + 1)}
            className="rounded-b-none"
            data-testid="button-zoom-in"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setZoom(Math.max(1, zoom - 1))}
            className="rounded-t-none border-t"
            data-testid="button-zoom-out"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
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

        {/* Property Markers */}
        {properties.map((property, index) => (
          <div
            key={property.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover-elevate"
            style={{
              left: `${30 + (index * 15) % 60}%`,
              top: `${25 + (index * 20) % 50}%`,
            }}
            onClick={() => handlePropertyClick(property)}
          >
            {/* Marker Pin */}
            <div className="relative">
              <div className="bg-primary text-white px-3 py-1 rounded-full shadow-lg flex items-center space-x-1 text-sm font-medium">
                <MapPin className="h-3 w-3" />
                <span>{property.price || 'Swap'}</span>
              </div>
              
              {/* Marker Point */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-primary"></div>
            </div>
          </div>
        ))}

        {/* Property Preview Card */}
        {selectedProperty && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-white rounded-lg shadow-xl p-4 z-20">
            <div className="flex items-start space-x-3">
              <img
                src={selectedProperty.imageUrl}
                alt={selectedProperty.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm truncate">
                      {selectedProperty.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className="text-xs mt-1 capitalize"
                    >
                      {selectedProperty.type}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 h-6 w-6"
                    onClick={() => setSelectedProperty(null)}
                    data-testid="button-close-preview"
                  >
                    <Plus className="h-3 w-3 rotate-45" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-muted-foreground">
                    ⭐ {selectedProperty.rating} rating
                  </div>
                  {selectedProperty.price && (
                    <div className="text-sm font-medium">
                      {selectedProperty.price}/night
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Attribution */}
        <div className="absolute bottom-1 right-1 text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded">
          © NestSwap Maps
        </div>
      </div>
    </div>
  );
}