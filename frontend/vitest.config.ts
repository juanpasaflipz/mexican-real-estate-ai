import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false, // Explicitly disable globals for better test clarity
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/index.ts',
        'src/main.tsx',
        'src/vite-env.d.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
        perFile: true
      },
      // Optional: Set stricter thresholds for specific files/patterns
      thresholdAutoUpdate: false, // Prevent automatic threshold updates
      100: false, // Don't require 100% coverage
      clean: true, // Clean coverage results before running tests
      reportsDirectory: './coverage',
      all: true // Include all files, even those not tested
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})