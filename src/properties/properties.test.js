/**
 * Tests for molecular property calculations
 */

import { describe, test, expect } from 'bun:test'
import { getMolecularWeight } from '../src/properties/molecularWeight.js'
import { getFormula } from '../src/properties/formula.js'
import { getAtomicMass, getValence } from '../src/properties/atoms.js'

describe('getMolecularWeight', () => {
  // TODO: Basic calculations
  test('calculates methane molecular weight', () => {
    // TODO: expect(getMolecularWeight('[C]')).toBeCloseTo(16.043, 2)
  })

  test('calculates ethanol molecular weight', () => {
    // TODO: expect(getMolecularWeight('[C][C][O]')).toBeCloseTo(46.068, 2)
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
  // TODO: Hill notation
  test('generates methane formula', () => {
    // TODO: expect(getFormula('[C]')).toBe('CH4')
  })

  test('generates ethanol formula', () => {
    // TODO: expect(getFormula('[C][C][O]')).toBe('C2H6O')
  })

  test('generates benzene formula', () => {
    // TODO: expect(getFormula('[C][=C][C][=C][C][=C][Ring1][=Branch1]')).toBe('C6H6')
  })

  // TODO: Hill notation order
  test('puts carbon first', () => {
    // TODO: const formula = getFormula('[N][C][C][=O]')
    // TODO: expect(formula[0]).toBe('C')
  })

  test('puts hydrogen second', () => {
    // TODO: const formula = getFormula('[C][C][O]')
    // TODO: expect(formula).toMatch(/^C\d+H/)
  })

  test('omits count of 1', () => {
    // TODO: expect(getFormula('[C][O][O]')).toBe('CH2O2')  // not C1H2O2
  })
})

describe('getAtomicMass', () => {
  // TODO: Atomic masses
  test('returns carbon mass', () => {
    // TODO: expect(getAtomicMass('C')).toBeCloseTo(12.011, 2)
  })

  test('returns oxygen mass', () => {
    // TODO: expect(getAtomicMass('O')).toBeCloseTo(15.999, 2)
  })

  test('throws on unsupported element', () => {
    // TODO: expect(() => getAtomicMass('Xx')).toThrow()
  })
})

describe('getValence', () => {
  // TODO: Valences
  test('returns carbon valence', () => {
    // TODO: expect(getValence('C')).toBe(4)
  })

  test('returns nitrogen valence', () => {
    // TODO: expect(getValence('N')).toBe(3)
  })

  test('returns oxygen valence', () => {
    // TODO: expect(getValence('O')).toBe(2)
  })

  test('throws on unsupported element', () => {
    // TODO: expect(() => getValence('Xx')).toThrow()
  })
})
