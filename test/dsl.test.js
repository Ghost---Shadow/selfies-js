/**
 * Tests for DSL parsing and resolution
 */

import { describe, test, expect } from 'bun:test'
import { parse } from '../src/dsl/parser.js'
import { resolve, resolveAll } from '../src/dsl/resolver.js'
import { getDependencies, getDependents } from '../src/dsl/analyzer.js'

describe('parse', () => {
  // TODO: Basic parsing
  test('parses simple definition', () => {
    // TODO: const program = parse('[methyl] = [C]')
    // TODO: expect(program.definitions.has('methyl')).toBe(true)
    // TODO: expect(program.errors).toEqual([])
  })

  test('parses multiple definitions', () => {
    // TODO: const source = '[methyl] = [C]\n[ethyl] = [C][C]'
    // TODO: const program = parse(source)
    // TODO: expect(program.definitions.size).toBe(2)
  })

  test('ignores comments', () => {
    // TODO: const source = '# Comment\n[methyl] = [C]'
    // TODO: const program = parse(source)
    // TODO: expect(program.definitions.size).toBe(1)
  })

  // TODO: Error detection
  test('detects duplicate definitions', () => {
    // TODO: const source = '[methyl] = [C]\n[methyl] = [C][C]'
    // TODO: const program = parse(source)
    // TODO: expect(program.errors.length).toBeGreaterThan(0)
  })

  test('detects syntax errors', () => {
    // TODO: const source = '[methyl] [C]'  // missing =
    // TODO: const program = parse(source)
    // TODO: expect(program.errors.length).toBeGreaterThan(0)
  })
})

describe('resolve', () => {
  // TODO: Basic resolution
  test('resolves simple definition', () => {
    // TODO: const program = parse('[methyl] = [C]')
    // TODO: expect(resolve(program, 'methyl')).toBe('[C]')
  })

  test('resolves nested definitions', () => {
    // TODO: const source = '[methyl] = [C]\n[ethyl] = [methyl][C]\n[ethanol] = [ethyl][O]'
    // TODO: const program = parse(source)
    // TODO: expect(resolve(program, 'ethanol')).toBe('[C][C][O]')
  })

  test('resolves with decode option', () => {
    // TODO: const program = parse('[ethanol] = [C][C][O]')
    // TODO: expect(resolve(program, 'ethanol', { decode: true })).toBe('CCO')
  })

  // TODO: Error cases
  test('throws on undefined name', () => {
    // TODO: const program = parse('[methyl] = [C]')
    // TODO: expect(() => resolve(program, 'undefined')).toThrow()
  })

  test('detects circular dependencies', () => {
    // TODO: const source = '[a] = [b]\n[b] = [a]'
    // TODO: const program = parse(source)
    // TODO: expect(() => resolve(program, 'a')).toThrow()
  })
})

describe('resolveAll', () => {
  // TODO: Resolve all definitions
  test('resolves all definitions', () => {
    // TODO: const source = '[methyl] = [C]\n[ethyl] = [methyl][C]'
    // TODO: const program = parse(source)
    // TODO: const resolved = resolveAll(program)
    // TODO: expect(resolved.get('methyl')).toBe('[C]')
    // TODO: expect(resolved.get('ethyl')).toBe('[C][C]')
  })
})

describe('getDependencies', () => {
  // TODO: Dependency analysis
  test('gets direct dependencies', () => {
    // TODO: const source = '[methyl] = [C]\n[ethanol] = [methyl][C][O]'
    // TODO: const program = parse(source)
    // TODO: expect(getDependencies(program, 'ethanol')).toContain('methyl')
  })

  test('returns empty for primitive definitions', () => {
    // TODO: const program = parse('[methyl] = [C]')
    // TODO: expect(getDependencies(program, 'methyl')).toEqual([])
  })
})

describe('getDependents', () => {
  // TODO: Reverse dependencies
  test('gets dependents', () => {
    // TODO: const source = '[methyl] = [C]\n[ethyl] = [methyl][C]\n[ethanol] = [ethyl][O]'
    // TODO: const program = parse(source)
    // TODO: const dependents = getDependents(program, 'methyl')
    // TODO: expect(dependents).toContain('ethyl')
    // TODO: expect(dependents).toContain('ethanol')
  })
})
