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
  test('contains required elements', () => {
    expect(ATOMIC_DATA).toHaveProperty('C')
    expect(ATOMIC_DATA).toHaveProperty('N')
    expect(ATOMIC_DATA).toHaveProperty('O')
    expect(ATOMIC_DATA).toHaveProperty('S')
    expect(ATOMIC_DATA).toHaveProperty('P')
    expect(ATOMIC_DATA).toHaveProperty('F')
    expect(ATOMIC_DATA).toHaveProperty('Cl')
    expect(ATOMIC_DATA).toHaveProperty('Br')
    expect(ATOMIC_DATA).toHaveProperty('I')
    expect(ATOMIC_DATA).toHaveProperty('B')
  })

  test('each element has mass and valence', () => {
    for (const [element, data] of Object.entries(ATOMIC_DATA)) {
      expect(data).toHaveProperty('mass')
      expect(data).toHaveProperty('valence')
      expect(data).toHaveProperty('name')
    }
  })
})

describe('getAtomicMass', () => {
  test('returns correct mass for carbon', () => {
    expect(getAtomicMass('C')).toBeCloseTo(12.011, 2)
  })

  test('returns correct mass for oxygen', () => {
    expect(getAtomicMass('O')).toBeCloseTo(15.999, 2)
  })

  test('returns correct mass for nitrogen', () => {
    expect(getAtomicMass('N')).toBeCloseTo(14.007, 2)
  })

  test('throws on unsupported element', () => {
    expect(() => getAtomicMass('Xx')).toThrow()
  })
})

describe('getValence', () => {
  test('returns correct valence for carbon', () => {
    expect(getValence('C')).toBe(4)
  })

  test('returns correct valence for nitrogen', () => {
    expect(getValence('N')).toBe(3)
  })

  test('returns correct valence for oxygen', () => {
    expect(getValence('O')).toBe(2)
  })

  test('returns correct valence for halogens', () => {
    expect(getValence('F')).toBe(1)
    expect(getValence('Cl')).toBe(1)
    expect(getValence('Br')).toBe(1)
    expect(getValence('I')).toBe(1)
  })

  test('throws on unsupported element', () => {
    expect(() => getValence('Xx')).toThrow()
  })
})

describe('isSupported', () => {
  test('returns true for supported elements', () => {
    expect(isSupported('C')).toBe(true)
    expect(isSupported('N')).toBe(true)
    expect(isSupported('O')).toBe(true)
  })

  test('returns false for unsupported elements', () => {
    expect(isSupported('Xx')).toBe(false)
    expect(isSupported('He')).toBe(false)
  })
})

describe('getSupportedElements', () => {
  test('returns array of elements', () => {
    const elements = getSupportedElements()
    expect(Array.isArray(elements)).toBe(true)
    expect(elements.length).toBeGreaterThan(0)
  })

  test('includes all required elements', () => {
    const elements = getSupportedElements()
    expect(elements).toContain('C')
    expect(elements).toContain('N')
    expect(elements).toContain('O')
    expect(elements).toContain('S')
    expect(elements).toContain('P')
  })

  test('includes halogens', () => {
    const elements = getSupportedElements()
    expect(elements).toContain('F')
    expect(elements).toContain('Cl')
    expect(elements).toContain('Br')
    expect(elements).toContain('I')
  })
})
