/**
 * Tests for DSL resolver
 *
 * Note: Also see dsl.test.js for integration tests
 */

import { describe, test, expect } from 'bun:test'
import { parse } from './parser.js'
import { resolve, resolveAll } from './resolver.js'

describe('resolve', () => {
  // TODO: Basic resolution
  test('resolves primitive definition', () => {
    // TODO: const program = parse('[methyl] = [C]')
    // TODO: expect(resolve(program, 'methyl')).toBe('[C]')
  })

  test('resolves nested reference', () => {
    // TODO: const source = '[methyl] = [C]\n[ethyl] = [methyl][C]'
    // TODO: const program = parse(source)
    // TODO: expect(resolve(program, 'ethyl')).toBe('[C][C]')
  })

  test('resolves deeply nested', () => {
    // TODO: const source = '[a] = [C]\n[b] = [a][N]\n[c] = [b][O]'
    // TODO: const program = parse(source)
    // TODO: expect(resolve(program, 'c')).toBe('[C][N][O]')
  })
})

describe('resolve - options', () => {
  // TODO: Decode option
  test('decodes to SMILES when decode=true', () => {
    // TODO: const program = parse('[ethanol] = [C][C][O]')
    // TODO: const result = resolve(program, 'ethanol', { decode: true })
    // TODO: expect(result).toBe('CCO')
  })

  test('returns SELFIES by default', () => {
    // TODO: const program = parse('[ethanol] = [C][C][O]')
    // TODO: const result = resolve(program, 'ethanol')
    // TODO: expect(result).toBe('[C][C][O]')
  })
})

describe('resolve - errors', () => {
  // TODO: Error handling
  test('throws on undefined name', () => {
    // TODO: const program = parse('[methyl] = [C]')
    // TODO: expect(() => resolve(program, 'undefined')).toThrow()
  })

  test('detects circular reference', () => {
    // TODO: const source = '[a] = [b]\n[b] = [a]'
    // TODO: const program = parse(source)
    // TODO: expect(() => resolve(program, 'a')).toThrow()
  })

  test('detects self-reference', () => {
    // TODO: const program = parse('[a] = [a]')
    // TODO: expect(() => resolve(program, 'a')).toThrow()
  })
})

describe('resolveAll', () => {
  // TODO: Resolve all definitions
  test('resolves all definitions', () => {
    // TODO: const source = '[methyl] = [C]\n[ethyl] = [methyl][C]'
    // TODO: const program = parse(source)
    // TODO: const resolved = resolveAll(program)
    // TODO: expect(resolved.size).toBe(2)
    // TODO: expect(resolved.get('methyl')).toBe('[C]')
    // TODO: expect(resolved.get('ethyl')).toBe('[C][C]')
  })

  test('returns Map', () => {
    // TODO: const program = parse('[methyl] = [C]')
    // TODO: const resolved = resolveAll(program)
    // TODO: expect(resolved instanceof Map).toBe(true)
  })

  test('supports decode option', () => {
    // TODO: const program = parse('[ethanol] = [C][C][O]')
    // TODO: const resolved = resolveAll(program, { decode: true })
    // TODO: expect(resolved.get('ethanol')).toBe('CCO')
  })
})
