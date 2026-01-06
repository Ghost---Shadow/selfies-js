/**
 * Tests for SELFIES tokenization
 */

import { describe, test, expect } from 'bun:test'
import { tokenize, join } from './tokenizer.js'

describe('tokenize', () => {
  test('tokenizes simple molecule', () => {
    expect(tokenize('[C][C][O]')).toEqual(['[C]', '[C]', '[O]'])
  })

  test('tokenizes with bond modifiers', () => {
    expect(tokenize('[C][=C][Branch1][C][O]')).toEqual(['[C]', '[=C]', '[Branch1]', '[C]', '[O]'])
  })

  test('tokenizes multi-character elements', () => {
    expect(tokenize('[Cl][Br]')).toEqual(['[Cl]', '[Br]'])
  })

  test('tokenizes empty string', () => {
    expect(tokenize('')).toEqual([])
  })

  test('tokenizes single token', () => {
    expect(tokenize('[C]')).toEqual(['[C]'])
  })

  test('throws on unclosed bracket', () => {
    expect(() => tokenize('[C][C')).toThrow()
  })

  test('throws on empty token', () => {
    expect(() => tokenize('[]')).toThrow()
  })
})

describe('join', () => {
  test('joins tokens', () => {
    expect(join(['[C]', '[C]', '[O]'])).toBe('[C][C][O]')
  })

  test('joins empty array', () => {
    expect(join([])).toBe('')
  })

  test('joins single token', () => {
    expect(join(['[C]'])).toBe('[C]')
  })

  test('round-trips tokenize and join', () => {
    const selfies = '[C][=C][C][=C][C][=C][Ring1][=Branch1]'
    expect(join(tokenize(selfies))).toBe(selfies)
  })
})
