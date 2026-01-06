/**
 * Tests for molecular weight calculation
 *
 * Note: Also see properties.test.js for more tests
 */

import { describe, test, expect } from 'bun:test'
import { getMolecularWeight } from './molecularWeight.js'

describe('getMolecularWeight', () => {
  // TODO: Simple molecules
  test('calculates methane (CH4)', () => {
    // TODO: const mw = getMolecularWeight('[C]')
    // TODO: expect(mw).toBeCloseTo(16.043, 2)
  })

  test('calculates ethane (C2H6)', () => {
    // TODO: const mw = getMolecularWeight('[C][C]')
    // TODO: expect(mw).toBeCloseTo(30.070, 2)
  })

  test('calculates ethanol (C2H6O)', () => {
    // TODO: const mw = getMolecularWeight('[C][C][O]')
    // TODO: expect(mw).toBeCloseTo(46.068, 2)
  })

  // TODO: Different elements
  test('includes nitrogen', () => {
    // TODO: const mw = getMolecularWeight('[N][C][C]')
    // TODO: Should include N mass (14.007) + 2 C + H atoms
  })

  test('includes oxygen', () => {
    // TODO: const mw = getMolecularWeight('[C][=O]')
    // TODO: Should calculate formaldehyde (CH2O)
  })

  test('includes sulfur', () => {
    // TODO: const mw = getMolecularWeight('[C][S][C]')
    // TODO: Should include S mass (32.06)
  })

  test('includes halogens', () => {
    // TODO: const mw = getMolecularWeight('[C][Cl]')
    // TODO: Should calculate chloromethane
  })

  // TODO: Implicit hydrogens
  test('accounts for implicit hydrogens', () => {
    // TODO: const mw = getMolecularWeight('[C]')
    // TODO: C has 4 valence, 0 used → 4 H atoms
    // TODO: MW = 12.011 + 4*1.008 = 16.043
  })

  test('reduces H for double bonds', () => {
    // TODO: const mw = getMolecularWeight('[C][=C]')
    // TODO: Ethene: C2H4, not C2H6
  })

  test('reduces H for triple bonds', () => {
    // TODO: const mw = getMolecularWeight('[C][#C]')
    // TODO: Acetylene: C2H2
  })

  // TODO: Complex structures
  test('handles branching', () => {
    // TODO: const mw = getMolecularWeight('[C][C][Branch1][C][C][C]')
    // TODO: Isobutane: C4H10
  })

  test('handles rings', () => {
    // TODO: const mw = getMolecularWeight('[C][=C][C][=C][C][=C][Ring1][=Branch1]')
    // TODO: Benzene: C6H6 = 78.114
  })

  // TODO: Error cases
  test('throws on invalid SELFIES', () => {
    // TODO: expect(() => getMolecularWeight('[Xyz]')).toThrow()
  })

  test('throws on malformed SELFIES', () => {
    // TODO: expect(() => getMolecularWeight('[C][C')).toThrow()
  })
})
