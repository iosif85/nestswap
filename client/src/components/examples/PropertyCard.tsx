import PropertyCard from '../PropertyCard';
import caravanImage from '@assets/generated_images/Modern_caravan_interior_design_28716383.png';
import cabinImage from '@assets/generated_images/Rustic_cabin_exterior_view_d05e4235.png';

export default function PropertyCardExample() {
  // Mock data
  const properties = [
    {
      id: '1',
      title: 'Luxury Mountain Caravan',
      type: 'caravan' as const,
      location: 'Lake District, UK',
      price: '£85',
      rating: 4.8,
      reviewCount: 24,
      capacity: 4,
      imageUrl: caravanImage,
      amenities: ['Kitchen', 'Wi-Fi', 'Heating', 'Outdoor Space'],
      availableDates: ['2024-03-15', '2024-03-20', '2024-03-25'],
      isFavorite: false,
    },
    {
      id: '2',
      title: 'Cozy Forest Cabin',
      type: 'cabin' as const,
      location: 'Scottish Highlands',
      price: '£120',
      rating: 4.9,
      reviewCount: 18,
      capacity: 6,
      imageUrl: cabinImage,
      amenities: ['Fireplace', 'Hot Tub', 'Kitchen', 'BBQ', 'Parking'],
      availableDates: ['2024-04-01', '2024-04-10'],
      isFavorite: true,
    },
  ];

  return (
    <div className="space-y-8 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Property Cards (Regular Mode)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Property Cards (Swap Mode)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} {...property} isSwapMode={true} />
          ))}
        </div>
      </div>
    </div>
  );
}