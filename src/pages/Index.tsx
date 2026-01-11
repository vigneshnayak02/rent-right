import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, Shield, Clock, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import HeroSearch from '@/components/HeroSearch';
import BikeCard from '@/components/BikeCard';
import Footer from '@/components/Footer';
import { Bike } from '@/types/bike';
import { subscribeToBikes } from '@/integrations/firebase/bikes';
import heroBike from '@/assets/hero-bike.jpg';

const Index = () => {
  const [bikes, setBikes] = useState<Bike[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToBikes((bikesData) => {
      setBikes(bikesData);
    });

    return () => unsubscribe();
  }, []);

  // Get available bikes and limit to 3 for featured
  const featuredBikes = bikes.filter(b => b.status === 'available').slice(0, 3);

  const features = [
    {
      icon: Shield,
      title: 'Fully Insured',
      description: 'All our bikes come with comprehensive insurance for your peace of mind.'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for any assistance you need.'
    },
    {
      icon: MapPin,
      title: '4 Locations',
      description: 'Convenient pickup points across Hyderabad for easy access.'
    },
    {
      icon: Star,
      title: 'Quality Bikes',
      description: 'Well-maintained, regularly serviced bikes for the best riding experience.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroBike} 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-secondary/60" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-12 md:py-20">
          <div className="max-w-3xl">
            {/* Hero Content */}
            <div className="space-y-6 mb-8">
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in">
                <span className="text-secondary-foreground">Ride Your</span>
                <br />
                <span className="text-gradient">Dream Bike</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Premium bike rentals in Hyderabad. From scooters to superbikes, 
                find your perfect ride at unbeatable prices.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Button asChild size="lg" className="font-display font-bold text-lg shadow-brand">
                  <Link to="/bikes">
                    Browse All Bikes
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="font-display font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <a href="tel:+919951806045">
                    Call Now
                  </a>
                </Button>
              </div>
            </div>

            {/* Search Box */}
            <HeroSearch />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-primary">PS Rentals</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide the best bike rental experience in Hyderabad with top-quality vehicles and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Bikes Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Popular <span className="text-primary">Bikes</span>
              </h2>
              <p className="text-muted-foreground">
                Our most rented bikes loved by customers
              </p>
            </div>
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display font-semibold">
              <Link to="/bikes">
                View All Bikes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBikes.length > 0 ? (
              featuredBikes.map((bike, index) => (
                <div key={bike.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <BikeCard bike={bike} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">No bikes available yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
              Ready to <span className="text-primary">Ride</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Book your bike in minutes and hit the road. No long processes, just simple, quick rentals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="font-display font-bold text-lg shadow-brand">
                <Link to="/bikes">
                  Book Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display font-semibold">
                <a href="https://wa.me/919951806045" target="_blank" rel="noopener noreferrer">
                  WhatsApp Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
