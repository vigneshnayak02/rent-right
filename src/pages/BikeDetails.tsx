import { useMemo, useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Fuel, Gauge, Users, Settings, Calendar, Clock, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LOCATIONS, Bike } from '@/types/bike';
import { createBookingIntent } from '@/integrations/firebase/bookingIntents';
import { getBikeById, subscribeToBikes } from '@/integrations/firebase/bikes';

const BikeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bike, setBike] = useState<Bike | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Try to get bike directly first
    getBikeById(id)
      .then((bikeData) => {
        if (bikeData) {
          setBike(bikeData);
          setLoading(false);
        } else {
          // If not found, subscribe to all bikes and find it
          const unsubscribe = subscribeToBikes((bikes) => {
            const foundBike = bikes.find(b => b.id === id);
            if (foundBike) {
              setBike(foundBike);
              setLoading(false);
              unsubscribe();
            } else if (bikes.length > 0) {
              // Bike not found after bikes loaded
              setLoading(false);
              unsubscribe();
            }
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching bike:', error);
        setLoading(false);
        // Try subscribing as fallback
        const unsubscribe = subscribeToBikes((bikes) => {
          const foundBike = bikes.find(b => b.id === id);
          if (foundBike) {
            setBike(foundBike);
            setLoading(false);
            unsubscribe();
          } else if (bikes.length > 0) {
            setLoading(false);
            unsubscribe();
          }
        });
      });
  }, [id]);

  // Get booking params from URL
  const location = searchParams.get('location') || '';
  const pickupDate = searchParams.get('pickupDate') || '';
  const pickupTime = searchParams.get('pickupTime') || '';
  const dropDate = searchParams.get('dropDate') || '';
  const dropTime = searchParams.get('dropTime') || '';

  // Calculate rental duration and price
  const { hours, totalPrice } = useMemo(() => {
    if (!pickupDate || !pickupTime || !dropDate || !dropTime || !bike) {
      return { hours: 0, totalPrice: 0 };
    }

    const pickup = new Date(`${pickupDate}T${pickupTime}`);
    const drop = new Date(`${dropDate}T${dropTime}`);
    const diffMs = drop.getTime() - pickup.getTime();
    const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));

    return {
      hours: diffHours,
      totalPrice: diffHours * bike.price_per_hour
    };
  }, [pickupDate, pickupTime, dropDate, dropTime, bike]);

  const locationName = LOCATIONS.find(l => l.id === location)?.name || 'Not selected';

  // Generate WhatsApp message and log booking intent
  const handleWhatsAppBooking = async () => {
    if (!bike || !hours) return;

    // Log booking intent to Firebase
    try {
      await createBookingIntent({
        bike_id: bike.id,
        bike_name: bike.name,
        pickup_location: locationName,
        pickup_date: pickupDate,
        drop_date: dropDate,
        total_hours: hours,
        total_price: totalPrice,
      });
    } catch (error) {
      console.error('Failed to log booking intent:', error);
      // Continue anyway - don't block the user
    }

    const message = `
🏍️ *BIKE BOOKING REQUEST*
━━━━━━━━━━━━━━━━

*Bike:* ${bike.name}
*Image:* ${bike.image_url}

📍 *Pickup Location:* ${locationName}
📅 *Pickup:* ${pickupDate} at ${pickupTime}
📅 *Drop:* ${dropDate} at ${dropTime}

⏱️ *Duration:* ${hours} hours
💰 *Total Price:* ₹${totalPrice}

━━━━━━━━━━━━━━━━
`.trim();

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919876543210?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bike details...</p>
        </div>
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">Bike not found</h1>
          <Button asChild>
            <Link to="/bikes">Back to Bikes</Link>
          </Button>
        </div>
      </div>
    );
  }

  // If bike is not available, show unavailable message
  if (bike.status !== 'available') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">{bike.name}</h1>
          <p className="text-muted-foreground mb-6">
            This bike is currently {bike.status === 'rented' ? 'rented' : 'under maintenance'} and not available for booking.
          </p>
          <Button asChild>
            <Link to="/bikes">Browse Available Bikes</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const specs = [
    { icon: Fuel, label: 'Fuel Type', value: bike.fuel_type },
    { icon: Gauge, label: 'Mileage', value: bike.mileage },
    { icon: Users, label: 'Seating', value: `${bike.seats} Persons` },
    { icon: Settings, label: 'Engine', value: bike.engine_type },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 md:pt-28 pb-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Bike Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image */}
              <div className="relative rounded-2xl overflow-hidden aspect-video">
                <img 
                  src={bike.image_url} 
                  alt={bike.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground font-display font-bold text-lg">
                  {bike.cc} CC
                </Badge>
              </div>

              {/* Bike Name & Price */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                    {bike.name}
                  </h1>
                  <p className="text-muted-foreground mt-1">{bike.engine_type}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-display font-bold text-primary">
                    ₹{bike.price_per_hour}
                  </div>
                  <span className="text-muted-foreground">per hour</span>
                </div>
              </div>

              {/* Description */}
              {bike.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">About this Bike</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{bike.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {specs.map((spec) => (
                      <div key={spec.label} className="p-4 rounded-lg bg-muted/50 text-center">
                        <spec.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">{spec.label}</p>
                        <p className="font-semibold text-foreground">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-primary/30">
                <CardHeader className="bg-secondary rounded-t-lg">
                  <CardTitle className="font-display text-secondary-foreground">
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pickup Location</p>
                      <p className="font-medium text-foreground">{locationName}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Pickup */}
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pickup</p>
                      <p className="font-medium text-foreground">
                        {pickupDate ? `${pickupDate} at ${pickupTime || '--:--'}` : 'Not selected'}
                      </p>
                    </div>
                  </div>

                  {/* Drop */}
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Drop</p>
                      <p className="font-medium text-foreground">
                        {dropDate ? `${dropDate} at ${dropTime || '--:--'}` : 'Not selected'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rate per hour</span>
                      <span className="text-foreground">₹{bike.price_per_hour}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="text-foreground">{hours > 0 ? `${hours} hours` : '--'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-display text-2xl font-bold text-primary">
                        ₹{totalPrice > 0 ? totalPrice : '--'}
                      </span>
                    </div>
                  </div>

                  {/* Booking Button */}
                  <Button 
                    onClick={handleWhatsAppBooking}
                    disabled={!hours || bike.status !== 'available'}
                    className="w-full font-display font-bold text-lg h-12 shadow-brand"
                    size="lg"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Proceed to Booking
                  </Button>

                  {!hours && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please select pickup and drop dates/times
                    </p>
                  )}

                  {bike.status !== 'available' && (
                    <p className="text-sm text-destructive text-center">
                      This bike is currently unavailable
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BikeDetails;
