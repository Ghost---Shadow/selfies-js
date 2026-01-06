/**
 * Tests for SELFIES validation
 */

import { describe, test, expect } from 'bun:test'
import { isValid } from './validator.js'

describe('isValid', () => {
  test('validates simple molecule', () => {
    expect(isValid('[C][C][O]')).toBe(true)
  })

  test('validates with bond modifiers', () => {
    expect(isValid('[C][=C][C][=C][C][=C][Ring1][=Branch1]')).toBe(true)
  })

  test('validates with branches', () => {
    expect(isValid('[C][C][Branch1][C][C][C]')).toBe(true)
  })

  test('validates multi-character elements', () => {
    expect(isValid('[Cl][C][Br]')).toBe(true)
  })

  test('rejects unclosed bracket', () => {
    expect(isValid('[C][C][O')).toBe(false)
  })

  test('rejects empty string', () => {
    expect(isValid('')).toBe(false)
  })

  test('rejects invalid token', () => {
    expect(isValid('[Xyz]')).toBe(false)
  })

  test('rejects empty token', () => {
    expect(isValid('[]')).toBe(false)
  })

  test('rejects missing brackets', () => {
    expect(isValid('CCO')).toBe(false)
  })
})
