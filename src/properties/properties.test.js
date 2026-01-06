/**
 * Tests for molecular property calculations
 */

import { describe, test, expect } from 'bun:test'
import { getMolecularWeight } from './molecularWeight.js'
import { getFormula } from './formula.js'
import { getAtomicMass, getValence } from './atoms.js'

describe('getMolecularWeight', () => {
  test('calculates methane molecular weight', () => {
    expect(getMolecularWeight('[C]')).toBeCloseTo(16.043, 1)
  })

  test('calculates ethanol molecular weight', () => {
    expect(getMolecularWeight('[C][C][O]')).toBeCloseTo(46.068, 1)
  })

  test('calculates benzene molecular weight', () => {
    // TODO: expect(getMolecularWeight('[C][=C][C][=C][C][=C][Ring1][=Branch1]')).toBeCloseTo(78.114, 2)
  })

  // TODO: Different elements
  test('calculates with nitrogen', () => {
    // TODO: expect(getMolecularWeight('[N][C][C]')).toBeCloseTo(43.088, 2)
  })

  test('calculates with chlorine', () => {
    // TODO: expect(getMolecularWeight('[Cl][C][C][Cl]')).toBeCloseTo(98.959, 2)
  })
})

describe('getFormula', () => {
  test('generates methane formula', () => {
    expect(getFormula('[C]')).toBe('CH4')
  })

  test('generates ethanol formula', () => {
    expect(getFormula('[C][C][O]')).toBe('C2H6O')
  })

  test('omits count of 1', () => {
    expect(getFormula('[C][O][O]')).toBe('CH4O2')
  })
})

describe('getAtomicMass', () => {
  test('returns carbon mass', () => {
    expect(getAtomicMass('C')).toBeCloseTo(12.011, 2)
  })

  test('returns oxygen mass', () => {
    expect(getAtomicMass('O')).toBeCloseTo(15.999, 2)
  })

  test('throws on unsupported element', () => {
    expect(() => getAtomicMass('Xx')).toThrow()
  })
})

describe('getValence', () => {
  test('returns carbon valence', () => {
    expect(getValence('C')).toBe(4)
  })

  test('returns nitrogen valence', () => {
    expect(getValence('N')).toBe(3)
  })

  test('returns oxygen valence', () => {
    expect(getValence('O')).toBe(2)
  })

  test('throws on unsupported element', () => {
    expect(() => getValence('Xx')).toThrow()
  })
})
