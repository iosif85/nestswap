import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { useState } from 'react';
import heroImage from '@assets/generated_images/Hero_landscape_with_caravans_cabins_85535f40.png';

interface HeroProps {
  onSearch?: (filters: { location: string; checkIn: string; checkOut: string; guests: number }) => void;
}

export default function Hero({ onSearch = () => console.log('Search triggered') }: HeroProps) {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ location, checkIn, checkOut, guests });
  };

  return (
    <div className="relative min-h-[80vh] bg-gradient-to-b from-black/30 to-black/50 flex items-center justify-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-['Poppins']">
          Swap Your Way to
          <br />
          <span className="text-accent">Amazing Getaways</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
          Exchange your caravan or cabin with fellow travelers and discover incredible destinations without the cost
        </p>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Location */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Where to?
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Any destination"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                  data-testid="input-location"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Check In */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check in
              </label>
              <div className="relative">
                <Input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="pl-10"
                  data-testid="input-check-in"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Check Out */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check out
              </label>
              <div className="relative">
                <Input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="pl-10"
                  data-testid="input-check-out"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guests
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 2)}
                  className="pl-10"
                  data-testid="input-guests"
                />
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full md:w-auto px-12 bg-primary hover:bg-primary/90"
            data-testid="button-search"
          >
            <Search className="h-5 w-5 mr-2" />
            Search Properties
          </Button>
        </form>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 text-white">
          <div>
            <div className="text-3xl font-bold">500+</div>
            <div className="text-white/80">Properties</div>
          </div>
          <div>
            <div className="text-3xl font-bold">200+</div>
            <div className="text-white/80">Happy Swappers</div>
          </div>
          <div>
            <div className="text-3xl font-bold">50+</div>
            <div className="text-white/80">Countries</div>
          </div>
        </div>
      </div>
    </div>
  );
}