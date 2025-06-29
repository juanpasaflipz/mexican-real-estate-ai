/**
 * Central import file for Vitest test utilities
 * Import from this file in your tests to ensure consistency
 * 
 * Example usage:
 * import { describe, it, expect, vi, beforeEach } from '@/test/vitest-imports'
 */

// Core Vitest exports
export {
  // Test structure
  describe,
  it,
  test,
  suite,
  
  // Hooks
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  
  // Assertions
  expect,
  assert,
  
  // Mocking
  vi,
  vitest,
  
  
  // Types
  type MockedFunction,
  type MockedClass,
  type Mock,
  type Mocked,
  type MockInstance,
} from 'vitest'

// Additional test utilities
export type { 
  TestContext,
  Suite,
  Test,
  TaskState,
  TaskMeta,
  RunMode,
  TestOptions,
  TestFunction,
  HookListener,
  HookCleanupCallback,
  RuntimeContext,
  TestAPI,
  SuiteAPI,
  SuiteCollector,
  SuiteHooks,
  SuiteFactory,
  TaskResult,
  TaskResultPack,
  Awaitable,
  Arrayable,
  Nullable,
  MutableArray,
  Constructable,
} from 'vitest'

// Re-export testing library utilities from our custom utils
export * from './utils'