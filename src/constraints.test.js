/**
 * Tests for semantic constraints
 */

import { describe, test, expect } from 'bun:test'
import {
  getPresetConstraints,
  getSemanticConstraints,
  setSemanticConstraints,
  getBondingCapacity,
  validateConstraints,
  wouldViolateConstraints,
  resetConstraints
} from './constraints.js'

describe('getPresetConstraints', () => {
  test('returns default preset', () => {
    const constraints = getPresetConstraints('default')
    expect(constraints['C']).toBe(4)
    expect(constraints['N']).toBe(3)
    expect(constraints['O']).toBe(2)
  })

  test('returns octet_rule preset', () => {
    const constraints = getPresetConstraints('octet_rule')
    expect(constraints['S']).toBe(2)  // stricter than default
  })

  test('returns hypervalent preset', () => {
    const constraints = getPresetConstraints('hypervalent')
    expect(constraints['Cl']).toBe(7)  // more permissive
  })

  test('throws on unknown preset', () => {
    expect(() => getPresetConstraints('unknown')).toThrow()
  })
})

describe('getSemanticConstraints', () => {
  test('returns current constraints', () => {
    resetConstraints()
    const constraints = getSemanticConstraints()
    expect(constraints['C']).toBe(4)
  })

  test('returns copy not reference', () => {
    const c1 = getSemanticConstraints()
    const c2 = getSemanticConstraints()
    expect(c1).not.toBe(c2)  // different objects
    expect(c1).toEqual(c2)   // same values
  })
})

describe('setSemanticConstraints', () => {
  test('updates constraints', () => {
    setSemanticConstraints({ 'C': 5, '?': 8 })
    const constraints = getSemanticConstraints()
    expect(constraints['C']).toBe(5)
    resetConstraints()  // Reset after test
  })

  test('validates constraints', () => {
    expect(() => setSemanticConstraints({})).toThrow()  // missing '?'
    expect(() => setSemanticConstraints({ '?': -1 })).toThrow()  // negative
  })
})

describe('getBondingCapacity', () => {
  test('returns capacity for neutral atoms', () => {
    resetConstraints()
    expect(getBondingCapacity('C')).toBe(4)
    expect(getBondingCapacity('N')).toBe(3)
    expect(getBondingCapacity('O')).toBe(2)
  })

  test('returns capacity for charged atoms', () => {
    resetConstraints()
    expect(getBondingCapacity('N', 1)).toBe(4)   // N+1
    expect(getBondingCapacity('O', -1)).toBe(1)  // O-1
  })

  test('returns default for unknown elements', () => {
    resetConstraints()
    expect(getBondingCapacity('Xx')).toBe(8)  // uses '?' default
  })
})

describe('validateConstraints', () => {
  test('accepts valid constraints', () => {
    expect(validateConstraints({ 'C': 4, '?': 8 })).toBe(true)
  })

  test('rejects missing default', () => {
    expect(() => validateConstraints({ 'C': 4 })).toThrow()
  })

  test('rejects negative values', () => {
    expect(() => validateConstraints({ 'C': -1, '?': 8 })).toThrow()
  })

  test('rejects non-integer values', () => {
    expect(() => validateConstraints({ 'C': 4.5, '?': 8 })).toThrow()
  })
})

describe('wouldViolateConstraints', () => {
  test('detects violations', () => {
    resetConstraints()
    expect(wouldViolateConstraints('C', 0, 3, 2)).toBe(true)   // C with 5 bonds
    expect(wouldViolateConstraints('C', 0, 2, 2)).toBe(false)  // C with 4 bonds
  })

  test('handles charged atoms', () => {
    resetConstraints()
    expect(wouldViolateConstraints('N', 1, 3, 2)).toBe(true)   // N+1 with 5 bonds
    expect(wouldViolateConstraints('N', 1, 2, 2)).toBe(false)  // N+1 with 4 bonds
  })
})

describe('resetConstraints', () => {
  test('resets to default preset', () => {
    setSemanticConstraints({ 'C': 10, '?': 8 })
    resetConstraints()
    expect(getSemanticConstraints()['C']).toBe(4)
  })
})
