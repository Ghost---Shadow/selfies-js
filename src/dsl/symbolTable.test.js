/**
 * Tests for DSL symbol table
 */

import { describe, test, expect } from 'bun:test'
import {
  createSymbolTable,
  addDefinition,
  lookup,
  has,
  getNames
} from './symbolTable.js'

describe('createSymbolTable', () => {
  // TODO: Create empty table
  test('creates empty symbol table', () => {
    // TODO: const table = createSymbolTable()
    // TODO: expect(table instanceof Map).toBe(true)
    // TODO: expect(table.size).toBe(0)
  })
})

describe('addDefinition', () => {
  // TODO: Add definitions
  test('adds definition to table', () => {
    // TODO: const table = createSymbolTable()
    // TODO: const def = { name: 'methyl', tokens: ['[C]'], line: 1 }
    // TODO: addDefinition(table, 'methyl', def)
    // TODO: expect(table.size).toBe(1)
  })

  test('throws on duplicate', () => {
    // TODO: const table = createSymbolTable()
    // TODO: const def = { name: 'methyl', tokens: ['[C]'], line: 1 }
    // TODO: addDefinition(table, 'methyl', def)
    // TODO: expect(() => addDefinition(table, 'methyl', def)).toThrow()
  })
})

describe('lookup', () => {
  // TODO: Lookup definitions
  test('finds existing definition', () => {
    // TODO: const table = createSymbolTable()
    // TODO: const def = { name: 'methyl', tokens: ['[C]'], line: 1 }
    // TODO: addDefinition(table, 'methyl', def)
    // TODO: expect(lookup(table, 'methyl')).toBe(def)
  })

  test('returns undefined for missing', () => {
    // TODO: const table = createSymbolTable()
    // TODO: expect(lookup(table, 'missing')).toBeUndefined()
  })
})

describe('has', () => {
  // TODO: Check existence
  test('returns true for existing', () => {
    // TODO: const table = createSymbolTable()
    // TODO: const def = { name: 'methyl', tokens: ['[C]'], line: 1 }
    // TODO: addDefinition(table, 'methyl', def)
    // TODO: expect(has(table, 'methyl')).toBe(true)
  })

  test('returns false for missing', () => {
    // TODO: const table = createSymbolTable()
    // TODO: expect(has(table, 'missing')).toBe(false)
  })
})

describe('getNames', () => {
  // TODO: Get all names
  test('returns empty array for empty table', () => {
    // TODO: const table = createSymbolTable()
    // TODO: expect(getNames(table)).toEqual([])
  })

  test('returns all definition names', () => {
    // TODO: const table = createSymbolTable()
    // TODO: addDefinition(table, 'a', { name: 'a', tokens: [] })
    // TODO: addDefinition(table, 'b', { name: 'b', tokens: [] })
    // TODO: const names = getNames(table)
    // TODO: expect(names).toContain('a')
    // TODO: expect(names).toContain('b')
  })
})
