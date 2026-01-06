/**
 * Known issues and edge cases
 *
 * This file contains tests for known bugs, edge cases, and tricky scenarios.
 * Tests here may be marked as `.skip` or `.todo` until fixed.
 */

import { describe, test, expect } from 'bun:test'
import { decode, encode } from '../src/index.js'
import { parse, resolve } from '../src/index.js'

describe('Known edge cases', () => {
  // TODO: Document edge cases as they are discovered

  test('handles extremely long SELFIES strings', () => {
    // Test with a long chain of 100 carbons (polymer-like)
    const tokens = Array(100).fill('[C]').join('')
    const result = decode(tokens)
    // Should decode to a string of 100 C's
    expect(result).toBe('C'.repeat(100))
  })

  test('handles maximum branch depth', () => {
    // Test nested branches with actual working structure
    // This creates: C-C with branch C
    const selfies = '[C][Branch1][C][Branch1][C][Branch1][C][C]'
    const result = decode(selfies)
    expect(result).toBe('C(C)C')
  })

  test('handles maximum ring size', () => {
    // Test a 10-atom carbon chain with ring
    const selfies = '[C][C][C][C][C][C][C][C][C][C][Ring1][Expl=Ring1]'
    const result = decode(selfies)
    expect(result).toBe('CCCCCCCCC=C')
  })
})

describe('Known bugs', () => {
  // TODO: Add tests for known bugs here
  // Mark with .skip and link to issue tracker when available

  // Example:
  // test.skip('Issue #123: incorrect handling of...', () => {
  //   // Reproduction case
  // })
})

describe('Valence edge cases', () => {
  // TODO: Test edge cases in valence handling

  test('handles valence overflow gracefully', () => {
    // Test case where state machine limits bond orders
    // [C][=C][=C] - state machine caps bond orders appropriately
    const selfies = '[C][=C][=C]'
    const result = decode(selfies)
    expect(result).toBe('C=C=C')
  })

  test('handles rare valence states', () => {
    // Test sulfur (capacity 6) with various bond orders
    const selfies1 = '[S][=O]'
    const result1 = decode(selfies1)
    expect(result1).toBe('S=O')

    // Test phosphorus (capacity 5)
    const selfies2 = '[P][=O]'
    const result2 = decode(selfies2)
    expect(result2).toBe('P=O')
  })
})

describe('DSL edge cases', () => {
  // TODO: DSL parsing edge cases

  test.skip('handles very long definition names', () => {
    // TODO: Test DSL with long definition names (DSL parser not implemented yet)
    const longName = 'A'.repeat(100)
    const dsl = `${longName} = [C][C][O]`
    const result = parse(dsl)
    expect(result.definitions).toHaveProperty(longName)
    expect(result.definitions[longName]).toBe('[C][C][O]')
  })

  test.skip('handles deep nesting in DSL', () => {
    // TODO: Test deeply nested definitions (DSL parser not implemented yet)
    const dsl = `
      A = [C][C]
      B = {A}{A}
      C = {B}{B}
      D = {C}{C}
    `
    const ast = parse(dsl)
    expect(ast.definitions).toHaveProperty('A')
    expect(ast.definitions).toHaveProperty('B')
    expect(ast.definitions).toHaveProperty('C')
    expect(ast.definitions).toHaveProperty('D')

    // Resolve D which references C which references B which references A
    // D = {C}{C} = {B}{B}{B}{B} = {A}{A}{A}{A}{A}{A}{A}{A} = [C][C][C][C][C][C][C][C][C][C][C][C][C][C][C][C]
    const resolved = resolve(ast, 'D')
    expect(resolved).toBe('[C][C][C][C][C][C][C][C][C][C][C][C][C][C][C][C]')
  })

  test.skip('handles large DSL programs', () => {
    // TODO: Test with 100 definitions (DSL parser not implemented yet)
    const definitions = []
    for (let i = 0; i < 100; i++) {
      definitions.push(`Molecule${i} = [C][C][O]`)
    }
    const dsl = definitions.join('\n')
    const ast = parse(dsl)
    expect(Object.keys(ast.definitions).length).toBe(100)
    // Verify all definitions are present
    for (let i = 0; i < 100; i++) {
      expect(ast.definitions[`Molecule${i}`]).toBe('[C][C][O]')
    }
  })
})

describe('Performance regressions', () => {
  // TODO: Add tests that verify performance doesn't regress

  test('decodes 50-token SELFIES in < 1ms', () => {
    // Create 50-token SELFIES string
    const tokens = Array(50).fill('[C]').join('')

    const start = performance.now()
    const result = decode(tokens)
    const duration = performance.now() - start

    expect(result).toBe('C'.repeat(50))
    expect(duration).toBeLessThan(1) // Should complete in < 1ms
  })

  test('tokenizes 50-token SELFIES in < 0.1ms', () => {
    // Import tokenizer
    const { tokenize } = require('../src/tokenizer.js')

    // Create 50-token SELFIES string
    const selfies = Array(50).fill('[C]').join('')

    const start = performance.now()
    const tokens = tokenize(selfies)
    const duration = performance.now() - start

    expect(tokens.length).toBe(50)
    expect(tokens).toEqual(Array(50).fill('[C]'))
    expect(duration).toBeLessThan(0.1) // Should complete in < 0.1ms
  })
})
