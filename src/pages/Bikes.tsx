import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Navbar from '@/components/Navbar';
import HeroSearch from '@/components/HeroSearch';
import BikeCard from '@/components/BikeCard';
import Footer from '@/components/Footer';
import { Bike } from '@/types/bike';
import { subscribeToBikes } from '@/integrations/firebase/bikes';

const Bikes = () => {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('price-low');
  const [filterCC, setFilterCC] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to bikes from Firebase
  useEffect(() => {
    setLoading(true);
    setError(null);
    let hasReceivedData = false;
    
    const unsubscribe = subscribeToBikes((bikesData) => {
      setBikes(bikesData);
      setLoading(false);
      setError(null);
      hasReceivedData = true;
    });

    // Fallback: try to fetch bikes once if subscription doesn't work
    const timeout = setTimeout(() => {
      if (!hasReceivedData) {
        import('@/integrations/firebase/bikes').then(({ getBikes }) => {
          getBikes()
            .then((bikesData) => {
              setBikes(bikesData);
              setLoading(false);
            })
            .catch((err) => {
              console.error('Error fetching bikes:', err);
              setError('Failed to load bikes. Please check your Firebase connection.');
              setLoading(false);
            });
        });
      }
    }, 2000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Get unique CC ranges and engine types (only from available bikes)
  const availableBikes = bikes.filter(b => b.status === 'available');
  const ccRanges = ['all', '100-150', '150-250', '250-500', '500+'];
  const engineTypes = ['all', ...new Set(availableBikes.map(b => b.engine_type))];

  // Filter and sort bikes
  const filteredBikes = useMemo(() => {
    // Only show available bikes on the website
    let filtered = bikes.filter(b => b.status === 'available');

    // Filter by CC range
    if (filterCC !== 'all') {
      if (filterCC === '100-150') filtered = filtered.filter(b => b.cc >= 100 && b.cc < 150);
      else if (filterCC === '150-250') filtered = filtered.filter(b => b.cc >= 150 && b.cc < 250);
      else if (filterCC === '250-500') filtered = filtered.filter(b => b.cc >= 250 && b.cc < 500);
      else if (filterCC === '500+') filtered = filtered.filter(b => b.cc >= 500);
    }

    // Filter by engine type
    if (filterType !== 'all') {
      filtered = filtered.filter(b => b.engine_type === filterType);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price_per_hour - b.price_per_hour);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price_per_hour - a.price_per_hour);
        break;
      case 'cc-low':
        filtered.sort((a, b) => a.cc - b.cc);
        break;
      case 'cc-high':
        filtered.sort((a, b) => b.cc - a.cc);
        break;
    }

    return filtered;
  }, [bikes, sortBy, filterCC, filterType]);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Engine CC</label>
        <Select value={filterCC} onValueChange={setFilterCC}>
          <SelectTrigger>
            <SelectValue placeholder="All CC" />
          </SelectTrigger>
          <SelectContent>
            {ccRanges.map(range => (
              <SelectItem key={range} value={range}>
                {range === 'all' ? 'All CC' : `${range} CC`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Engine Type</label>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {engineTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="cc-low">CC: Low to High</SelectItem>
            <SelectItem value="cc-high">CC: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        variant="outline" 
        className="w-full" 
        onClick={() => {
          setFilterCC('all');
          setFilterType('all');
          setSortBy('price-low');
        }}
      >
        Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-24 md:pt-28 pb-8 bg-secondary">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-secondary-foreground mb-6">
            All <span className="text-primary">Bikes</span>
          </h1>
          <HeroSearch />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 p-6 rounded-xl bg-card border border-border">
                <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                  Filters
                </h3>
                <FilterContent />
              </div>
            </aside>

            {/* Bikes Grid */}
            <div className="flex-1">
              {/* Mobile Filter Button & Results Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredBikes.length}</span> bikes
                </p>
                
                {/* Mobile Filter Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle className="font-display">Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading bikes...</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="text-center py-16">
                  <p className="text-destructive text-lg mb-4">{error}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Bikes Grid */}
              {!loading && !error && filteredBikes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredBikes.map((bike, index) => (
                    <div 
                      key={bike.id} 
                      className="animate-fade-in" 
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <BikeCard bike={bike} searchParams={searchParams.toString()} />
                    </div>
                  ))}
                </div>
              )}

              {/* No Bikes Found */}
              {!loading && !error && filteredBikes.length === 0 && bikes.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg mb-4">No bikes available yet.</p>
                  <p className="text-sm text-muted-foreground">Add bikes from the admin panel to get started.</p>
                </div>
              )}

              {/* No Bikes Match Filters */}
              {!loading && !error && filteredBikes.length === 0 && bikes.length > 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">No bikes found matching your criteria.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setFilterCC('all');
                      setFilterType('all');
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Bikes;
