/**
 * Tests for SMILES encoding
 * NOTE: Encoder is post-MVP, these tests are placeholders
 */

import { describe, test, expect } from 'bun:test'
import { encode } from '../src/encoder.js'

describe('encode', () => {
  // TODO: Basic molecules (POST-MVP)
  test.skip('encodes methane', () => {
    // TODO: expect(encode('C')).toBe('[C]')
  })

  test.skip('encodes ethane', () => {
    // TODO: expect(encode('CC')).toBe('[C][C]')
  })

  test.skip('encodes ethanol', () => {
    // TODO: expect(encode('CCO')).toBe('[C][C][O]')
  })

  // TODO: Bond orders (POST-MVP)
  test.skip('encodes ethene', () => {
    // TODO: expect(encode('C=C')).toBe('[C][=C]')
  })

  test.skip('encodes acetylene', () => {
    // TODO: expect(encode('C#C')).toBe('[C][#C]')
  })

  // TODO: Branches (POST-MVP)
  test.skip('encodes isobutane', () => {
    // TODO: expect(encode('CC(C)C')).toBe('[C][C][Branch1][C][C][C]')
  })

  // TODO: Rings (POST-MVP)
  test.skip('encodes benzene', () => {
    // TODO: expect(encode('c1ccccc1')).toContain('[Ring1]')
  })

  // TODO: Error cases (POST-MVP)
  test.skip('throws on invalid SMILES', () => {
    // TODO: expect(() => encode('invalid')).toThrow()
  })
})
