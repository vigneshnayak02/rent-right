import { Link } from 'react-router-dom';
import { Fuel, Gauge, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Bike } from '@/types/bike';

interface BikeCardProps {
  bike: Bike;
  searchParams?: string;
}

const BikeCard = ({ bike, searchParams = '' }: BikeCardProps) => {
  const statusColors = {
    available: 'bg-green-500/20 text-green-600 border-green-500/30',
    rented: 'bg-red-500/20 text-red-600 border-red-500/30',
    maintenance: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  };

  const statusLabels = {
    available: 'Available',
    rented: 'Rented',
    maintenance: 'Under Maintenance',
  };

  return (
    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-elevated animate-scale-in">
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={bike.image_url}
          alt={bike.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent" />
        
        {/* Status Badge */}
        <Badge 
          variant="outline" 
          className={`absolute top-3 right-3 ${statusColors[bike.status]}`}
        >
          {statusLabels[bike.status]}
        </Badge>

        {/* CC Badge */}
        <Badge className="absolute bottom-3 left-3 bg-primary text-primary-foreground font-display font-bold">
          {bike.cc} CC
        </Badge>
      </div>

      <CardContent className="p-4">
        {/* Bike Name */}
        <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {bike.name}
        </h3>

        {/* Specs */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Fuel className="h-4 w-4 text-primary" />
            {bike.fuel_type}
          </span>
          <span className="flex items-center gap-1">
            <Gauge className="h-4 w-4 text-primary" />
            {bike.mileage}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4 text-primary" />
            {bike.seats} Seats
          </span>
        </div>

        {/* Engine Type */}
        <p className="text-sm text-muted-foreground">
          {bike.engine_type}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        {/* Price */}
        <div>
          <div className="text-2xl font-display font-bold text-primary">
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

        {/* Book Button */}
        <Button 
          asChild 
          disabled={bike.status !== 'available'}
          className="font-display font-semibold"
        >
          <Link to={`/bike/${bike.id}${searchParams ? `?${searchParams}` : ''}`}>
            {bike.status === 'available' ? 'Book Now' : 'Unavailable'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BikeCard;
