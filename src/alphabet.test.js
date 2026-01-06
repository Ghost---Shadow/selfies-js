/**
 * Tests for SELFIES alphabet
 */

import { describe, test, expect } from 'bun:test'
import { getAlphabet, getSemanticAlphabet, isValidToken, isSemanticRobust } from './alphabet.js'

describe('getAlphabet', () => {
  test('includes basic atoms', () => {
    const alphabet = getAlphabet()
    expect(alphabet.has('[C]')).toBe(true)
    expect(alphabet.has('[N]')).toBe(true)
    expect(alphabet.has('[O]')).toBe(true)
  })

  test('includes bond modifiers', () => {
    const alphabet = getAlphabet()
    expect(alphabet.has('[=C]')).toBe(true)
    expect(alphabet.has('[#N]')).toBe(true)
  })

  test('includes multi-char elements', () => {
    const alphabet = getAlphabet()
    expect(alphabet.has('[Cl]')).toBe(true)
    expect(alphabet.has('[Br]')).toBe(true)
  })

  test('includes structural tokens', () => {
    const alphabet = getAlphabet()
    expect(alphabet.has('[Branch1]')).toBe(true)
    expect(alphabet.has('[Ring1]')).toBe(true)
  })

  test('excludes invalid tokens', () => {
    const alphabet = getAlphabet()
    expect(alphabet.has('[Xyz]')).toBe(false)
    expect(alphabet.has('[123]')).toBe(false)
  })
})

describe('getSemanticAlphabet', () => {
  test('includes atoms and bonds only', () => {
    const alphabet = getSemanticAlphabet()
    expect(alphabet.has('[C]')).toBe(true)
    expect(alphabet.has('[=C]')).toBe(true)
  })

  test('excludes structural tokens', () => {
    const alphabet = getSemanticAlphabet()
    expect(alphabet.has('[Branch1]')).toBe(false)
    expect(alphabet.has('[Ring1]')).toBe(false)
  })

  test('is subset of full alphabet', () => {
    const full = getAlphabet()
    const semantic = getSemanticAlphabet()
    for (const token of semantic) {
      expect(full.has(token)).toBe(true)
    }
  })
})

describe('isValidToken', () => {
  test('validates basic atoms', () => {
    expect(isValidToken('[C]')).toBe(true)
    expect(isValidToken('[O]')).toBe(true)
  })

  test('rejects invalid tokens', () => {
    expect(isValidToken('[Xyz]')).toBe(false)
  })
})

describe('isSemanticRobust', () => {
  test('atoms are semantic robust', () => {
    expect(isSemanticRobust('[C]')).toBe(true)
  })

  test('structural tokens are not semantic robust', () => {
    expect(isSemanticRobust('[Branch1]')).toBe(false)
  })
})
