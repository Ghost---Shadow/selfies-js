/**
 * Tests for symbol table
 */

import { describe, test, expect } from 'bun:test'
import { createSymbolTable, addDefinition, lookup, has, getNames } from './symbolTable.js'

describe('symbolTable', () => {
  test('createSymbolTable returns empty map', () => {
    const table = createSymbolTable()
    expect(table).toBeInstanceOf(Map)
    expect(table.size).toBe(0)
  })

  test('addDefinition adds entry', () => {
    const table = createSymbolTable()
    const def = { name: 'test', tokens: ['[C]'], line: 1, range: [0, 5] }
    addDefinition(table, 'test', def)
    expect(table.size).toBe(1)
    expect(table.has('test')).toBe(true)
  })

  test('addDefinition throws on duplicate', () => {
    const table = createSymbolTable()
    const def = { name: 'test', tokens: ['[C]'], line: 1, range: [0, 5] }
    addDefinition(table, 'test', def)
    expect(() => addDefinition(table, 'test', def)).toThrow(/already exists/)
  })

  test('lookup returns definition', () => {
    const table = createSymbolTable()
    const def = { name: 'test', tokens: ['[C]'], line: 1, range: [0, 5] }
    addDefinition(table, 'test', def)
    expect(lookup(table, 'test')).toBe(def)
  })

  test('lookup returns undefined for missing', () => {
    const table = createSymbolTable()
    expect(lookup(table, 'missing')).toBeUndefined()
  })

  test('has returns true for existing', () => {
    const table = createSymbolTable()
    const def = { name: 'test', tokens: ['[C]'], line: 1, range: [0, 5] }
    addDefinition(table, 'test', def)
    expect(has(table, 'test')).toBe(true)
  })

  test('has returns false for missing', () => {
    const table = createSymbolTable()
    expect(has(table, 'missing')).toBe(false)
  })

  test('getNames returns all names', () => {
    const table = createSymbolTable()
    addDefinition(table, 'a', { name: 'a', tokens: ['[C]'], line: 1, range: [0, 5] })
    addDefinition(table, 'b', { name: 'b', tokens: ['[N]'], line: 2, range: [6, 11] })
    const names = getNames(table)
    expect(names).toHaveLength(2)
    expect(names).toContain('a')
    expect(names).toContain('b')
  })

  test('getNames returns empty array for empty table', () => {
    const table = createSymbolTable()
    expect(getNames(table)).toEqual([])
  })
})
