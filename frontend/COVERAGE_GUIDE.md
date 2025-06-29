# Code Coverage Guide

## Overview

This project enforces code coverage thresholds to maintain high code quality. Coverage is checked automatically in CI/CD and can be run locally.

## Coverage Thresholds

### Global Thresholds
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 75%
- **Statements**: 80%

### Path-Specific Thresholds

| Path | Lines | Functions | Branches | Statements | Reason |
|------|-------|-----------|----------|------------|---------|
| `src/utils/**` | 95% | 95% | 90% | 95% | Critical utility functions |
| `src/services/**` | 85% | 85% | 80% | 85% | API and service layers |
| `src/components/auth/**` | 90% | 90% | 85% | 90% | Security-critical components |
| `src/components/ui/**` | 70% | 70% | 65% | 70% | UI components with less logic |
| `src/pages/**` | 60% | 60% | 55% | 60% | Page components with routing |

## Running Coverage

### Basic Commands

```bash
# Run tests with coverage
npm run test:coverage

# Run tests with coverage and check thresholds
npm run test:coverage:check

# Watch mode with coverage
npm run test:coverage:watch

# Coverage with UI
npm run test:coverage:ui

# Generate coverage report only
npm run coverage:report
```

### CI/CD Integration

Coverage is automatically checked in GitHub Actions:
1. Tests run with coverage collection
2. Thresholds are enforced
3. Coverage reports are uploaded to Codecov
4. Badge is generated for README

### Pre-commit Hooks

Coverage is checked before commits via Husky:
- Linting
- Type checking
- Tests with coverage

To skip pre-commit hooks (use sparingly):
```bash
git commit --no-verify
```

## Writing Tests for Coverage

### Best Practices

1. **Test the Happy Path First**
   ```typescript
   it('should handle successful case', () => {
     // Test normal operation
   })
   ```

2. **Test Edge Cases**
   ```typescript
   it('should handle empty input', () => {
     // Test with empty/null/undefined
   })
   ```

3. **Test Error Scenarios**
   ```typescript
   it('should handle API errors gracefully', () => {
     // Mock failures and test error handling
   })
   ```

4. **Use Coverage Reports**
   - Open `coverage/index.html` after running coverage
   - Look for red (uncovered) lines
   - Focus on critical paths first

### Example Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const { user } = render(<MyComponent />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Updated')).toBeInTheDocument()
  })

  it('handles errors gracefully', () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Test error'))
    render(<MyComponent onSubmit={mockFn} />)
    // Test error handling
  })
})
```

## Improving Coverage

### Quick Wins

1. **Test Utility Functions**
   - Pure functions are easiest to test
   - High impact on coverage

2. **Test Error Boundaries**
   - Error cases often missed
   - Important for reliability

3. **Test Conditional Rendering**
   - Each branch needs coverage
   - Use different props/states

### Coverage Exceptions

Some files are excluded from coverage:
- Test files (`*.test.ts`, `*.spec.ts`)
- Type definitions (`*.d.ts`)
- Configuration files (`*.config.*`)
- Index files (barrel exports)
- Test setup and utilities

To exclude a specific line:
```typescript
/* istanbul ignore next */
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info')
}
```

## Troubleshooting

### Coverage Not Meeting Thresholds

1. Check the coverage report:
   ```bash
   npm run test:coverage
   open coverage/index.html
   ```

2. Focus on files with lowest coverage
3. Add tests for uncovered lines
4. Remove dead code

### Coverage Report Not Generated

1. Ensure tests are running:
   ```bash
   npm test
   ```

2. Check for syntax errors in tests
3. Verify setup file is loaded

### False Positives

Sometimes coverage reports incorrect data:
1. Clear coverage cache:
   ```bash
   rm -rf coverage
   npm run test:coverage
   ```

2. Check for dynamic imports
3. Verify source maps are correct

## Resources

- [Vitest Coverage Docs](https://vitest.dev/guide/coverage.html)
- [Testing Best Practices](./TESTING.md)
- [CI/CD Configuration](./.github/workflows/ci.yml)
- [Coverage Configuration](./vitest.config.ts)

## Questions?

If you need help improving coverage:
1. Check existing test examples
2. Ask in team chat
3. Pair with another developer
4. Review coverage reports together