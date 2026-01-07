/**
 * Tests for DSL parser
 */

import { describe, test, expect } from 'bun:test'
import { parse } from './parser.js'

describe('parse', () => {
  // Basic parsing
  test('parses simple definition', () => {
    const program = parse('[methyl] = [C]')
    expect(program.definitions.has('methyl')).toBe(true)
    expect(program.errors).toEqual([])

    const def = program.definitions.get('methyl')
    expect(def).toMatchObject({
      name: 'methyl',
      tokens: ['[C]'],
      line: 1
    })
  })

  test('parses multiple definitions', () => {
    const source = '[methyl] = [C]\n[ethyl] = [C][C]'
    const program = parse(source)
    expect(program.definitions.size).toBe(2)
    expect(program.definitions.has('methyl')).toBe(true)
    expect(program.definitions.has('ethyl')).toBe(true)
  })

  test('ignores comments', () => {
    const source = '# Comment\n[methyl] = [C]'
    const program = parse(source)
    expect(program.definitions.size).toBe(1)
    expect(program.definitions.has('methyl')).toBe(true)
  })

  test('handles inline comments', () => {
    const source = '[methyl] = [C]  # This is a carbon'
    const program = parse(source)
    expect(program.definitions.size).toBe(1)
    expect(program.errors).toEqual([])
  })

  test('handles empty lines', () => {
    const source = '[methyl] = [C]\n\n[ethyl] = [C][C]'
    const program = parse(source)
    expect(program.definitions.size).toBe(2)
  })

  // Error detection
  test('detects duplicate definitions', () => {
    const source = '[methyl] = [C]\n[methyl] = [C][C]'
    const program = parse(source)
    expect(program.errors.length).toBeGreaterThan(0)
    expect(program.errors[0].message).toContain('Duplicate')
  })

  test('detects syntax errors - missing equals', () => {
    const source = '[methyl] [C]'
    const program = parse(source)
    expect(program.errors.length).toBeGreaterThan(0)
    expect(program.errors[0].message).toContain('=')
  })

  test('detects syntax errors - missing tokens', () => {
    const source = '[methyl] ='
    const program = parse(source)
    expect(program.errors.length).toBeGreaterThan(0)
    expect(program.errors[0].message).toContain('at least one token')
  })

  test('detects syntax errors - unexpected token type', () => {
    const source = '[methyl] = =  [C]'
    const program = parse(source)
    expect(program.errors.length).toBeGreaterThan(0)
  })

  // Definition structure
  test('definition includes correct range', () => {
    const program = parse('[methyl] = [C]')
    const def = program.definitions.get('methyl')
    expect(def.range).toBeDefined()
    expect(Array.isArray(def.range)).toBe(true)
    expect(def.range.length).toBe(2)
  })

  test('definition includes line number', () => {
    const source = '\n\n[methyl] = [C]'
    const program = parse(source)
    const def = program.definitions.get('methyl')
    expect(def.line).toBe(3)
  })

  // Complex definitions
  test('parses complex SELFIES tokens', () => {
    const source = '[alcohol] = [C][=O][Branch1][C][O]'
    const program = parse(source)
    const def = program.definitions.get('alcohol')
    expect(def.tokens).toEqual(['[C]', '[=O]', '[Branch1]', '[C]', '[O]'])
  })

  test('handles multiple tokens per definition', () => {
    const source = '[ethanol] = [C][C][O]'
    const program = parse(source)
    const def = program.definitions.get('ethanol')
    expect(def.tokens).toHaveLength(3)
  })

  // Program structure
  test('returns program with definitions map', () => {
    const program = parse('[methyl] = [C]')
    expect(program).toHaveProperty('definitions')
    expect(program.definitions).toBeInstanceOf(Map)
  })

  test('returns program with errors array', () => {
    const program = parse('[methyl] = [C]')
    expect(program).toHaveProperty('errors')
    expect(Array.isArray(program.errors)).toBe(true)
  })

  test('returns program with warnings array', () => {
    const program = parse('[methyl] = [C]')
    expect(program).toHaveProperty('warnings')
    expect(Array.isArray(program.warnings)).toBe(true)
  })

  // Diagnostic structure
  test('diagnostic includes line and column', () => {
    const source = '[methyl] [C]'  // missing =
    const program = parse(source)
    const diag = program.errors[0]
    expect(diag).toMatchObject({
      severity: 'error',
      line: expect.any(Number),
      column: expect.any(Number)
    })
  })

  test('diagnostic includes range', () => {
    const source = '[methyl] [C]'  // missing =
    const program = parse(source)
    const diag = program.errors[0]
    expect(diag.range).toBeDefined()
    expect(Array.isArray(diag.range)).toBe(true)
  })
})
