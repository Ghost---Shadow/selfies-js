/**
 * Integration tests for DSL parsing and resolution
 */

import { describe, test, expect } from 'bun:test'
import { parse } from './parser.js'
import { resolve, resolveAll } from './resolver.js'
import { getDependencies, getDependents } from './analyzer.js'

describe('DSL Integration', () => {
  test('complete workflow: parse -> resolve', () => {
    const source = `
# Simple definitions
[methyl] = [C]
[ethyl] = [C][C]
[hydroxyl] = [O]

# Composition
[ethanol] = [ethyl][hydroxyl]
`
    const program = parse(source)
    expect(program.errors).toEqual([])
    expect(program.definitions.size).toBe(4)

    expect(resolve(program, 'methyl')).toBe('[C]')
    expect(resolve(program, 'ethyl')).toBe('[C][C]')
    expect(resolve(program, 'hydroxyl')).toBe('[O]')
    expect(resolve(program, 'ethanol')).toBe('[C][C][O]')
  })

  test('resolves with decode option', () => {
    const source = `
[methyl] = [C]
[ethanol] = [methyl][C][O]
`
    const program = parse(source)
    expect(resolve(program, 'ethanol', { decode: true })).toBe('CCO')
  })

  test('handles complex molecule definitions', () => {
    const source = `
[carbonyl] = [=O]
[methyl] = [C]
[acetone] = [methyl][C][carbonyl][methyl]
`
    const program = parse(source)
    expect(resolve(program, 'acetone')).toBe('[C][C][=O][C]')
  })

  test('resolveAll returns all definitions', () => {
    const source = `
[methyl] = [C]
[ethyl] = [methyl][C]
[propyl] = [ethyl][C]
`
    const program = parse(source)
    const all = resolveAll(program)
    expect(all.size).toBe(3)
    expect(all.get('methyl')).toBe('[C]')
    expect(all.get('ethyl')).toBe('[C][C]')
    expect(all.get('propyl')).toBe('[C][C][C]')
  })

  test('dependency analysis', () => {
    const source = `
[methyl] = [C]
[ethyl] = [methyl][C]
[ethanol] = [ethyl][O]
`
    const program = parse(source)

    expect(getDependencies(program, 'ethanol')).toEqual(['ethyl'])
    expect(getDependencies(program, 'ethyl')).toEqual(['methyl'])
    expect(getDependencies(program, 'methyl')).toEqual([])

    const dependents = getDependents(program, 'methyl')
    expect(dependents).toContain('ethyl')
    expect(dependents).toContain('ethanol')
  })

  test('handles branching structures', () => {
    const source = `
[methyl] = [C]
[isobutane] = [C][C][Branch1][C][methyl][methyl]
`
    const program = parse(source)
    expect(resolve(program, 'isobutane')).toBe('[C][C][Branch1][C][C][C]')
  })

  test('handles ring structures', () => {
    const source = `
[benzene] = [C][=C][C][=C][C][=C][Ring1][=Branch1]
`
    const program = parse(source)
    expect(resolve(program, 'benzene')).toBe('[C][=C][C][=C][C][=C][Ring1][=Branch1]')
  })

  test('empty program', () => {
    const program = parse('')
    expect(program.definitions.size).toBe(0)
    expect(program.errors).toEqual([])
  })

  test('program with only comments', () => {
    const program = parse('# Just a comment\n# Another comment')
    expect(program.definitions.size).toBe(0)
    expect(program.errors).toEqual([])
  })

  test('error recovery allows parsing multiple definitions', () => {
    const source = `
[valid] = [C]
[invalid] [C]
[another_valid] = [N]
`
    const program = parse(source)
    expect(program.definitions.has('valid')).toBe(true)
    expect(program.definitions.has('another_valid')).toBe(true)
    expect(program.errors.length).toBeGreaterThan(0)
  })

  test('real-world example: amino acid fragments', () => {
    const source = `
# Basic building blocks
[amino] = [N]
[carboxyl] = [C][=O][O]
[methyl] = [C]
[ethyl] = [methyl][C]

# Amino acid backbone
[backbone] = [amino][C][carboxyl]

# Side chains
[alanine_side] = [methyl]
[valine_side] = [ethyl][Branch1][C][methyl][methyl]

# Complete amino acids
[alanine] = [amino][C][Branch1][C][alanine_side][carboxyl]
`
    const program = parse(source)
    expect(program.errors).toEqual([])

    const alanine = resolve(program, 'alanine')
    expect(alanine).toBe('[N][C][Branch1][C][C][C][=O][O]')
  })
})
