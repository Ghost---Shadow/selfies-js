/**
 * Tests for resolver
 */

import { describe, test, expect } from 'bun:test'
import { parse } from './parser.js'
import { resolve, resolveAll } from './resolver.js'

describe('resolve', () => {
  test('resolves simple definition', () => {
    const program = parse('[methyl] = [C]')
    expect(resolve(program, 'methyl')).toBe('[C]')
  })

  test('resolves nested definitions', () => {
    const source = '[methyl] = [C]\n[ethyl] = [methyl][C]\n[ethanol] = [ethyl][O]'
    const program = parse(source)
    expect(resolve(program, 'ethanol')).toBe('[C][C][O]')
  })

  test('resolves with decode option', () => {
    const program = parse('[ethanol] = [C][C][O]')
    expect(resolve(program, 'ethanol', { decode: true })).toBe('CCO')
  })

  test('handles multiple references in one definition', () => {
    const source = '[methyl] = [C]\n[ethyl] = [methyl][methyl]'
    const program = parse(source)
    expect(resolve(program, 'ethyl')).toBe('[C][C]')
  })

  test('handles deeply nested references', () => {
    const source = '[a] = [C]\n[b] = [a][a]\n[c] = [b][b]\n[d] = [c][c]'
    const program = parse(source)
    expect(resolve(program, 'd')).toBe('[C][C][C][C][C][C][C][C]')
  })

  test('throws on undefined name', () => {
    const program = parse('[methyl] = [C]')
    expect(() => resolve(program, 'undefined')).toThrow(/Undefined definition/)
  })

  test('detects circular dependencies', () => {
    const source = '[a] = [b]\n[b] = [a]'
    const program = parse(source)
    expect(() => resolve(program, 'a')).toThrow(/Circular dependency/)
  })

  test('detects self-referential definitions', () => {
    const source = '[a] = [a]'
    const program = parse(source)
    expect(() => resolve(program, 'a')).toThrow(/Circular dependency/)
  })

  test('detects indirect circular dependencies', () => {
    const source = '[a] = [b]\n[b] = [c]\n[c] = [a]'
    const program = parse(source)
    expect(() => resolve(program, 'a')).toThrow(/Circular dependency/)
  })

  test('resolves mixed primitive and reference tokens', () => {
    const source = '[methyl] = [C]\n[ethanol] = [methyl][C][O]'
    const program = parse(source)
    expect(resolve(program, 'ethanol')).toBe('[C][C][O]')
  })
})

describe('resolveAll', () => {
  test('resolves all definitions', () => {
    const source = '[methyl] = [C]\n[ethyl] = [methyl][C]'
    const program = parse(source)
    const resolved = resolveAll(program)
    expect(resolved.get('methyl')).toBe('[C]')
    expect(resolved.get('ethyl')).toBe('[C][C]')
  })

  test('skips definitions with circular dependencies', () => {
    const source = '[a] = [C]\n[b] = [c]\n[c] = [b]'
    const program = parse(source)
    const resolved = resolveAll(program)
    expect(resolved.get('a')).toBe('[C]')
    expect(resolved.has('b')).toBe(false)
    expect(resolved.has('c')).toBe(false)
  })

  test('resolves all with decode option', () => {
    const source = '[methyl] = [C]\n[ethyl] = [methyl][C]'
    const program = parse(source)
    const resolved = resolveAll(program, { decode: true })
    expect(resolved.get('methyl')).toBe('C')
    expect(resolved.get('ethyl')).toBe('CC')
  })

  test('returns empty map for empty program', () => {
    const program = parse('')
    const resolved = resolveAll(program)
    expect(resolved.size).toBe(0)
  })
})
