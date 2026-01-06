/**
 * Tests for molecular formula generation
 *
 * Note: Also see properties.test.js for more tests
 */

import { describe, test, expect } from 'bun:test'
import { getFormula } from './formula.js'

describe('getFormula', () => {
  // TODO: Simple molecules
  test('generates methane formula', () => {
    // TODO: expect(getFormula('[C]')).toBe('CH4')
  })

  test('generates ethane formula', () => {
    // TODO: expect(getFormula('[C][C]')).toBe('C2H6')
  })

  test('generates ethanol formula', () => {
    // TODO: expect(getFormula('[C][C][O]')).toBe('C2H6O')
  })

  test('generates water formula', () => {
    // TODO: expect(getFormula('[O]')).toBe('H2O')
  })

  // TODO: Hill notation rules
  test('puts carbon first', () => {
    // TODO: const formula = getFormula('[N][C][C]')
    // TODO: expect(formula[0]).toBe('C')
  })

  test('puts hydrogen second', () => {
    // TODO: const formula = getFormula('[C][C][O]')
    // TODO: expect(formula).toMatch(/^C\d+H/)
  })

  test('orders other elements alphabetically', () => {
    // TODO: const formula = getFormula('[C][S][N][O]')
    // TODO: After C and H, should be N, O, S (alphabetical)
  })

  test('omits count of 1', () => {
    // TODO: expect(getFormula('[C][O][O]')).toBe('CH2O2')
    // TODO: Not CH2O2 but C, not C1
  })

  test('handles no carbon', () => {
    // TODO: const formula = getFormula('[N][O]')
    // TODO: Should still have H first if present, then alphabetical
  })

  // TODO: Different bond types
  test('accounts for double bonds', () => {
    // TODO: expect(getFormula('[C][=C]')).toBe('C2H4')
    // TODO: Ethene, not ethane
  })

  test('accounts for triple bonds', () => {
    // TODO: expect(getFormula('[C][#C]')).toBe('C2H2')
    // TODO: Acetylene
  })

  // TODO: Complex structures
  test('handles branching', () => {
    // TODO: const formula = getFormula('[C][C][Branch1][C][C][C]')
    // TODO: expect(formula).toBe('C4H10')  // Isobutane
  })

  test('handles rings', () => {
    // TODO: const formula = getFormula('[C][=C][C][=C][C][=C][Ring1][=Branch1]')
    // TODO: expect(formula).toBe('C6H6')  // Benzene
  })

  // TODO: Edge cases
  test('handles single atom', () => {
    // TODO: expect(getFormula('[C]')).toBe('CH4')
  })

  test('handles no hydrogen', () => {
    // TODO: const formula = getFormula('[C][Cl][Cl][Cl][Cl]')
    // TODO: CCl4 - no hydrogen atoms
    // TODO: expect(formula).toBe('CCl4')
  })

  // TODO: Error cases
  test('throws on invalid SELFIES', () => {
    // TODO: expect(() => getFormula('[Xyz]')).toThrow()
  })

  test('throws on malformed SELFIES', () => {
    // TODO: expect(() => getFormula('[C][C')).toThrow()
  })
})
