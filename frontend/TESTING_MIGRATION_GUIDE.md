# Testing Migration Guide: Explicit Imports

## Overview

We've disabled Vitest globals to improve code clarity and prevent namespace pollution. This guide helps you migrate existing tests and write new ones with explicit imports.

## Why Explicit Imports?

1. **Clarity**: Dependencies are visible at the top of each file
2. **Type Safety**: Better TypeScript support and autocompletion
3. **No Conflicts**: Avoids global namespace pollution
4. **Easier Debugging**: Clear where functions come from
5. **Best Practice**: Aligns with modern JavaScript standards

## Migration Steps

### 1. Update Import Statements

**Before (with globals):**
```typescript
// No imports needed - globals available
describe('MyComponent', () => {
  it('renders', () => {
    expect(true).toBe(true)
  })
})
```

**After (explicit imports):**
```typescript
import { describe, it, expect } from 'vitest'

describe('MyComponent', () => {
  it('renders', () => {
    expect(true).toBe(true)
  })
})
```

### 2. Common Import Patterns

#### Basic Test Structure
```typescript
import { describe, it, expect } from 'vitest'
```

#### With Hooks
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
```

#### With Mocking
```typescript
import { describe, it, expect, vi } from 'vitest'
```

#### Complete Example
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
```

### 3. Use Import Helper

For consistency, you can import from our centralized imports file:

```typescript
import { describe, it, expect, vi, beforeEach } from '@/test/vitest-imports'
```

## Common Patterns

### Component Tests
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Hook Tests
```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('increments count', () => {
    const { result } = renderHook(() => useCounter())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })
})
```

### Async Tests
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AsyncComponent } from './AsyncComponent'

describe('AsyncComponent', () => {
  it('loads data', async () => {
    render(<AsyncComponent />)
    
    await waitFor(() => {
      expect(screen.getByText('Data loaded')).toBeInTheDocument()
    })
  })
})
```

### Mocking
```typescript
import { describe, it, expect, vi } from 'vitest'

// Mock modules
vi.mock('./api', () => ({
  fetchData: vi.fn()
}))

// Spy on functions
const spy = vi.spyOn(console, 'log')

// Mock implementations
const mockFn = vi.fn().mockReturnValue('mocked value')
```

## Quick Reference

### Vitest Imports
- `describe` - Define test suite
- `it` / `test` - Define test case
- `expect` - Assertions
- `vi` / `vitest` - Mocking utilities
- `beforeAll` - Run before all tests
- `afterAll` - Run after all tests
- `beforeEach` - Run before each test
- `afterEach` - Run after each test

### Testing Library Imports
- `render` - Render component
- `screen` - Query rendered elements
- `waitFor` - Wait for async operations
- `fireEvent` - Trigger DOM events
- `userEvent` - Simulate user interactions
- `act` - Wrap state updates
- `renderHook` - Test custom hooks

## ESLint Configuration

To ensure consistent imports, add this ESLint rule:

```json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [{
        "group": ["vitest"],
        "message": "Import from '@/test/vitest-imports' instead for consistency"
      }]
    }]
  }
}
```

## Automated Migration

Run this script to automatically add imports to test files:

```bash
# Find all test files missing imports
grep -L "import.*from.*vitest" **/*.test.{ts,tsx} **/*.spec.{ts,tsx}

# Add imports (be careful, review changes)
find . -name "*.test.ts*" -o -name "*.spec.ts*" | xargs sed -i '1i import { describe, it, expect } from "vitest"\n'
```

## Troubleshooting

### "describe is not defined"
Add: `import { describe } from 'vitest'`

### "expect is not defined"
Add: `import { expect } from 'vitest'`

### "vi is not defined"
Add: `import { vi } from 'vitest'`

### Type errors with expect
Ensure `@testing-library/jest-dom` is imported in setup file

## Benefits

1. **Explicit Dependencies**: Clear what each test uses
2. **Better Tree Shaking**: Only import what you need
3. **IDE Support**: Better autocomplete and go-to-definition
4. **Easier Refactoring**: Find all usages easily
5. **Team Clarity**: New developers understand dependencies

## Conclusion

While explicit imports require more typing initially, they provide significant benefits for maintainability and clarity. Use snippets or IDE templates to speed up test creation.