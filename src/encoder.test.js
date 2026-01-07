/**
 * Tests for SMILES encoding
 * NOTE: Encoder is post-MVP, these tests are placeholders
 */

import { describe, test, expect } from 'bun:test'
import { encode } from '../src/encoder.js'

describe('encode', () => {
  // TODO: Basic molecules (POST-MVP)
  test('encodes methane', () => {
    expect(encode('C')).toBe('[C]')
  })

  test('encodes ethane', () => {
    expect(encode('CC')).toBe('[C][C]')
  })

  test('encodes ethanol', () => {
    expect(encode('CCO')).toBe('[C][C][O]')
  })

  // TODO: Bond orders (POST-MVP)
  test('encodes ethene', () => {
    expect(encode('C=C')).toBe('[C][=C]')
  })

  test('encodes acetylene', () => {
    expect(encode('C#C')).toBe('[C][#C]')
  })

  // TODO: Branches (POST-MVP)
  test('encodes isobutane', () => {
    expect(encode('CC(C)C')).toBe('[C][C][Branch1][C][C][C]')
  })

  // TODO: Rings (POST-MVP)
  test('encodes benzene', () => {
    // Note: Using lowercase aromatic SMILES for benzene
    expect(encode('c1ccccc1')).toBe('[C][=C][C][=C][C][=C][Ring1][=N]')
  })

  test('encodes cyclopropane', () => {
    expect(encode('C1CC1')).toBe('[C][C][C][Ring1][=C]')
  })

  // TODO: Error cases (POST-MVP)
  test.skip('throws on invalid SMILES', () => {
    // TODO: expect(() => encode('invalid')).toThrow()
  })
})
