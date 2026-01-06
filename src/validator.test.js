/**
 * Tests for SELFIES validation
 */

import { describe, test, expect } from 'bun:test'
import { isValid } from './validator.js'

describe('isValid', () => {
  // TODO: Valid SELFIES
  test('validates simple molecule', () => {
    // TODO: expect(isValid('[C][C][O]')).toBe(true)
  })

  test('validates with bond modifiers', () => {
    // TODO: expect(isValid('[C][=C][C][=C][C][=C][Ring1][=Branch1]')).toBe(true)
  })

  test('validates with branches', () => {
    // TODO: expect(isValid('[C][C][Branch1][C][C][C]')).toBe(true)
  })

  test('validates multi-character elements', () => {
    // TODO: expect(isValid('[Cl][C][Br]')).toBe(true)
  })

  // TODO: Invalid SELFIES
  test('rejects unclosed bracket', () => {
    // TODO: expect(isValid('[C][C][O')).toBe(false)
  })

  test('rejects empty string', () => {
    // TODO: expect(isValid('')).toBe(false)
  })

  test('rejects invalid token', () => {
    // TODO: expect(isValid('[Xyz]')).toBe(false)
  })

  test('rejects empty token', () => {
    // TODO: expect(isValid('[]')).toBe(false)
  })

  test('rejects missing brackets', () => {
    // TODO: expect(isValid('CCO')).toBe(false)
  })
})
