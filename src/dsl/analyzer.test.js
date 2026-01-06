/**
 * Tests for DSL analyzer
 *
 * Note: Also see dsl.test.js for integration tests
 */

import { describe, test, expect } from 'bun:test'
import { parse } from './parser.js'
import {
  getDependencies,
  getDependents,
  detectCycles,
  detectForwardReferences,
  findUnused
} from './analyzer.js'

describe('getDependencies', () => {
  // TODO: Dependency extraction
  test('returns empty for primitive', () => {
    // TODO: const program = parse('[methyl] = [C]')
    // TODO: expect(getDependencies(program, 'methyl')).toEqual([])
  })

  test('returns direct dependencies', () => {
    // TODO: const source = '[methyl] = [C]\n[ethanol] = [methyl][C][O]'
    // TODO: const program = parse(source)
    // TODO: const deps = getDependencies(program, 'ethanol')
    // TODO: expect(deps).toContain('methyl')
  })

  test('finds multiple dependencies', () => {
    // TODO: const source = '[a] = [C]\n[b] = [N]\n[c] = [a][b]'
    // TODO: const program = parse(source)
    // TODO: const deps = getDependencies(program, 'c')
    // TODO: expect(deps).toContain('a')
    // TODO: expect(deps).toContain('b')
  })
})

describe('getDependents', () => {
  // TODO: Reverse dependencies
  test('returns empty for unused', () => {
    // TODO: const program = parse('[unused] = [C]')
    // TODO: expect(getDependents(program, 'unused')).toEqual([])
  })

  test('finds direct dependents', () => {
    // TODO: const source = '[methyl] = [C]\n[ethanol] = [methyl][C][O]'
    // TODO: const program = parse(source)
    // TODO: const deps = getDependents(program, 'methyl')
    // TODO: expect(deps).toContain('ethanol')
  })

  test('finds all dependents', () => {
    // TODO: const source = '[a] = [C]\n[b] = [a][N]\n[c] = [a][O]'
    // TODO: const program = parse(source)
    // TODO: const deps = getDependents(program, 'a')
    // TODO: expect(deps).toContain('b')
    // TODO: expect(deps).toContain('c')
  })
})

describe('detectCycles', () => {
  // TODO: Cycle detection
  test('detects direct cycle', () => {
    // TODO: const source = '[a] = [b]\n[b] = [a]'
    // TODO: const program = parse(source)
    // TODO: const cycles = detectCycles(program)
    // TODO: expect(cycles.length).toBeGreaterThan(0)
  })

  test('detects self-reference', () => {
    // TODO: const program = parse('[a] = [a]')
    // TODO: const cycles = detectCycles(program)
    // TODO: expect(cycles.length).toBeGreaterThan(0)
  })

  test('detects longer cycle', () => {
    // TODO: const source = '[a] = [b]\n[b] = [c]\n[c] = [a]'
    // TODO: const program = parse(source)
    // TODO: const cycles = detectCycles(program)
    // TODO: expect(cycles.length).toBeGreaterThan(0)
  })

  test('returns empty for acyclic', () => {
    // TODO: const source = '[a] = [C]\n[b] = [a][N]'
    // TODO: const program = parse(source)
    // TODO: const cycles = detectCycles(program)
    // TODO: expect(cycles).toEqual([])
  })
})

describe('detectForwardReferences', () => {
  // TODO: Forward reference detection
  test('detects forward reference', () => {
    // TODO: const source = '[a] = [b]\n[b] = [C]'
    // TODO: const program = parse(source)
    // TODO: const forward = detectForwardReferences(program)
    // TODO: expect(forward.length).toBeGreaterThan(0)
  })

  test('returns empty for correct order', () => {
    // TODO: const source = '[b] = [C]\n[a] = [b]'
    // TODO: const program = parse(source)
    // TODO: const forward = detectForwardReferences(program)
    // TODO: expect(forward).toEqual([])
  })
})

describe('findUnused', () => {
  // TODO: Unused definition detection
  test('finds unused definitions', () => {
    // TODO: const source = '[unused] = [C]\n[used] = [C]\n[ref] = [used]'
    // TODO: const program = parse(source)
    // TODO: const unused = findUnused(program)
    // TODO: expect(unused).toContain('unused')
    // TODO: expect(unused).not.toContain('used')
  })

  test('returns empty when all used', () => {
    // TODO: const source = '[a] = [C]\n[b] = [a]'
    // TODO: const program = parse(source)
    // TODO: const unused = findUnused(program)
    // TODO: expect(unused).toEqual([])
  })
})
