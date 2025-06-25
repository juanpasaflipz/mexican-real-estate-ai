export interface Property {
  id: number;
  title: string;
  description?: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  size_m2: number;
  property_type: string;
  city: string;
  state: string;
  neighborhood?: string | null;
  address?: string;
  latitude?: number;
  longitude?: number;
  main_image?: string;
  images?: string[];
  features?: string[];
  created_at?: string;
  updated_at?: string;
  // Legacy fields for compatibility
  area_sqm?: number | null;
  primary_image?: string;
}

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  city?: string;
  state?: string;
}