/**
 * Tests for grammar rules
 */

import { describe, test, expect } from 'bun:test'
import {
  INDEX_ALPHABET,
  INDEX_CODE,
  processBranchSymbol,
  processRingSymbol,
  nextAtomState,
  nextBranchState,
  nextRingState,
  getIndexFromSelfies,
  getSelfiesFromIndex
} from '../src/grammar_rules.js'

describe('grammar_rules', () => {
  describe('INDEX_ALPHABET and INDEX_CODE', () => {
    test('INDEX_ALPHABET has correct length', () => {
      expect(INDEX_ALPHABET.length).toBe(16)
    })

    test('INDEX_CODE maps correctly', () => {
      expect(INDEX_CODE['[C]']).toBe(0)
      expect(INDEX_CODE['[Ring1]']).toBe(1)
      expect(INDEX_CODE['[Ring2]']).toBe(2)
      expect(INDEX_CODE['[Branch1]']).toBe(3)
      expect(INDEX_CODE['[P]']).toBe(15)
    })
  })

  describe('processBranchSymbol', () => {
    test('processes basic branch symbols', () => {
      expect(processBranchSymbol('[Branch1]')).toEqual({ order: 1, L: 1 })
      expect(processBranchSymbol('[Branch2]')).toEqual({ order: 1, L: 2 })
      expect(processBranchSymbol('[Branch3]')).toEqual({ order: 1, L: 3 })
    })

    test('processes branch symbols with bond modifiers', () => {
      expect(processBranchSymbol('[=Branch1]')).toEqual({ order: 2, L: 1 })
      expect(processBranchSymbol('[#Branch2]')).toEqual({ order: 3, L: 2 })
    })

    test('returns null for invalid symbols', () => {
      expect(processBranchSymbol('[C]')).toBe(null)
      expect(processBranchSymbol('[Branch4]')).toBe(null)
      expect(processBranchSymbol('Branch1')).toBe(null)
    })
  })

  describe('processRingSymbol', () => {
    test('processes basic ring symbols', () => {
      expect(processRingSymbol('[Ring1]')).toEqual({ order: 1, L: 1, stereo: null })
      expect(processRingSymbol('[Ring2]')).toEqual({ order: 1, L: 2, stereo: null })
      expect(processRingSymbol('[Ring3]')).toEqual({ order: 1, L: 3, stereo: null })
    })

    test('processes ring symbols with bond modifiers', () => {
      expect(processRingSymbol('[=Ring1]')).toEqual({ order: 2, L: 1, stereo: null })
      expect(processRingSymbol('[#Ring2]')).toEqual({ order: 3, L: 2, stereo: null })
    })

    test('processes ring symbols with stereo', () => {
      const result = processRingSymbol('[-/Ring1]')
      expect(result.order).toBe(1)
      expect(result.L).toBe(1)
      expect(result.stereo).toEqual(['-', '/'])
    })

    test('returns null for invalid symbols', () => {
      expect(processRingSymbol('[C]')).toBe(null)
      expect(processRingSymbol('[Ring4]')).toBe(null)
      expect(processRingSymbol('Ring1')).toBe(null)
    })
  })

  describe('nextAtomState', () => {
    test('calculates next state correctly', () => {
      // State 0 means no incoming bond, but atom gets full capacity
      expect(nextAtomState(2, 4, 0)).toEqual([0, 4])

      // Normal bonding
      expect(nextAtomState(1, 4, 3)).toEqual([1, 3])
      expect(nextAtomState(2, 4, 3)).toEqual([2, 2])
      expect(nextAtomState(3, 4, 3)).toEqual([3, 1])

      // Bonding capacity limits
      expect(nextAtomState(3, 2, 4)).toEqual([2, null])
      expect(nextAtomState(1, 1, 4)).toEqual([1, null])
    })

    test('returns null when no bonds left', () => {
      expect(nextAtomState(4, 4, 4)).toEqual([4, null])
    })
  })

  describe('nextBranchState', () => {
    test('calculates branch states correctly', () => {
      expect(nextBranchState(1, 3)).toEqual([1, 2])
      expect(nextBranchState(2, 3)).toEqual([2, 1])
      expect(nextBranchState(3, 3)).toEqual([2, 1])
      expect(nextBranchState(1, 4)).toEqual([1, 3])
    })

    test('throws for invalid state', () => {
      expect(() => nextBranchState(1, 1)).toThrow()
      expect(() => nextBranchState(1, 0)).toThrow()
    })
  })

  describe('nextRingState', () => {
    test('calculates ring states correctly', () => {
      expect(nextRingState(1, 3)).toEqual([1, 2])
      expect(nextRingState(2, 3)).toEqual([2, 1])
      expect(nextRingState(3, 3)).toEqual([3, null])
    })

    test('throws for invalid state', () => {
      expect(() => nextRingState(1, 0)).toThrow()
    })
  })

  describe('getIndexFromSelfies', () => {
    test('calculates index from single symbol', () => {
      expect(getIndexFromSelfies(['[C]'])).toBe(0)
      expect(getIndexFromSelfies(['[Ring1]'])).toBe(1)
      expect(getIndexFromSelfies(['[Ring2]'])).toBe(2)
    })

    test('calculates index from multiple symbols', () => {
      // Base-16 calculation: Ring1=1, so [Ring1][C] = 1*16 + 0 = 16
      expect(getIndexFromSelfies(['[Ring1]', '[C]'])).toBe(16)
      // [Ring2][Ring1] = 2*16 + 1 = 33
      expect(getIndexFromSelfies(['[Ring2]', '[Ring1]'])).toBe(33)
    })

    test('handles unknown symbols as 0', () => {
      expect(getIndexFromSelfies(['[Unknown]'])).toBe(0)
    })
  })

  describe('getSelfiesFromIndex', () => {
    test('converts index to symbols', () => {
      expect(getSelfiesFromIndex(0)).toEqual(['[C]'])
      expect(getSelfiesFromIndex(1)).toEqual(['[Ring1]'])
      expect(getSelfiesFromIndex(2)).toEqual(['[Ring2]'])
    })

    test('converts large index to multiple symbols', () => {
      expect(getSelfiesFromIndex(16)).toEqual(['[Ring1]', '[C]'])
      expect(getSelfiesFromIndex(33)).toEqual(['[Ring2]', '[Ring1]'])
    })

    test('throws for negative index', () => {
      expect(() => getSelfiesFromIndex(-1)).toThrow()
    })
  })

  describe('roundtrip index conversion', () => {
    test('roundtrips index <-> symbols', () => {
      for (let i = 0; i < 100; i++) {
        const symbols = getSelfiesFromIndex(i)
        const index = getIndexFromSelfies(symbols)
        expect(index).toBe(i)
      }
    })
  })
})
