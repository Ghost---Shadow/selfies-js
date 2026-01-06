/**
 * Tests for SELFIES tokenization
 */

import { describe, test, expect } from 'bun:test'
import { tokenize, join } from '../src/tokenizer.js'

describe('tokenize', () => {
  // TODO: Basic tokenization
  test('tokenizes simple molecule', () => {
    // TODO: expect(tokenize('[C][C][O]')).toEqual(['[C]', '[C]', '[O]'])
  })

  test('tokenizes with bond modifiers', () => {
    // TODO: expect(tokenize('[C][=C][Branch1][C][O]')).toEqual(['[C]', '[=C]', '[Branch1]', '[C]', '[O]'])
  })

  test('tokenizes multi-character elements', () => {
    // TODO: expect(tokenize('[Cl][Br]')).toEqual(['[Cl]', '[Br]'])
  })

  // TODO: Edge cases
  test('tokenizes empty string', () => {
    // TODO: expect(tokenize('')).toEqual([])
  })

  test('tokenizes single token', () => {
    // TODO: expect(tokenize('[C]')).toEqual(['[C]'])
  })

  test('throws on unclosed bracket', () => {
    // TODO: expect(() => tokenize('[C][C')).toThrow()
  })

  test('throws on empty token', () => {
    // TODO: expect(() => tokenize('[]')).toThrow()
  })
})

describe('join', () => {
  // TODO: Basic joining
  test('joins tokens', () => {
    // TODO: expect(join(['[C]', '[C]', '[O]'])).toBe('[C][C][O]')
  })

  test('joins empty array', () => {
    // TODO: expect(join([])).toBe('')
  })

  test('joins single token', () => {
    // TODO: expect(join(['[C]'])).toBe('[C]')
  })

  // TODO: Round-trip tests
  test('round-trips tokenize and join', () => {
    // TODO: const selfies = '[C][=C][C][=C][C][=C][Ring1][=Branch1]'
    // TODO: expect(join(tokenize(selfies))).toBe(selfies)
  })
})
