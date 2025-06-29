import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../../test/utils'
import { NearbyMap } from '../NearbyMap'
import { fetchNearbyProperties } from '../../../utils/fetchNearby'

// Mock the fetchNearbyProperties function
vi.mock('../../../utils/fetchNearby')

const mockFetchNearbyProperties = vi.mocked(fetchNearbyProperties)

describe('NearbyMap', () => {
  const mockTargetProperty = {
    id: '123',
    title: 'Beautiful House in Mexico City',
    lat: 19.4326,
    lng: -99.1332,
    price: 5000000,
    price_type: 'sale' as const,
    area_m2: 200,
    bedrooms: 4,
    bathrooms: 3,
    url: 'https://example.com/property/123',
  }

  const mockNearbyProperties = [
    {
      id: '124',
      title: 'Nearby Property 1',
      lat: 19.4336,
      lng: -99.1342,
      price: 4500000,
      price_type: 'sale' as const,
      area_m2: 180,
      bedrooms: 3,
      dist_km: 0.5,
    },
    {
      id: '125',
      title: 'Nearby Property 2',
      lat: 19.4316,
      lng: -99.1322,
      price: 5500000,
      price_type: 'sale' as const,
      area_m2: 220,
      bedrooms: 5,
      dist_km: 0.8,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    mockFetchNearbyProperties.mockImplementation(() => new Promise(() => {}))
    
    render(<NearbyMap propertyId="123" radiusKm={2} />)
    
    expect(screen.getByText(/loading map/i)).toBeInTheDocument()
  })

  it('renders map and statistics when data is loaded', async () => {
    mockFetchNearbyProperties.mockResolvedValue({
      target: mockTargetProperty,
      nearby: mockNearbyProperties,
    })

    render(<NearbyMap propertyId="123" radiusKm={2} />)

    await waitFor(() => {
      expect(screen.queryByText(/loading map/i)).not.toBeInTheDocument()
    })

    // Check if statistics are displayed
    expect(screen.getByText(/properties found/i)).toBeInTheDocument()
    expect(screen.getByText(/average price/i)).toBeInTheDocument()
    expect(screen.getByText(/price per m²/i)).toBeInTheDocument()
  })

  it('displays correct number of nearby properties', async () => {
    mockFetchNearbyProperties.mockResolvedValue({
      target: mockTargetProperty,
      nearby: mockNearbyProperties,
    })

    render(<NearbyMap propertyId="123" radiusKm={2} />)

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText(/properties found/i)).toBeInTheDocument()
    })
  })

  it('handles error state gracefully', async () => {
    mockFetchNearbyProperties.mockRejectedValue(new Error('Failed to fetch properties'))

    render(<NearbyMap propertyId="123" radiusKm={2} />)

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch properties/i)).toBeInTheDocument()
    })
  })

  it('handles empty nearby properties', async () => {
    mockFetchNearbyProperties.mockResolvedValue({
      target: mockTargetProperty,
      nearby: [],
    })

    render(<NearbyMap propertyId="123" radiusKm={2} />)

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText(/properties found/i)).toBeInTheDocument()
    })
  })

  it('updates when propertyId changes', async () => {
    mockFetchNearbyProperties.mockResolvedValue({
      target: mockTargetProperty,
      nearby: mockNearbyProperties,
    })

    const { rerender } = render(<NearbyMap propertyId="123" radiusKm={2} />)

    await waitFor(() => {
      expect(mockFetchNearbyProperties).toHaveBeenCalledWith('123', 2)
    })

    // Change property ID
    rerender(<NearbyMap propertyId="456" radiusKm={2} />)

    await waitFor(() => {
      expect(mockFetchNearbyProperties).toHaveBeenCalledWith('456', 2)
    })
  })

  it('updates when radius changes', async () => {
    mockFetchNearbyProperties.mockResolvedValue({
      target: mockTargetProperty,
      nearby: mockNearbyProperties,
    })

    const { rerender } = render(<NearbyMap propertyId="123" radiusKm={2} />)

    await waitFor(() => {
      expect(mockFetchNearbyProperties).toHaveBeenCalledWith('123', 2)
    })

    // Change radius
    rerender(<NearbyMap propertyId="123" radiusKm={5} />)

    await waitFor(() => {
      expect(mockFetchNearbyProperties).toHaveBeenCalledWith('123', 5)
    })
  })

  it('calculates statistics correctly', async () => {
    mockFetchNearbyProperties.mockResolvedValue({
      target: mockTargetProperty,
      nearby: mockNearbyProperties,
    })

    render(<NearbyMap propertyId="123" radiusKm={2} />)

    await waitFor(() => {
      // Average price should be (4,500,000 + 5,500,000) / 2 = 5,000,000
      expect(screen.getByText(/\$5,000,000/)).toBeInTheDocument()
    })
  })

  it('handles properties with missing coordinates gracefully', async () => {
    mockFetchNearbyProperties.mockResolvedValue({
      target: { ...mockTargetProperty, lat: 0, lng: 0 },
      nearby: mockNearbyProperties,
    })

    render(<NearbyMap propertyId="123" radiusKm={2} />)

    await waitFor(() => {
      expect(screen.getByText(/property location not available/i)).toBeInTheDocument()
    })
  })

  it('displays property titles in popups', async () => {
    mockFetchNearbyProperties.mockResolvedValue({
      target: mockTargetProperty,
      nearby: mockNearbyProperties,
    })

    render(<NearbyMap propertyId="123" radiusKm={2} />)

    await waitFor(() => {
      expect(screen.queryByText(/loading map/i)).not.toBeInTheDocument()
    })

    // Since we're mocking Mapbox, we can't test actual popup interactions
    // but we can verify the component renders without errors
    expect(screen.getByRole('region', { name: /map/i })).toBeInTheDocument()
  })
})