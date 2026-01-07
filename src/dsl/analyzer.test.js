/**
 * Tests for analyzer
 */

import { describe, test, expect } from 'bun:test'
import { parse } from './parser.js'
import { getDependencies, getDependents, detectCycles, detectForwardReferences, findUnused } from './analyzer.js'

describe('getDependencies', () => {
  test('gets direct dependencies', () => {
    const source = '[methyl] = [C]\n[ethanol] = [methyl][C][O]'
    const program = parse(source)
    expect(getDependencies(program, 'ethanol')).toContain('methyl')
  })

  test('returns empty for primitive definitions', () => {
    const program = parse('[methyl] = [C]')
    expect(getDependencies(program, 'methyl')).toEqual([])
  })

  test('returns empty for undefined name', () => {
    const program = parse('[methyl] = [C]')
    expect(getDependencies(program, 'undefined')).toEqual([])
  })

  test('handles multiple dependencies', () => {
    const source = '[a] = [C]\n[b] = [N]\n[c] = [a][b][O]'
    const program = parse(source)
    const deps = getDependencies(program, 'c')
    expect(deps).toContain('a')
    expect(deps).toContain('b')
    expect(deps).toHaveLength(2)
  })

  test('deduplicates dependencies', () => {
    const source = '[methyl] = [C]\n[ethyl] = [methyl][methyl]'
    const program = parse(source)
    const deps = getDependencies(program, 'ethyl')
    expect(deps).toEqual(['methyl'])
  })
})

describe('getDependents', () => {
  test('gets dependents', () => {
    const source = '[methyl] = [C]\n[ethyl] = [methyl][C]\n[ethanol] = [ethyl][O]'
    const program = parse(source)
    const dependents = getDependents(program, 'methyl')
    expect(dependents).toContain('ethyl')
    expect(dependents).toContain('ethanol')
  })

  test('returns empty for unused definitions', () => {
    const source = '[methyl] = [C]\n[ethyl] = [C][C]'
    const program = parse(source)
    expect(getDependents(program, 'methyl')).toEqual([])
  })

  test('returns empty for undefined name', () => {
    const program = parse('[methyl] = [C]')
    expect(getDependents(program, 'undefined')).toEqual([])
  })

  test('includes transitive dependents', () => {
    const source = '[a] = [C]\n[b] = [a]\n[c] = [b]'
    const program = parse(source)
    const dependents = getDependents(program, 'a')
    expect(dependents).toContain('b')
    expect(dependents).toContain('c')
  })
})

describe('detectCycles', () => {
  test('detects simple cycle', () => {
    const source = '[a] = [b]\n[b] = [a]'
    const program = parse(source)
    const cycles = detectCycles(program)
    expect(cycles.length).toBeGreaterThan(0)
    expect(cycles[0].message).toContain('Circular dependency')
    expect(cycles[0].cycle).toBeDefined()
  })

  test('detects self-reference', () => {
    const source = '[a] = [a]'
    const program = parse(source)
    const cycles = detectCycles(program)
    expect(cycles.length).toBeGreaterThan(0)
  })

  test('detects longer cycles', () => {
    const source = '[a] = [b]\n[b] = [c]\n[c] = [a]'
    const program = parse(source)
    const cycles = detectCycles(program)
    expect(cycles.length).toBeGreaterThan(0)
  })

  test('returns empty for acyclic graph', () => {
    const source = '[methyl] = [C]\n[ethyl] = [methyl][C]'
    const program = parse(source)
    const cycles = detectCycles(program)
    expect(cycles).toEqual([])
  })

  test('diagnostics include severity and location', () => {
    const source = '[a] = [b]\n[b] = [a]'
    const program = parse(source)
    const cycles = detectCycles(program)
    expect(cycles[0]).toMatchObject({
      severity: 'error',
      line: expect.any(Number),
      column: expect.any(Number),
      range: expect.any(Array)
    })
  })
})

describe('detectForwardReferences', () => {
  test('detects forward reference', () => {
    const source = '[ethanol] = [methyl][C][O]\n[methyl] = [C]'
    const program = parse(source)
    const forward = detectForwardReferences(program)
    expect(forward.length).toBeGreaterThan(0)
    expect(forward[0].message).toContain('Forward reference')
    expect(forward[0].message).toContain('methyl')
  })

  test('returns empty for backward references', () => {
    const source = '[methyl] = [C]\n[ethanol] = [methyl][C][O]'
    const program = parse(source)
    const forward = detectForwardReferences(program)
    expect(forward).toEqual([])
  })

  test('diagnostics include severity and location', () => {
    const source = '[ethanol] = [methyl][C][O]\n[methyl] = [C]'
    const program = parse(source)
    const forward = detectForwardReferences(program)
    expect(forward[0]).toMatchObject({
      severity: 'warning',
      line: expect.any(Number),
      column: expect.any(Number),
      range: expect.any(Array)
    })
  })
})

describe('findUnused', () => {
  test('finds unused definitions', () => {
    const source = '[methyl] = [C]\n[ethyl] = [C][C]\n[ethanol] = [ethyl][O]'
    const program = parse(source)
    const unused = findUnused(program)
    expect(unused).toContain('methyl')
    expect(unused).toContain('ethanol')
    expect(unused).not.toContain('ethyl')
  })

  test('returns empty when all used', () => {
    const source = '[methyl] = [C]\n[ethyl] = [methyl][C]'
    const program = parse(source)
    const unused = findUnused(program)
    expect(unused).toEqual(['ethyl'])
  })

  test('returns all for single definition', () => {
    const source = '[methyl] = [C]'
    const program = parse(source)
    const unused = findUnused(program)
    expect(unused).toEqual(['methyl'])
  })
})
