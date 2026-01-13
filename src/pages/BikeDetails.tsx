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
  
  // User's selected rate preference
  const [selectedRate, setSelectedRate] = useState<'auto' | 'hourly' | 'daily' | 'weekly' | 'monthly'>('auto');

  // Calculate rental duration and price
  const { hours, totalPrice, rateType, rateAmount, durationType } = useMemo(() => {
    if (!pickupDate || !pickupTime || !dropDate || !dropTime || !bike) {
      return { hours: 0, totalPrice: 0, rateType: 'hourly', rateAmount: 0, durationType: 'hours' };
    }

    const pickup = new Date(`${pickupDate}T${pickupTime}`);
    const drop = new Date(`${dropDate}T${dropTime}`);
    const diffMs = drop.getTime() - pickup.getTime();
    const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    const diffDays = Math.max(1, Math.ceil(diffHours / 24));
    const diffWeeks = Math.max(1, Math.ceil(diffDays / 7));
    const diffMonths = Math.max(1, Math.ceil(diffWeeks / 4)); // Approximate month as 4 weeks

    // Calculate total price for each rate option
    const hourlyTotal = diffHours * (bike.price_per_hour || 0);
    const dailyTotal = diffDays * (bike.price_per_day || 0);
    const weeklyTotal = diffWeeks * (bike.price_per_week || 0);
    const monthlyTotal = diffMonths * (bike.price_per_month || 0);

    // Determine rate based on user selection or auto mode
    let finalRateType = 'hourly';
    let finalPrice = hourlyTotal;
    let finalAmount = bike.price_per_hour || 0;
    let duration = `${diffHours} hours`;

    if (selectedRate === 'hourly' && bike.price_per_hour) {
      finalRateType = 'hourly';
      finalPrice = hourlyTotal;
      finalAmount = bike.price_per_hour;
      duration = `${diffHours} hours`;
    } else if (selectedRate === 'daily' && bike.price_per_day) {
      finalRateType = 'daily';
      finalPrice = dailyTotal;
      finalAmount = bike.price_per_day;
      duration = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (selectedRate === 'weekly' && bike.price_per_week) {
      finalRateType = 'weekly';
      finalPrice = weeklyTotal;
      finalAmount = bike.price_per_week;
      duration = `${diffWeeks} week${diffWeeks > 1 ? 's' : ''}`;
    } else if (selectedRate === 'monthly' && bike.price_per_month) {
      finalRateType = 'monthly';
      finalPrice = monthlyTotal;
      finalAmount = bike.price_per_month;
      duration = `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    } else if (selectedRate === 'auto') {
      // Auto mode: find cheapest option
      let bestRate = 'hourly';
      let bestPrice = hourlyTotal;
      let bestAmount = bike.price_per_hour || 0;
      let bestDuration = `${diffHours} hours`;

      if (bike.price_per_day && dailyTotal < bestPrice) {
        bestRate = 'daily';
        bestPrice = dailyTotal;
        bestAmount = bike.price_per_day;
        bestDuration = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
      }
      
      if (bike.price_per_week && weeklyTotal < bestPrice) {
        bestRate = 'weekly';
        bestPrice = weeklyTotal;
        bestAmount = bike.price_per_week;
        bestDuration = `${diffWeeks} week${diffWeeks > 1 ? 's' : ''}`;
      }
      
      if (bike.price_per_month && monthlyTotal < bestPrice) {
        bestRate = 'monthly';
        bestPrice = monthlyTotal;
        bestAmount = bike.price_per_month;
        bestDuration = `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
      }

      finalRateType = bestRate;
      finalPrice = bestPrice;
      finalAmount = bestAmount;
      duration = bestDuration;
    }

    return {
      hours: diffHours,
      totalPrice: finalPrice,
      rateType: finalRateType,
      rateAmount: finalAmount,
      durationType: duration
    };
  }, [pickupDate, pickupTime, dropDate, dropTime, bike, selectedRate]);

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

⏱️ *Duration:* ${durationType}
💰 *Applied Rate:* ${rateType === 'monthly' ? `₹${rateAmount}/month` :
                   rateType === 'weekly' ? `₹${rateAmount}/week` :
                   rateType === 'daily' ? `₹${rateAmount}/day` :
                   `₹${rateAmount}/hr`}
💰 *Total Price:* ₹${totalPrice}

