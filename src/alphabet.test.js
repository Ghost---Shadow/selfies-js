/**
 * Tests for SELFIES alphabet
 */

import { describe, test, expect } from 'bun:test'
import { getAlphabet, getSemanticAlphabet, isValidToken, isSemanticRobust } from './alphabet.js'

describe('getAlphabet', () => {
  // TODO: Basic alphabet tests
  test('includes basic atoms', () => {
    // TODO: const alphabet = getAlphabet()
    // TODO: expect(alphabet.has('[C]')).toBe(true)
    // TODO: expect(alphabet.has('[N]')).toBe(true)
    // TODO: expect(alphabet.has('[O]')).toBe(true)
  })

  test('includes bond modifiers', () => {
    // TODO: const alphabet = getAlphabet()
    // TODO: expect(alphabet.has('[=C]')).toBe(true)
    // TODO: expect(alphabet.has('[#N]')).toBe(true)
  })

  test('includes multi-char elements', () => {
    // TODO: const alphabet = getAlphabet()
    // TODO: expect(alphabet.has('[Cl]')).toBe(true)
    // TODO: expect(alphabet.has('[Br]')).toBe(true)
  })

  test('includes structural tokens', () => {
    // TODO: const alphabet = getAlphabet()
    // TODO: expect(alphabet.has('[Branch1]')).toBe(true)
    // TODO: expect(alphabet.has('[Ring1]')).toBe(true)
  })

  test('excludes invalid tokens', () => {
    // TODO: const alphabet = getAlphabet()
    // TODO: expect(alphabet.has('[Xyz]')).toBe(false)
    // TODO: expect(alphabet.has('[123]')).toBe(false)
  })
})

describe('getSemanticAlphabet', () => {
  // TODO: Semantic alphabet tests
  test('includes atoms and bonds only', () => {
    // TODO: const alphabet = getSemanticAlphabet()
    // TODO: expect(alphabet.has('[C]')).toBe(true)
    // TODO: expect(alphabet.has('[=C]')).toBe(true)
  })

  test('excludes structural tokens', () => {
    // TODO: const alphabet = getSemanticAlphabet()
    // TODO: expect(alphabet.has('[Branch1]')).toBe(false)
    // TODO: expect(alphabet.has('[Ring1]')).toBe(false)
  })

  test('is subset of full alphabet', () => {
    // TODO: const full = getAlphabet()
    // TODO: const semantic = getSemanticAlphabet()
    // TODO: for (const token of semantic) {
    // TODO:   expect(full.has(token)).toBe(true)
    // TODO: }
  })
})

describe('isValidToken', () => {
  // TODO: Token validation
  test('validates basic atoms', () => {
    // TODO: expect(isValidToken('[C]')).toBe(true)
    // TODO: expect(isValidToken('[O]')).toBe(true)
  })

  test('rejects invalid tokens', () => {
    // TODO: expect(isValidToken('[Xyz]')).toBe(false)
  })
})

describe('isSemanticRobust', () => {
  // TODO: Semantic robust checking
  test('atoms are semantic robust', () => {
    // TODO: expect(isSemanticRobust('[C]')).toBe(true)
  })

  test('structural tokens are not semantic robust', () => {
    // TODO: expect(isSemanticRobust('[Branch1]')).toBe(false)
  })
})
