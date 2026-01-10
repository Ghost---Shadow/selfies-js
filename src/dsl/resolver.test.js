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

describe('repeat macro', () => {
  test('repeats a simple token sequence', () => {
    const program = parse('[triple_carbon] = repeat(\'[C]\', 3)')
    expect(resolve(program, 'triple_carbon')).toBe('[C][C][C]')
  })

  test('repeats a complex token sequence', () => {
    const program = parse('[benzene] = repeat(\'[C][=C]\', 3)[Ring1][=Branch1]')
    expect(resolve(program, 'benzene')).toBe('[C][=C][C][=C][C][=C][Ring1][=Branch1]')
  })

  test('repeats with count of 1', () => {
    const program = parse('[single] = repeat(\'[C][O]\', 1)')
    expect(resolve(program, 'single')).toBe('[C][O]')
  })

  test('repeats with count of 0 produces empty sequence', () => {
    const program = parse('[empty] = [C]repeat(\'[O]\', 0)[C]')
    expect(resolve(program, 'empty')).toBe('[C][C]')
  })

  test('repeat with reference to other definition', () => {
    const source = '[unit] = [C][=C]\n[triple] = repeat(\'[unit]\', 3)'
    const program = parse(source)
    expect(resolve(program, 'triple')).toBe('[C][=C][C][=C][C][=C]')
  })

  test('multiple repeat calls in one definition', () => {
    const program = parse('[chain] = repeat(\'[C]\', 2)repeat(\'[O]\', 2)')
    expect(resolve(program, 'chain')).toBe('[C][C][O][O]')
  })

  test('repeat combined with regular tokens', () => {
    const program = parse('[molecule] = [N]repeat(\'[C]\', 3)[O]')
    expect(resolve(program, 'molecule')).toBe('[N][C][C][C][O]')
  })

  test('repeat with nested brackets in pattern', () => {
    const program = parse('[branched] = repeat(\'[C][Branch1][C][O]\', 2)')
    expect(resolve(program, 'branched')).toBe('[C][Branch1][C][O][C][Branch1][C][O]')
  })

  test('throws error on invalid repeat count', () => {
    const program = parse('[bad] = repeat(\'[C]\', -1)')
    expect(() => resolve(program, 'bad')).toThrow(/count must be/)
  })

  test('throws error on non-numeric count', () => {
    const program = parse('[bad] = repeat(\'[C]\', abc)')
    expect(() => resolve(program, 'bad')).toThrow()
  })

  test('throws error on missing arguments', () => {
    const program = parse('[bad] = repeat(\'[C]\')')
    expect(() => resolve(program, 'bad')).toThrow()
  })

  test('throws error on malformed repeat syntax', () => {
    const program = parse('[bad] = repeat([C], 3)')
    expect(() => resolve(program, 'bad')).toThrow()
  })

  test('simple polymer-like chain', () => {
    const source = '[ch2] = [C]\n[polymer_chain] = repeat(\'[ch2]\', 5)'
    const program = parse(source)
    expect(resolve(program, 'polymer_chain')).toBe('[C][C][C][C][C]')
  })

  test('polymer chain with decode', () => {
    const source = '[ch2] = [C]\n[polymer_chain] = repeat(\'[ch2]\', 5)'
    const program = parse(source)
    expect(resolve(program, 'polymer_chain', { decode: true })).toBe('CCCCC')
  })

  test('vinyl chloride monomer units', () => {
    // Each monomer as a branch structure for proper chemistry
    const source = '[monomer] = [C][Branch1][C][Cl][C]\n[polymer] = repeat(\'[monomer]\', 3)'
    const program = parse(source)
    // This creates a branched structure: C(Cl)CC(Cl)CC(Cl)C
    expect(resolve(program, 'polymer')).toBe('[C][Branch1][C][Cl][C][C][Branch1][C][Cl][C][C][Branch1][C][Cl][C]')
  })
})