━━━━━━━━━━━━━━━━
`.trim();

    const encodedMessage = encodeURIComponent(message);
    // Target WhatsApp number (India country code +91): 9985819038 -> 919985819038
    const whatsappUrl = `https://wa.me/919985819038?text=${encodedMessage}`;
    
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
                    {bike.price_per_hour ? (
                      <>
                        ₹{bike.price_per_hour}
                        <span className="text-muted-foreground text-sm">/hr</span>
                      </>
                    ) : bike.price_per_day ? (
                      <>
                        ₹{bike.price_per_day}
                        <span className="text-muted-foreground text-sm">/day</span>
                      </>
                    ) : bike.price_per_week ? (
                      <>
                        ₹{bike.price_per_week}
                        <span className="text-muted-foreground text-sm">/week</span>
                      </>
                    ) : bike.price_per_month ? (
                      <>
                        ₹{bike.price_per_month}
                        <span className="text-muted-foreground text-sm">/month</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Price not set</span>
                    )}
                  </div>
                  
                  {/* Additional Prices */}
                  {(bike.price_per_day || bike.price_per_week || bike.price_per_month) && (
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                      {bike.price_per_day && <span>Day: ₹{bike.price_per_day}</span>}
                      {bike.price_per_week && <span>Week: ₹{bike.price_per_week}</span>}
                      {bike.price_per_month && <span>Month: ₹{bike.price_per_month}</span>}
                    </div>
                  )}
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

                  {/* Rate Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Select Your Preferred Rate
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(bike.price_per_hour || bike.price_per_day || bike.price_per_week || bike.price_per_month) && (
                        <button
                          onClick={() => setSelectedRate('auto')}
                          className={`p-2 rounded-lg border text-sm transition-colors ${
                            selectedRate === 'auto'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-medium">Best Rate</div>
                          <div className="text-xs opacity-75">Auto-select cheapest</div>
                        </button>
                      )}
                      
                      {bike.price_per_hour && (
                        <button
                          onClick={() => setSelectedRate('hourly')}
                          className={`p-2 rounded-lg border text-sm transition-colors ${
                            selectedRate === 'hourly'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-medium">Hourly</div>
                          <div className="text-xs opacity-75">₹{bike.price_per_hour}/hr</div>
                        </button>
                      )}
                      
                      {bike.price_per_day && (
                        <button
                          onClick={() => setSelectedRate('daily')}
                          className={`p-2 rounded-lg border text-sm transition-colors ${
                            selectedRate === 'daily'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-medium">Daily</div>
                          <div className="text-xs opacity-75">₹{bike.price_per_day}/day</div>
                        </button>
                      )}
                      
                      {bike.price_per_week && (
                        <button
                          onClick={() => setSelectedRate('weekly')}
                          className={`p-2 rounded-lg border text-sm transition-colors ${
                            selectedRate === 'weekly'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-medium">Weekly</div>
                          <div className="text-xs opacity-75">₹{bike.price_per_week}/week</div>
                        </button>
                      )}
                      
                      {bike.price_per_month && (
                        <button
                          onClick={() => setSelectedRate('monthly')}
                          className={`p-2 rounded-lg border text-sm transition-colors ${
                            selectedRate === 'monthly'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-medium">Monthly</div>
                          <div className="text-xs opacity-75">₹{bike.price_per_month}/month</div>
                        </button>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    {/* Applied Rate */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Applied Rate</span>
                      <span className="text-foreground capitalize">
                        {rateType === 'monthly' ? `Monthly (₹${rateAmount}/month)` :
                         rateType === 'weekly' ? `Weekly (₹${rateAmount}/week)` :
                         rateType === 'daily' ? `Daily (₹${rateAmount}/day)` :
                         `Hourly (₹${rateAmount}/hr)`}
                      </span>
                    </div>
                    
                    {/* Available Rates Comparison */}
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="font-medium">Available Rates:</div>
                      {bike.price_per_hour && (
                        <div className="flex justify-between">
                          <span>Hourly:</span>
                          <span>₹{bike.price_per_hour}/hr × {hours}hrs = ₹{hours * bike.price_per_hour}</span>
                        </div>
                      )}
                      {bike.price_per_day && (
                        <div className="flex justify-between">
                          <span>Daily:</span>
                          <span>₹{bike.price_per_day}/day × {Math.ceil(hours/24)}days = ₹{Math.ceil(hours/24) * bike.price_per_day}</span>
                        </div>
                      )}
                      {bike.price_per_week && (
                        <div className="flex justify-between">
                          <span>Weekly:</span>
                          <span>₹{bike.price_per_week}/week × {Math.ceil(hours/(24*7))}weeks = ₹{Math.ceil(hours/(24*7)) * bike.price_per_week}</span>
                        </div>
                      )}
                      {bike.price_per_month && (
                        <div className="flex justify-between">
                          <span>Monthly:</span>
                          <span>₹{bike.price_per_month}/month × {Math.ceil(hours/(24*7*4))}months = ₹{Math.ceil(hours/(24*7*4)) * bike.price_per_month}</span>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    {/* Duration */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="text-foreground">{durationType}</span>
                    </div>
                    <Separator />
                    
                    {/* Total */}
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
