import 'vitest'

interface CustomMatchers<R = unknown> {
  toBeWithinRange(floor: number, ceiling: number): R
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}