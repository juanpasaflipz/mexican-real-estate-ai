import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://mexican-real-estate-ai.onrender.com/api';

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
  images?: any; // Can be JSONB array or empty array
  image_url?: string;
  amenities?: any; // JSONB array of amenities
  features?: any; // JSONB object with features
  parking_spaces?: number;
  size_m2?: number;
  lot_size_m2?: number;
  year_built?: number;
  created_at: string;
  updated_at: string;
  view_count: number;
  detail_scraped?: boolean;
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
    const imageUrls: string[] = [];
    
    // Process images JSONB array
    if (property.images) {
      try {
        const imagesArray = typeof property.images === 'string' 
          ? JSON.parse(property.images) 
          : property.images;
          
        if (Array.isArray(imagesArray) && imagesArray.length > 0) {
          imagesArray.forEach((img: any) => {
            if (typeof img === 'string') {
              imageUrls.push(img);
            } else if (img && img.url) {
              imageUrls.push(img.url);
            }
          });
        }
      } catch (e) {
        console.error('Error parsing images:', e);
      }
    }
    
    // Add image_url if no images found
    if (imageUrls.length === 0 && property.image_url) {
      imageUrls.push(property.image_url);
    }
    
    // Return default image if no images found
    return imageUrls.length > 0 ? imageUrls : [this.getDefaultImage()];
  }

  processAmenities(property: PropertyDetailResponse): string[] {
    if (!property.amenities) return [];
    
    try {
      const amenities = typeof property.amenities === 'string'
        ? JSON.parse(property.amenities)
        : property.amenities;
        
      return Array.isArray(amenities) ? amenities : [];
    } catch (e) {
      console.error('Error parsing amenities:', e);
      return [];
    }
  }
}

export default new PropertyService();