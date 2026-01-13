export type BikeStatus = 'available' | 'rented' | 'maintenance';

export interface Bike {
  id: string;
  name: string;
  image_url: string;
  cc: number;
  engine_type: string;
  price_per_hour?: number;
  price_per_day?: number;
  price_per_week?: number;
  price_per_month?: number;
  status: BikeStatus;
  fuel_type: string;
  mileage: string;
  seats: number;
  bike_number?: string; // Internal bike number (not shown on product cards)
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BookingIntent {
  id: string;
  bike_id: string;
  bike_name: string;
  pickup_location: string;
  pickup_date: string;
  drop_date: string;
  total_hours: number;
  total_price: number;
  customer_phone?: string;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
}

export const LOCATIONS: Location[] = [
  { id: 'yousufguda', name: 'Near Yousufguda Checkpost Metro Station', address: 'Yadagiri Nagar, Hyderabad - 500045' },
];
