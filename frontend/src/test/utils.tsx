import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string
  queryClient?: QueryClient
}

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

function customRender(
  ui: ReactElement,
  {
    initialRoute = '/',
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialRoute]}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  }
}

// Mock data generators
export const createMockProperty = (overrides = {}) => ({
  id: '1',
  title: 'Test Property',
  price: 500000,
  price_type: 'sale' as const,
  bedrooms: 3,
  bathrooms: 2,
  area_m2: 150,
  lat: 19.4326,
  lng: -99.1332,
  address: '123 Test Street',
  description: 'A beautiful test property',
  url: 'https://example.com/property/1',
  image_url: 'https://example.com/image.jpg',
  created_at: new Date().toISOString(),
  ...overrides,
})

export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  created_at: new Date().toISOString(),
  ...overrides,
})

// API mock helpers
export const mockFetch = (data: any, options: { status?: number; ok?: boolean } = {}) => {
  const { status = 200, ok = true } = options
  
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers({
      'content-type': 'application/json',
    }),
  })
}

export const mockFetchError = (message = 'Network error') => {
  return vi.fn().mockRejectedValue(new Error(message))
}

// Wait helpers
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// Event helpers
export const createMockEvent = (overrides = {}) => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  target: {
    value: '',
  },
  ...overrides,
})

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { customRender as render, createTestQueryClient }