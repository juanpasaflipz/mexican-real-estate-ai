import { defineConfig } from 'vitest/config'
import baseConfig from './vitest.config'

/**
 * Extended coverage configuration with path-specific thresholds
 * Use this for more granular control over coverage requirements
 */
export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    coverage: {
      ...baseConfig.test?.coverage,
      thresholds: {
        // Global thresholds
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
        
        // Per-file thresholds
        perFile: true,
        
        // Path-specific thresholds
        // Critical components require higher coverage
        'src/components/auth/**/*': {
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90
        },
        'src/utils/**/*': {
          lines: 95,
          functions: 95,
          branches: 90,
          statements: 95
        },
        'src/services/**/*': {
          lines: 85,
          functions: 85,
          branches: 80,
          statements: 85
        },
        
        // UI components can have lower thresholds
        'src/components/ui/**/*': {
          lines: 70,
          functions: 70,
          branches: 65,
          statements: 70
        },
        
        // Pages might have lower coverage due to UI logic
        'src/pages/**/*': {
          lines: 60,
          functions: 60,
          branches: 55,
          statements: 60
        }
      }
    }
  }
})