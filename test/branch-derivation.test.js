/**
 * Tests for branch derivation behavior
 */

import { describe, test, expect } from 'bun:test'
import { decodeToAST, decode } from '../src/decoder.js'

describe('Branch derivation', () => {
  test('oversized branch should stop main loop', () => {
    // Branch2 with Q=2 means derive 3 atoms: [O][O][C]
    // After branch, next token [C] should start new branch from root
    // But Q is larger than available atoms, so branch consumes: [O][O][C][C][S]
    // Main loop should not continue after branch completes
    const s = '[C][Branch2][O][O][C][C][S][F][C]'
    const ast = decodeToAST(s)

    expect(ast).toEqual({
      atoms: [
        { element: 'C', capacity: 4, stereo: null },
        { element: 'C', capacity: 4, stereo: null },
        { element: 'C', capacity: 4, stereo: null },
        { element: 'S', capacity: 6, stereo: null },
        { element: 'F', capacity: 1, stereo: null }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 1, to: 2, order: 1 },
        { from: 2, to: 3, order: 1 },
        { from: 3, to: 4, order: 1 }
      ],
      rings: []
    })
  })

  test('nested branch should process Branch tokens recursively', () => {
    // [C@][=Branch1][Branch1][Branch1][C][Br][Cl][F]
    // =Branch1 with Q=1 (from [Branch1]) derives 2 atoms starting from X4
    // But next token is [Branch1] not an atom
    // Should skip the nested Branch tokens and derive actual atoms
    const s = '[C@][=Branch1][Branch1][Branch1][C][Br][Cl][F]'
    const ast = decodeToAST(s)

    expect(ast).toEqual({
      atoms: [
        { element: 'C', capacity: 4, stereo: 'C@' },
        { element: 'Br', capacity: 1, stereo: null },
        { element: 'Cl', capacity: 1, stereo: null },
        { element: 'F', capacity: 1, stereo: null }
      ],
      bonds: [
        { from: 0, to: 1, order: 2 },
        { from: 0, to: 2, order: 1 },
        { from: 0, to: 3, order: 1 }
      ],
      rings: []
    })
  })

  test('branch derivation respects maxDerive parameter', () => {
    // Simple branch with Q=1 means derive 2 atoms
    const s = '[C][C][Branch1][C][C][C]'
    const ast = decodeToAST(s)

    expect(ast).toEqual({
      atoms: [
        { element: 'C', capacity: 4, stereo: null },
        { element: 'C', capacity: 4, stereo: null },
        { element: 'C', capacity: 4, stereo: null },
        { element: 'C', capacity: 4, stereo: null }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 1, to: 2, order: 1 },
        { from: 2, to: 3, order: 1 }
      ],
      rings: []
    })
  })
})
