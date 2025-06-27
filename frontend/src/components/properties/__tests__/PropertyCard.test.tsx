import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PropertyCard from '../PropertyCard'

// Mock Lucide icons to avoid rendering issues
vi.mock('lucide-react', () => ({
  Home: () => <span data-testid="home-icon">Home</span>,
  Bath: () => <span data-testid="bath-icon">Bath</span>,
  Maximize2: () => <span data-testid="area-icon">Area</span>,
  MapPin: () => <span data-testid="location-icon">Location</span>
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('PropertyCard', () => {
  const mockProperty = {
    id: 1,
    title: 'Beautiful Beach House',
    price: '5000000',
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 200,
    property_type: 'Casa',
    city: 'Cancún',
    state: 'Quintana Roo',
    neighborhood: 'Zona Hotelera',
    primary_image: 'https://example.com/property.jpg'
  }

  it('should render property information correctly', () => {
    renderWithRouter(<PropertyCard property={mockProperty} />)
    
    // Check title
    expect(screen.getByText('Beautiful Beach House')).toBeInTheDocument()
    
    // Check property type
    expect(screen.getByText('Casa')).toBeInTheDocument()
    
    // Check location - the component renders city and state separately
    expect(screen.getByText(/Zona Hotelera/)).toBeInTheDocument()
    expect(screen.getByText(/Cancún/)).toBeInTheDocument()
    expect(screen.getByText(/Quintana Roo/)).toBeInTheDocument()
    
    // Check bedrooms - the number is part of "3 rec"
    expect(screen.getByText(/3 rec/)).toBeInTheDocument()
    
    // Check bathrooms - the number is part of "2 baños"
    expect(screen.getByText(/2.*baños/)).toBeInTheDocument()
    
    // Check area
    expect(screen.getByText('200 m²')).toBeInTheDocument()
  })

  it('should format price correctly in Mexican pesos', () => {
    renderWithRouter(<PropertyCard property={mockProperty} />)
    
    // Should format as Mexican currency
    expect(screen.getByText('$5,000,000')).toBeInTheDocument()
  })

  it('should link to property detail page', () => {
    renderWithRouter(<PropertyCard property={mockProperty} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/properties/1')
  })

  it('should render property image', () => {
    renderWithRouter(<PropertyCard property={mockProperty} />)
    
    const image = screen.getByAltText('Beautiful Beach House') as HTMLImageElement
    expect(image).toBeInTheDocument()
    expect(image.src).toBe('https://example.com/property.jpg')
  })

  it('should handle missing neighborhood', () => {
    const propertyWithoutNeighborhood = {
      ...mockProperty,
      neighborhood: null
    }
    
    renderWithRouter(<PropertyCard property={propertyWithoutNeighborhood} />)
    
    // Should show city and state
    expect(screen.getByText(/Cancún/)).toBeInTheDocument()
    expect(screen.queryByText(/Zona Hotelera/)).not.toBeInTheDocument()
  })

  it('should handle missing area', () => {
    const propertyWithoutArea = {
      ...mockProperty,
      area_sqm: null
    }
    
    renderWithRouter(<PropertyCard property={propertyWithoutArea} />)
    
    // Area section should not be displayed
    expect(screen.queryByText('200 m²')).not.toBeInTheDocument()
  })

  it('should use fallback image on error', () => {
    renderWithRouter(<PropertyCard property={mockProperty} />)
    
    const image = screen.getByAltText('Beautiful Beach House') as HTMLImageElement
    
    // Simulate image load error
    const errorEvent = new Event('error', { bubbles: true })
    Object.defineProperty(errorEvent, 'target', {
      value: image,
      writable: false
    })
    
    image.dispatchEvent(errorEvent)
    
    // Should use fallback Unsplash image
    expect(image.src).toContain('unsplash.com')
  })

  it('should handle missing primary image', () => {
    const propertyWithoutImage = {
      ...mockProperty,
      primary_image: ''
    }
    
    renderWithRouter(<PropertyCard property={propertyWithoutImage} />)
    
    // Should show placeholder instead of image
    expect(screen.getByText('Sin imagen')).toBeInTheDocument()
    expect(screen.queryByAltText('Beautiful Beach House')).not.toBeInTheDocument()
  })

  it('should handle non-numeric price gracefully', () => {
    const propertyWithInvalidPrice = {
      ...mockProperty,
      price: 'Contact for price'
    }
    
    renderWithRouter(<PropertyCard property={propertyWithInvalidPrice} />)
    
    // Should display the original string
    expect(screen.getByText('Contact for price')).toBeInTheDocument()
  })

  it('should display all property features with icons', () => {
    renderWithRouter(<PropertyCard property={mockProperty} />)
    
    // Check that all icons are rendered
    expect(screen.getByTestId('home-icon')).toBeInTheDocument()
    expect(screen.getByTestId('bath-icon')).toBeInTheDocument()
    expect(screen.getByTestId('area-icon')).toBeInTheDocument()
    expect(screen.getByTestId('location-icon')).toBeInTheDocument()
  })

  it('should have proper hover states', () => {
    renderWithRouter(<PropertyCard property={mockProperty} />)
    
    const link = screen.getByRole('link')
    
    // Check for hover classes
    expect(link).toHaveClass('hover:shadow-lg')
    expect(link).toHaveClass('hover:-translate-y-1')
    expect(link).toHaveClass('transition-all')
  })

  it('should render with different property types', () => {
    const condoProperty = {
      ...mockProperty,
      property_type: 'Departamento'
    }
    
    renderWithRouter(<PropertyCard property={condoProperty} />)
    
    expect(screen.getByText('Departamento')).toBeInTheDocument()
  })

  it('should handle very large prices', () => {
    const expensiveProperty = {
      ...mockProperty,
      price: '99999999'
    }
    
    renderWithRouter(<PropertyCard property={expensiveProperty} />)
    
    // Should format large numbers correctly
    expect(screen.getByText('$99,999,999')).toBeInTheDocument()
  })

  it('should render full location string when state differs from city', () => {
    const propertyWithDifferentState = {
      ...mockProperty,
      city: 'Monterrey',
      state: 'Nuevo León'
    }
    
    renderWithRouter(<PropertyCard property={propertyWithDifferentState} />)
    
    // Should show state when it's different from city
    expect(screen.getByText(/Monterrey/)).toBeInTheDocument()
  })
});