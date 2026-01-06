/**
 * Tests for AST dump functionality
 */

import { describe, test, expect } from 'bun:test'
import { decodeToAST, dumpAST } from '../src/decoder.js'

describe('AST functionality', () => {
  test('decodeToAST returns atoms, bonds, rings', () => {
    const ast = decodeToAST('[C][C][O]')
    expect(ast).toEqual({
      atoms: [
        { element: 'C', capacity: 4, stereo: null },
        { element: 'C', capacity: 4, stereo: null },
        { element: 'O', capacity: 2, stereo: null }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 1, to: 2, order: 1 }
      ],
      rings: []
    })
  })

  test('atoms have element, capacity, and stereo', () => {
    const ast = decodeToAST('[C][N][O]')
    expect(ast).toEqual({
      atoms: [
        { element: 'C', capacity: 4, stereo: null },
        { element: 'N', capacity: 3, stereo: null },
        { element: 'O', capacity: 2, stereo: null }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 1, to: 2, order: 1 }
      ],
      rings: []
    })
  })

  test('bonds have from, to, and order - state machine limits bond order', () => {
    // Bond order is limited by state: after [=C], state=2, so [#C] only gets order 2
    const ast = decodeToAST('[C][=C][#C]')
    expect(ast).toEqual({
      atoms: [
        { element: 'C', capacity: 4, stereo: null },
        { element: 'C', capacity: 4, stereo: null },
        { element: 'C', capacity: 4, stereo: null }
      ],
      bonds: [
        { from: 0, to: 1, order: 2 },
        { from: 1, to: 2, order: 2 }  // Limited by state!
      ],
      rings: []
    })
  })

  test('stereo atoms are captured', () => {
    // After Br (capacity 1), state becomes null, so chain terminates before F
    const ast = decodeToAST('[C@][C][Br]')
    expect(ast).toEqual({
      atoms: [
        { element: 'C', capacity: 4, stereo: 'C@' },
        { element: 'C', capacity: 4, stereo: null },
        { element: 'Br', capacity: 1, stereo: null }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 1, to: 2, order: 1 }
      ],
      rings: []
    })
  })

  test('branches are reflected in bonds', () => {
    const ast = decodeToAST('[C][C][Branch1][C][C][C]')
    expect(ast).toEqual({
      atoms: [
        { element: 'C', capacity: 4, stereo: null },
        { element: 'C', capacity: 4, stereo: null },
        { element: 'C', capacity: 4, stereo: null },
        { element: 'C', capacity: 4, stereo: null }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 1, to: 2, order: 1 },  // Branch
        { from: 1, to: 3, order: 1 }   // Main chain continuation
      ],
      rings: []
    })
  })

  test('rings are captured', () => {
    // Cyclopropane: [C][C][C][Ring1][Branch1] creates ring from atom 2 back to atom 0
    const ast = decodeToAST('[C][C][C][Ring1][Branch1]')
    expect(ast).toEqual({
      atoms: [
        { element: 'C', capacity: 4, stereo: null },
        { element: 'C', capacity: 4, stereo: null },
        { element: 'C', capacity: 4, stereo: null }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 1, to: 2, order: 1 }
      ],
      rings: [
        { from: 0, to: 2, order: 1 }  // Ring closure
      ]
    })
  })

  test('dumpAST returns valid JSON', () => {
    const json = dumpAST('[C][C][O]')
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json)
    expect(parsed).toEqual({
      atoms: [
        { element: 'C', capacity: 4, stereo: null },
        { element: 'C', capacity: 4, stereo: null },
        { element: 'O', capacity: 2, stereo: null }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 1, to: 2, order: 1 }
      ],
      rings: []
    })
  })

  test('AST captures complex structures', () => {
    const ast = decodeToAST('[C][=C][Branch1][C][O][C]')
    expect(ast).toEqual({
      atoms: [
        { element: 'C', capacity: 4, stereo: null },
        { element: 'C', capacity: 4, stereo: null },
        { element: 'O', capacity: 2, stereo: null },
        { element: 'C', capacity: 4, stereo: null }
      ],
      bonds: [
        { from: 0, to: 1, order: 2 },  // Double bond
        { from: 1, to: 2, order: 1 },  // Branch
        { from: 1, to: 3, order: 1 }   // Main chain continuation
      ],
      rings: []
    })
  })
})
