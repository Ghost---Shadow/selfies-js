/**
 * Tests for atomic data
 */

import { describe, test, expect } from 'bun:test'
import {
  ATOMIC_DATA,
  getAtomicMass,
  getValence,
  isSupported,
  getSupportedElements
} from './atoms.js'

describe('ATOMIC_DATA', () => {
  // TODO: Data structure validation
  test('contains required elements', () => {
    // TODO: expect(ATOMIC_DATA).toHaveProperty('C')
    // TODO: expect(ATOMIC_DATA).toHaveProperty('N')
    // TODO: expect(ATOMIC_DATA).toHaveProperty('O')
    // TODO: expect(ATOMIC_DATA).toHaveProperty('S')
    // TODO: expect(ATOMIC_DATA).toHaveProperty('P')
    // TODO: expect(ATOMIC_DATA).toHaveProperty('F')
    // TODO: expect(ATOMIC_DATA).toHaveProperty('Cl')
    // TODO: expect(ATOMIC_DATA).toHaveProperty('Br')
    // TODO: expect(ATOMIC_DATA).toHaveProperty('I')
    // TODO: expect(ATOMIC_DATA).toHaveProperty('B')
  })

  test('each element has mass and valence', () => {
    // TODO: for (const [element, data] of Object.entries(ATOMIC_DATA)) {
    // TODO:   expect(data).toHaveProperty('mass')
    // TODO:   expect(data).toHaveProperty('valence')
    // TODO:   expect(data).toHaveProperty('name')
    // TODO: }
  })
})

describe('getAtomicMass', () => {
  // TODO: Mass lookup
  test('returns correct mass for carbon', () => {
    // TODO: expect(getAtomicMass('C')).toBeCloseTo(12.011, 2)
  })

  test('returns correct mass for oxygen', () => {
    // TODO: expect(getAtomicMass('O')).toBeCloseTo(15.999, 2)
  })

  test('returns correct mass for nitrogen', () => {
    // TODO: expect(getAtomicMass('N')).toBeCloseTo(14.007, 2)
  })

  test('throws on unsupported element', () => {
    // TODO: expect(() => getAtomicMass('Xx')).toThrow()
  })
})

describe('getValence', () => {
  // TODO: Valence lookup
  test('returns correct valence for carbon', () => {
    // TODO: expect(getValence('C')).toBe(4)
  })

  test('returns correct valence for nitrogen', () => {
    // TODO: expect(getValence('N')).toBe(3)
  })

  test('returns correct valence for oxygen', () => {
    // TODO: expect(getValence('O')).toBe(2)
  })

  test('returns correct valence for halogens', () => {
    // TODO: expect(getValence('F')).toBe(1)
    // TODO: expect(getValence('Cl')).toBe(1)
    // TODO: expect(getValence('Br')).toBe(1)
    // TODO: expect(getValence('I')).toBe(1)
  })

  test('throws on unsupported element', () => {
    // TODO: expect(() => getValence('Xx')).toThrow()
  })
})

describe('isSupported', () => {
  // TODO: Element support checking
  test('returns true for supported elements', () => {
    // TODO: expect(isSupported('C')).toBe(true)
    // TODO: expect(isSupported('N')).toBe(true)
    // TODO: expect(isSupported('O')).toBe(true)
  })

  test('returns false for unsupported elements', () => {
    // TODO: expect(isSupported('Xx')).toBe(false)
    // TODO: expect(isSupported('He')).toBe(false)
  })
})

describe('getSupportedElements', () => {
  // TODO: Get all supported elements
  test('returns array of elements', () => {
    // TODO: const elements = getSupportedElements()
    // TODO: expect(Array.isArray(elements)).toBe(true)
    // TODO: expect(elements.length).toBeGreaterThan(0)
  })

  test('includes all required elements', () => {
    // TODO: const elements = getSupportedElements()
    // TODO: expect(elements).toContain('C')
    // TODO: expect(elements).toContain('N')
    // TODO: expect(elements).toContain('O')
    // TODO: expect(elements).toContain('S')
    // TODO: expect(elements).toContain('P')
  })

  test('includes halogens', () => {
    // TODO: const elements = getSupportedElements()
    // TODO: expect(elements).toContain('F')
    // TODO: expect(elements).toContain('Cl')
    // TODO: expect(elements).toContain('Br')
    // TODO: expect(elements).toContain('I')
  })
})
