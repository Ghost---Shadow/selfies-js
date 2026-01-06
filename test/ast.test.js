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
    expect(ast.atoms[0]).toEqual({ element: 'C', capacity: 4, stereo: null })
    expect(ast.atoms[1]).toEqual({ element: 'N', capacity: 3, stereo: null })
    expect(ast.atoms[2]).toEqual({ element: 'O', capacity: 2, stereo: null })
  })

  test('bonds have from, to, and order', () => {
    const ast = decodeToAST('[C][=C][#C]')
    expect(ast.bonds[0]).toEqual({ from: 0, to: 1, order: 2 })
    expect(ast.bonds[1]).toEqual({ from: 1, to: 2, order: 3 })
  })

  test('stereo atoms are captured', () => {
    const ast = decodeToAST('[C@][Cl][Br][F]')
    expect(ast.atoms[0].stereo).toBe('C@')
    expect(ast.atoms[0].element).toBe('C')
  })

  test('branches are reflected in bonds', () => {
    const ast = decodeToAST('[C][C][Branch1][C][C][C]')
    expect(ast.atoms).toBeArrayOfSize(4)
    expect(ast.bonds).toBeArrayOfSize(3)
    // Atom 1 should have bonds to 0, 2, and 3
    const atom1Bonds = ast.bonds.filter(b => b.from === 1 || b.to === 1)
    expect(atom1Bonds.length).toBe(3)
  })

  test('rings are captured', () => {
    const ast = decodeToAST('[C][C][C][C][Ring1][C]')
    expect(ast.rings.length).toBeGreaterThan(0)
  })

  test('dumpAST returns valid JSON', () => {
    const json = dumpAST('[C][C][O]')
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json)
    expect(parsed.atoms).toBeArrayOfSize(3)
  })

  test('AST captures complex structures', () => {
    const ast = decodeToAST('[C][=C][Branch1][C][O][C]')
    expect(ast.atoms.length).toBeGreaterThan(3)
    expect(ast.bonds.length).toBeGreaterThan(2)
    // Check for double bond
    const doubleBond = ast.bonds.find(b => b.order === 2)
    expect(doubleBond).toBeDefined()
  })
})
