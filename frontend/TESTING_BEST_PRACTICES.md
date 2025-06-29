# Testing Best Practices

## Core Principles

### 1. Explicit Imports (No Globals)

We've disabled Vitest globals to improve code clarity. Always import what you need:

```typescript
// ✅ Good - Explicit imports
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// ❌ Bad - Relying on globals
describe('test', () => {}) // Will fail - describe not defined
```

### 2. Test Structure

Follow the AAA pattern:
- **Arrange**: Set up test data and conditions
- **Act**: Execute the code being tested
- **Assert**: Verify the results

```typescript
import { describe, it, expect } from 'vitest'

describe('Calculator', () => {
  it('adds two numbers', () => {
    // Arrange
    const a = 5
    const b = 3
    
    // Act
    const result = add(a, b)
    
    // Assert
    expect(result).toBe(8)
  })
})
```

### 3. Descriptive Test Names

Use clear, specific test descriptions:

```typescript
// ✅ Good
it('returns user data when valid ID is provided')
it('throws error when user ID is not found')
it('displays loading spinner while fetching data')

// ❌ Bad
it('works')
it('test user')
it('handles error')
```

### 4. Test Isolation

Each test should be independent:

```typescript
import { beforeEach, afterEach } from 'vitest'

describe('UserService', () => {
  beforeEach(() => {
    // Reset state before each test
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    // Clean up after each test
    cleanup()
  })
})
```

## Component Testing

### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
})
```

### Testing User Interactions

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from './Form'

describe('Form', () => {
  it('submits data when form is filled', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    
    render(<Form onSubmit={onSubmit} />)
    
    await user.type(screen.getByLabelText('Name'), 'John Doe')
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    
    expect(onSubmit).toHaveBeenCalledWith({ name: 'John Doe' })
  })
})
```

### Testing Async Components

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { UserProfile } from './UserProfile'

describe('UserProfile', () => {
  it('loads and displays user data', async () => {
    render(<UserProfile userId="123" />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })
})
```

## Mocking

### Module Mocking

```typescript
import { vi } from 'vitest'

// Mock entire module
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'John' })
}))

// Mock with factory function
vi.mock('./config', () => {
  return {
    API_URL: 'http://test.com',
    TIMEOUT: 5000
  }
})
```

### Spy on Functions

```typescript
import { vi } from 'vitest'

const logSpy = vi.spyOn(console, 'log')

// Later in test
expect(logSpy).toHaveBeenCalledWith('Expected message')
```

### Mock Implementations

```typescript
import { vi } from 'vitest'

const mockFetch = vi.fn()
  .mockResolvedValueOnce({ data: 'first call' })
  .mockResolvedValueOnce({ data: 'second call' })
  .mockRejectedValueOnce(new Error('third call fails'))
```

## Hook Testing

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter())
    
    expect(result.current.count).toBe(0)
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })
})
```

## Integration Testing

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'

describe('App Integration', () => {
  it('navigates between pages', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    )
    
    // Test navigation and data flow
  })
})
```

## Common Patterns

### Testing Error States

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

describe('Error Handling', () => {
  it('displays error message when component throws', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })
})
```

### Testing Loading States

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DataTable } from './DataTable'

describe('Loading States', () => {
  it('shows skeleton while loading', () => {
    render(<DataTable isLoading={true} data={[]} />)
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument()
  })
})
```

### Testing Context Providers

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

const TestComponent = () => {
  const { user } = useAuth()
  return <div>{user?.name || 'Not logged in'}</div>
}

describe('AuthContext', () => {
  it('provides user data to children', () => {
    render(
      <AuthProvider initialUser={{ name: 'John' }}>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(screen.getByText('John')).toBeInTheDocument()
  })
})
```

## Performance Tips

1. **Use test.concurrent for parallel tests**
   ```typescript
   import { describe, it } from 'vitest'
   
   describe.concurrent('API tests', () => {
     it.concurrent('fetches users', async () => { })
     it.concurrent('fetches posts', async () => { })
   })
   ```

2. **Avoid unnecessary rerenders in tests**
   ```typescript
   const { rerender } = render(<Component prop="initial" />)
   // Only rerender when testing prop changes
   rerender(<Component prop="updated" />)
   ```

3. **Use test utilities for common patterns**
   ```typescript
   import { render } from '@/test/utils'
   // Pre-configured with providers
   ```

## Debugging Tests

1. **Use screen.debug()**
   ```typescript
   render(<Component />)
   screen.debug() // Prints DOM structure
   ```

2. **Use prettyDOM for specific elements**
   ```typescript
   import { prettyDOM } from '@testing-library/react'
   const element = screen.getByRole('button')
   console.log(prettyDOM(element))
   ```

3. **Use testing playground**
   ```typescript
   screen.logTestingPlaygroundURL()
   // Opens interactive query builder
   ```

## Checklist

Before submitting tests:
- [ ] All imports are explicit (no globals)
- [ ] Tests are isolated and independent
- [ ] Test names clearly describe behavior
- [ ] Edge cases are covered
- [ ] Async operations are properly awaited
- [ ] Mocks are cleaned up after tests
- [ ] No console errors or warnings
- [ ] Coverage thresholds are met