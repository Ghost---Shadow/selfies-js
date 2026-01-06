/**
 * Tests for DSL parser
 *
 * Note: Also see dsl.test.js for integration tests
 */

import { describe, test, expect } from 'bun:test'
import { parse } from './parser.js'

describe('parse - basic structure', () => {
  // TODO: Program structure
  test('returns program object', () => {
    // TODO: const program = parse('[methyl] = [C]')
    // TODO: expect(program).toHaveProperty('definitions')
    // TODO: expect(program).toHaveProperty('errors')
    // TODO: expect(program).toHaveProperty('warnings')
  })

  test('definitions is a Map', () => {
    // TODO: const program = parse('[methyl] = [C]')
    // TODO: expect(program.definitions instanceof Map).toBe(true)
  })

  test('errors is an array', () => {
    // TODO: const program = parse('[methyl] = [C]')
    // TODO: expect(Array.isArray(program.errors)).toBe(true)
  })
})

describe('parse - valid definitions', () => {
  // TODO: Single definition
  test('parses single definition', () => {
    // TODO: const program = parse('[methyl] = [C]')
    // TODO: expect(program.definitions.size).toBe(1)
    // TODO: expect(program.definitions.has('methyl')).toBe(true)
  })

  test('parses multiple definitions', () => {
    // TODO: const source = '[methyl] = [C]\n[ethyl] = [C][C]'
    // TODO: const program = parse(source)
    // TODO: expect(program.definitions.size).toBe(2)
  })

  test('definition has required properties', () => {
    // TODO: const program = parse('[methyl] = [C]')
    // TODO: const def = program.definitions.get('methyl')
    // TODO: expect(def).toHaveProperty('name')
    // TODO: expect(def).toHaveProperty('tokens')
    // TODO: expect(def).toHaveProperty('line')
    // TODO: expect(def).toHaveProperty('range')
  })
})

describe('parse - comments', () => {
  // TODO: Comment handling
  test('ignores comments', () => {
    // TODO: const source = '# Comment\n[methyl] = [C]'
    // TODO: const program = parse(source)
    // TODO: expect(program.definitions.size).toBe(1)
  })

  test('handles inline comments', () => {
    // TODO: const source = '[methyl] = [C]  # inline comment'
    // TODO: const program = parse(source)
    // TODO: expect(program.definitions.size).toBe(1)
  })
})

describe('parse - errors', () => {
  // TODO: Syntax errors
  test('detects missing equals', () => {
    // TODO: const program = parse('[methyl] [C]')
    // TODO: expect(program.errors.length).toBeGreaterThan(0)
  })

  test('detects duplicate definitions', () => {
    // TODO: const source = '[methyl] = [C]\n[methyl] = [N]'
    // TODO: const program = parse(source)
    // TODO: expect(program.errors.length).toBeGreaterThan(0)
  })

  test('error has diagnostic info', () => {
    // TODO: const program = parse('[bad')
    // TODO: const error = program.errors[0]
    // TODO: expect(error).toHaveProperty('message')
    // TODO: expect(error).toHaveProperty('severity')
    // TODO: expect(error).toHaveProperty('line')
    // TODO: expect(error).toHaveProperty('column')
  })
})
