import { useState } from 'react';
import MapView from '../MapView';
import caravanImage from '@assets/generated_images/Modern_caravan_interior_design_28716383.png';
import cabinImage from '@assets/generated_images/Rustic_cabin_exterior_view_d05e4235.png';

export default function MapViewExample() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mock properties data
  const properties = [
    {
      id: '1',
      title: 'Luxury Mountain Caravan',
      type: 'caravan' as const,
      latitude: 54.4609,
      longitude: -3.0886,
      price: '£85',
      rating: 4.8,
      imageUrl: caravanImage,
    },
    {
      id: '2',
      title: 'Cozy Forest Cabin',
      type: 'cabin' as const,
      latitude: 56.8198,
      longitude: -5.1052,
      price: '£120',
      rating: 4.9,
      imageUrl: cabinImage,
    },
    {
      id: '3',
      title: 'Riverside Retreat',
      type: 'cabin' as const,
      latitude: 55.3781,
      longitude: -3.4360,
      rating: 4.7,
      imageUrl: cabinImage,
    },
  ];

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Interactive Map View</h3>
      <MapView
        properties={properties}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      />
    </div>
  );
}