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
    // Fixed: Now uses [=Branch1] (Q=4) instead of [=N] (Q=11)
    expect(encode('c1ccccc1')).toBe('[C][=C][C][=C][C][=C][Ring1][=Branch1]')
  })

  test('encodes cyclopropane', () => {
    // Fixed: Now uses [Ring1] (Q=1) instead of [=C] (Q=12)
    expect(encode('C1CC1')).toBe('[C][C][C][Ring1][Ring1]')
  })

  // Error cases
  test('throws on empty SMILES', () => {
    expect(() => encode('')).toThrow('Empty SMILES string')
  })

  test('throws on unmatched parenthesis', () => {
    expect(() => encode('C(C')).toThrow('Unmatched parenthesis')
  })

  test('throws on invalid bond at end', () => {
    expect(() => encode('CC=')).toThrow('bond symbol at end')
  })
})
