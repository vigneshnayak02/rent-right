import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LOCATIONS } from '@/types/bike';

interface SearchParams {
  location: string;
  pickupDate: string;
  pickupTime: string;
  dropDate: string;
  dropTime: string;
}

const HeroSearch = () => {
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    location: urlSearchParams.get('location') || '',
    pickupDate: urlSearchParams.get('pickupDate') || '',
    pickupTime: urlSearchParams.get('pickupTime') || '',
    dropDate: urlSearchParams.get('dropDate') || '',
    dropTime: urlSearchParams.get('dropTime') || '',
  });

  // Update form when URL params change
  useEffect(() => {
    setSearchParams({
      location: urlSearchParams.get('location') || '',
      pickupDate: urlSearchParams.get('pickupDate') || '',
      pickupTime: urlSearchParams.get('pickupTime') || '',
      dropDate: urlSearchParams.get('dropDate') || '',
      dropTime: urlSearchParams.get('dropTime') || '',
    });
  }, [urlSearchParams]);

  // Get today's date formatted for input
  const today = new Date().toISOString().split('T')[0];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchParams.location) params.set('location', searchParams.location);
    if (searchParams.pickupDate) params.set('pickupDate', searchParams.pickupDate);
    if (searchParams.pickupTime) params.set('pickupTime', searchParams.pickupTime);
    if (searchParams.dropDate) params.set('dropDate', searchParams.dropDate);
    if (searchParams.dropTime) params.set('dropTime', searchParams.dropTime);
    
    navigate(`/bikes?${params.toString()}`);
  };

  return (
    <div className="glass-card rounded-2xl p-4 md:p-6 shadow-elevated animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Location Selector */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            <MapPin className="inline h-4 w-4 mr-1 text-primary" />
            Pickup Location
          </label>
          <Select
            value={searchParams.location}
            onValueChange={(value) => setSearchParams({ ...searchParams, location: value })}
          >
            <SelectTrigger className="w-full bg-background border-input">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pickup Date */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            <Calendar className="inline h-4 w-4 mr-1 text-primary" />
            Pickup Date
          </label>
          <input
            type="date"
            min={today}
            value={searchParams.pickupDate}
            onChange={(e) => setSearchParams({ ...searchParams, pickupDate: e.target.value })}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Pickup Time */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            <Clock className="inline h-4 w-4 mr-1 text-primary" />
            Pickup Time
          </label>
          <input
            type="time"
            value={searchParams.pickupTime}
            onChange={(e) => setSearchParams({ ...searchParams, pickupTime: e.target.value })}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Drop Date */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            <Calendar className="inline h-4 w-4 mr-1 text-primary" />
            Drop Date
          </label>
          <input
            type="date"
            min={searchParams.pickupDate || today}
            value={searchParams.dropDate}
            onChange={(e) => setSearchParams({ ...searchParams, dropDate: e.target.value })}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Drop Time */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            <Clock className="inline h-4 w-4 mr-1 text-primary" />
            Drop Time
          </label>
          <div className="flex gap-2">
            <input
              type="time"
              value={searchParams.dropTime}
              onChange={(e) => setSearchParams({ ...searchParams, dropTime: e.target.value })}
              className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-4 flex justify-center md:justify-end">
        <Button 
          onClick={handleSearch}
          size="lg"
          className="w-full md:w-auto font-display font-bold text-lg px-8 shadow-brand"
        >
          <Search className="mr-2 h-5 w-5" />
          Search Bikes
        </Button>
      </div>
    </div>
  );
};

export default HeroSearch;
