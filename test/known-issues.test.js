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

  test.skip('handles extremely long SELFIES strings', () => {
    // TODO: Test with very long molecules (e.g., polymers)
  })

  test.skip('handles maximum branch depth', () => {
    // TODO: Test nested branches at various depths
  })

  test.skip('handles maximum ring size', () => {
    // TODO: Test very large ring structures
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

  test.skip('handles valence overflow gracefully', () => {
    // TODO: Test cases where bond order exceeds available valence
  })

  test.skip('handles rare valence states', () => {
    // TODO: Test elements with multiple valence states
  })
})

describe('DSL edge cases', () => {
  // TODO: DSL parsing edge cases

  test.skip('handles very long definition names', () => {
    // TODO: Test with extremely long identifier names
  })

  test.skip('handles deep nesting in DSL', () => {
    // TODO: Test definitions that reference many levels deep
  })

  test.skip('handles large DSL programs', () => {
    // TODO: Test with hundreds or thousands of definitions
  })
})

describe('Performance regressions', () => {
  // TODO: Add tests that verify performance doesn't regress

  test.skip('decodes 50-token SELFIES in < 1ms', () => {
    // TODO: Benchmark test to catch performance regressions
  })

  test.skip('tokenizes 50-token SELFIES in < 0.1ms', () => {
    // TODO: Benchmark test for tokenizer performance
  })
})
