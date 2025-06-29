import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // Mock console.error to avoid noise in test output
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })

  afterEach(() => {
    console.error = originalError
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when error is thrown', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/We're sorry for the inconvenience/)).toBeInTheDocument()
  })

  it('displays error details in development mode', () => {
    // Mock development environment
    const originalEnv = import.meta.env.DEV
    Object.defineProperty(import.meta.env, 'DEV', {
      value: true,
      configurable: true
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error details (Development only)')).toBeInTheDocument()

    // Restore environment
    Object.defineProperty(import.meta.env, 'DEV', {
      value: originalEnv,
      configurable: true
    })
  })

  it('provides refresh button', () => {
    const mockReload = vi.fn()
    Object.defineProperty(window.location, 'reload', {
      value: mockReload,
      configurable: true
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const refreshButton = screen.getByText('Refresh Page')
    refreshButton.click()

    expect(mockReload).toHaveBeenCalled()
  })

  it('provides home button', () => {
    const mockHref = vi.fn()
    Object.defineProperty(window.location, 'href', {
      set: mockHref,
      configurable: true
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const homeButton = screen.getByText('Go to Homepage')
    homeButton.click()

    expect(mockHref).toHaveBeenCalledWith('/')
  })

  it('uses custom fallback when provided', () => {
    const customFallback = (error: Error, reset: () => void) => (
      <div>
        <h1>Custom Error</h1>
        <p>{error.message}</p>
        <button onClick={reset}>Reset</button>
      </div>
    )

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom Error')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('logs error details', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(console.error).toHaveBeenCalledWith(
      'Error caught by boundary:',
      expect.any(Error),
      expect.any(Object)
    )
  })

  it('resets error state when reset is called', () => {
    let resetFunction: (() => void) | null = null
    
    const customFallback = (_error: Error, reset: () => void) => {
      resetFunction = reset
      return <div>Error occurred</div>
    }

    const { rerender } = render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error occurred')).toBeInTheDocument()

    // Reset the error
    act(() => {
      if (resetFunction) {
        resetFunction()
      }
    })

    rerender(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })
})