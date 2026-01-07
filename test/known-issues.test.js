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

  test('handles very long definition names', () => {
    const longName = 'A'.repeat(100)
    const dsl = `[${longName}] = [C][C][O]`
    const program = parse(dsl)
    expect(program.definitions.has(longName)).toBe(true)
    const resolved = resolve(program, longName)
    expect(resolved).toBe('[C][C][O]')
  })

  test('handles deep nesting in DSL', () => {
    const dsl = `
[A] = [C][C]
[B] = [A][A]
[E] = [B][B]
[D] = [E][E]
    `
    const program = parse(dsl)
    expect(program.definitions.has('A')).toBe(true)
    expect(program.definitions.has('B')).toBe(true)
    expect(program.definitions.has('E')).toBe(true)
    expect(program.definitions.has('D')).toBe(true)

    // Resolve D which references E which references B which references A
    // D = [E][E] = [B][B][B][B] = [A][A][A][A][A][A][A][A] = [C][C][C][C][C][C][C][C][C][C][C][C][C][C][C][C]
    const resolved = resolve(program, 'D')
    expect(resolved).toBe('[C][C][C][C][C][C][C][C][C][C][C][C][C][C][C][C]')
  })

  test('handles large DSL programs', () => {
    const definitions = []
    for (let i = 0; i < 100; i++) {
      definitions.push(`[Molecule${i}] = [C][C][O]`)
    }
    const dsl = definitions.join('\n')
    const program = parse(dsl)
    expect(program.definitions.size).toBe(100)
    // Verify all definitions are present and resolvable
    for (let i = 0; i < 100; i++) {
      expect(program.definitions.has(`Molecule${i}`)).toBe(true)
      const resolved = resolve(program, `Molecule${i}`)
      expect(resolved).toBe('[C][C][O]')
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
