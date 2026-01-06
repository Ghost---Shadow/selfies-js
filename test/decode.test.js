/**
 * Tests for SELFIES decoding
 */

import { describe, test, expect } from 'bun:test'
import { decode } from '../src/decoder.js'

describe('decode', () => {
  // TODO: Basic molecules
  test('decodes methane', () => {
    // TODO: expect(decode('[C]')).toBe('C')
  })

  test('decodes ethane', () => {
    // TODO: expect(decode('[C][C]')).toBe('CC')
  })

  test('decodes ethanol', () => {
    // TODO: expect(decode('[C][C][O]')).toBe('CCO')
  })

  // TODO: Bond orders
  test('decodes ethene (double bond)', () => {
    // TODO: expect(decode('[C][=C]')).toBe('C=C')
  })

  test('decodes acetylene (triple bond)', () => {
    // TODO: expect(decode('[C][#C]')).toBe('C#C')
  })

  // TODO: Branches
  test('decodes isobutane', () => {
    // TODO: expect(decode('[C][C][Branch1][C][C][C]')).toBe('CC(C)C')
  })

  test('decodes neopentane', () => {
    // TODO: expect(decode('[C][C][Branch1][C][C][Branch1][C][C][C]')).toBe('CC(C)(C)C')
  })

  // TODO: Rings
  test('decodes cyclopropane', () => {
    // TODO: expect(decode('[C][C][C][Ring1][C]')).toBe('C1CC1')
  })

  test('decodes benzene', () => {
    // TODO: expect(decode('[C][=C][C][=C][C][=C][Ring1][=Branch1]')).toBe('C1=CC=CC=C1')
  })

  // TODO: Error cases
  test('throws on invalid token', () => {
    // TODO: expect(() => decode('[Xyz]')).toThrow()
  })

  test('throws on unclosed bracket', () => {
    // TODO: expect(() => decode('[C][C][O')).toThrow()
  })

  test('throws on empty string', () => {
    // TODO: expect(() => decode('')).toThrow()
  })
})
