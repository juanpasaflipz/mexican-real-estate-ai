import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface PropertyDetailResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  property_type: string;
  address: string;
  city: string;
  state: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  primary_image?: string;
  features?: string[];
  created_at: string;
  updated_at: string;
  view_count: number;
}

export interface SimilarProperty {
  id: number;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  property_type: string;
  city: string;
  state: string;
  primary_image?: string;
}

class PropertyService {
  async getPropertyById(id: string): Promise<PropertyDetailResponse> {
    try {
      const response = await axios.get(`${API_URL}/properties/${id}`);
      // Handle both direct data and wrapped response
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw new Error('Failed to fetch property details');
    }
  }

  async getSimilarProperties(id: string): Promise<SimilarProperty[]> {
    try {
      const response = await axios.get(`${API_URL}/properties/${id}/similar`);
      // Handle both direct array and wrapped response
      const data = response.data.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching similar properties:', error);
      return []; // Return empty array on error
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  calculatePricePerSqm(price: number, area: number): string {
    if (!area || area === 0) return 'N/A';
    const pricePerSqm = price / area;
    return this.formatPrice(pricePerSqm);
  }

  getPropertyTypeLabel(type: string | undefined | null): string {
    if (!type) return 'Propiedad';
    
    const typeLabels: { [key: string]: string } = {
      'house': 'Casa',
      'apartment': 'Departamento',
      'condo': 'Condominio',
      'townhouse': 'Casa Adosada',
      'land': 'Terreno',
      'commercial': 'Comercial',
      'office': 'Oficina',
    };
    return typeLabels[type.toLowerCase()] || type;
  }

  getDefaultImage(): string {
    return 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop';
  }

  processImages(property: PropertyDetailResponse): string[] {
    // If images array exists and has items, return it
    if (property.images && property.images.length > 0) {
      return property.images;
    }
    
    // If primary_image exists, return it as an array
    if (property.primary_image) {
      return [property.primary_image];
    }
    
    // Return default image
    return [this.getDefaultImage()];
  }
}

export default new PropertyService();