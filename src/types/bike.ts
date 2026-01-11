export type BikeStatus = 'available' | 'rented' | 'maintenance';

export interface Bike {
  id: string;
  name: string;
  image_url: string;
  cc: number;
  engine_type: string;
  price_per_hour: number;
  status: BikeStatus;
  fuel_type: string;
  mileage: string;
  seats: number;
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
  { id: 'madhapur', name: 'Madhapur', address: 'Hitech City Main Road, Madhapur' },
  { id: 'kphb', name: 'KPHB', address: 'KPHB Colony Phase 6, Kukatpally' },
  { id: 'secunderabad', name: 'Secunderabad', address: 'Paradise Circle, Secunderabad' },
  { id: 'banjara-hills', name: 'Banjara Hills', address: 'Road No. 12, Banjara Hills' },
];
