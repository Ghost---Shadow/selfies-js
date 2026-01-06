/**
 * Tests for SELFIES decoding
 */

import { describe, test, expect } from 'bun:test'
import {
  decode,
  parseAtomSymbol,
  readIndexFromTokens,
  deriveBranch,
  processBranchToken,
  processRingToken,
  processAtomToken,
  handleRingClosure,
  assignRingNumbers,
  buildAdjacencyList,
  writeBondSymbol,
  writeRingClosures,
  writeAtomSymbol
} from './decoder.js'

describe('decode', () => {
  test('decodes methane', () => {
    expect(decode('[C]')).toBe('C')
  })

  test('decodes ethane', () => {
    expect(decode('[C][C]')).toBe('CC')
  })

  test('decodes ethanol', () => {
    expect(decode('[C][C][O]')).toBe('CCO')
  })

  test('decodes ethene (double bond)', () => {
    expect(decode('[C][=C]')).toBe('C=C')
  })

  test('decodes acetylene (triple bond)', () => {
    expect(decode('[C][#C]')).toBe('C#C')
  })
})

describe('parseAtomSymbol', () => {
  test('parses simple carbon atom', () => {
    const result = parseAtomSymbol('C')
    expect(result).toEqual({ element: 'C', bondOrder: 1, stereo: null })
  })

  test('parses nitrogen atom', () => {
    const result = parseAtomSymbol('N')
    expect(result).toEqual({ element: 'N', bondOrder: 1, stereo: null })
  })

  test('parses oxygen atom', () => {
    const result = parseAtomSymbol('O')
    expect(result).toEqual({ element: 'O', bondOrder: 1, stereo: null })
  })

  test('parses double bonded carbon', () => {
    const result = parseAtomSymbol('=C')
    expect(result).toEqual({ element: 'C', bondOrder: 2, stereo: null })
  })

  test('parses triple bonded carbon', () => {
    const result = parseAtomSymbol('#C')
    expect(result).toEqual({ element: 'C', bondOrder: 3, stereo: null })
  })

  test('parses chlorine', () => {
    const result = parseAtomSymbol('Cl')
    expect(result).toEqual({ element: 'Cl', bondOrder: 1, stereo: null })
  })

  test('parses bromine', () => {
    const result = parseAtomSymbol('Br')
    expect(result).toEqual({ element: 'Br', bondOrder: 1, stereo: null })
  })

  test('parses carbon with @ stereo', () => {
    const result = parseAtomSymbol('C@')
    expect(result?.element).toBe('C')
    expect(result?.stereo).toBe('C@')
  })

  test('parses carbon with @@ stereo', () => {
    const result = parseAtomSymbol('C@@')
    expect(result?.element).toBe('C')
    expect(result?.stereo).toBe('C@@')
  })

  test('parses carbon with @H stereo', () => {
    const result = parseAtomSymbol('C@H')
    expect(result?.element).toBe('C')
    expect(result?.stereo).toBe('C@H')
  })

  test('returns null for invalid element', () => {
    const result = parseAtomSymbol('Xyz')
    expect(result).toBeNull()
  })

  test('returns null for empty string', () => {
    const result = parseAtomSymbol('')
    expect(result).toBeNull()
  })

  test('handles forward slash prefix', () => {
    const result = parseAtomSymbol('/C')
    expect(result).toEqual({ element: 'C', bondOrder: 1, stereo: null })
  })

  test('handles backslash prefix', () => {
    const result = parseAtomSymbol('\\C')
    expect(result).toEqual({ element: 'C', bondOrder: 1, stereo: null })
  })
})

describe('readIndexFromTokens', () => {
  test('reads single index token', () => {
    const result = readIndexFromTokens(['[C]', '[N]'], 0, 1)
    expect(result.consumed).toBe(1)
    expect(typeof result.value).toBe('number')
  })

  test('returns zero for empty token array', () => {
    const result = readIndexFromTokens([], 0, 1)
    expect(result).toEqual({ value: 0, consumed: 0 })
  })

  test('returns zero when start index is out of bounds', () => {
    const result = readIndexFromTokens(['[C]'], 5, 1)
    expect(result).toEqual({ value: 0, consumed: 0 })
  })

  test('reads multiple tokens', () => {
    const result = readIndexFromTokens(['[C]', '[N]', '[O]'], 0, 2)
    expect(result.consumed).toBe(2)
    expect(typeof result.value).toBe('number')
  })

  test('handles non-index tokens as None', () => {
    const result = readIndexFromTokens(['[C]', '[Branch1]'], 0, 2)
    expect(result.consumed).toBe(2)
  })
})

describe('deriveBranch', () => {
  test('derives single atom branch', () => {
    const atoms = []
    const bonds = []
    const rings = []
    const tokens = ['[C]']

    const result = deriveBranch(tokens, 0, 1, 3, 0, atoms, bonds, rings)

    expect(result.consumed).toBe(1)
    expect(result.derived).toBe(1)
    expect(atoms.length).toBe(1)
    expect(bonds.length).toBe(1)
  })

  test('derives multi-atom branch', () => {
    const atoms = [{ element: 'C', capacity: 4, stereo: null }]
    const bonds = []
    const rings = []
    const tokens = ['[C]', '[C]', '[C]']

    const result = deriveBranch(tokens, 0, 3, 3, 0, atoms, bonds, rings)

    expect(result.consumed).toBe(3)
    expect(result.derived).toBe(3)
    expect(atoms.length).toBe(4)
    expect(bonds.length).toBe(3)
  })

  test('stops when state is zero', () => {
    const atoms = []
    const bonds = []
    const rings = []
    const tokens = ['[C]', '[C]']

    const result = deriveBranch(tokens, 0, 2, 0, null, atoms, bonds, rings)

    expect(result.consumed).toBe(0)
    expect(result.derived).toBe(0)
  })

  test('respects maxDerive limit', () => {
    const atoms = [{ element: 'C', capacity: 4, stereo: null }]
    const bonds = []
    const rings = []
    const tokens = ['[C]', '[C]', '[C]', '[C]']

    const result = deriveBranch(tokens, 0, 2, 3, 0, atoms, bonds, rings)

    expect(result.derived).toBeLessThanOrEqual(2)
  })

  test('skips Branch and Ring tokens', () => {
    const atoms = [{ element: 'C', capacity: 4, stereo: null }]
    const bonds = []
    const rings = []
    const tokens = ['[C]', '[Branch1]', '[Ring1]', '[C]']

    const result = deriveBranch(tokens, 0, 2, 3, 0, atoms, bonds, rings)

    expect(result.consumed).toBeGreaterThan(0)
    expect(atoms.length).toBeGreaterThan(1)
  })
})

describe('processAtomToken', () => {
  test('processes carbon atom', () => {
    const atoms = []
    const bonds = []

    const result = processAtomToken('C', 0, null, atoms, bonds)

    expect(result.consumed).toBe(1)
    expect(result.state).toBeGreaterThan(0)
    expect(result.prevAtomIndex).toBe(0)
    expect(atoms.length).toBe(1)
    expect(atoms[0].element).toBe('C')
  })

  test('processes double bonded carbon', () => {
    const atoms = [{ element: 'C', capacity: 4, stereo: null }]
    const bonds = []

    const result = processAtomToken('=C', 3, 0, atoms, bonds)

    expect(result.consumed).toBe(1)
    expect(atoms.length).toBe(2)
    expect(bonds.length).toBe(1)
    expect(bonds[0].order).toBe(2)
  })

  test('processes triple bonded carbon', () => {
    const atoms = [{ element: 'C', capacity: 4, stereo: null }]
    const bonds = []

    const result = processAtomToken('#C', 3, 0, atoms, bonds)

    expect(result.consumed).toBe(1)
    expect(atoms.length).toBe(2)
    expect(bonds.length).toBe(1)
    expect(bonds[0].order).toBe(3)
  })

  test('returns unchanged state for invalid atom', () => {
    const atoms = []
    const bonds = []

    const result = processAtomToken('Xyz', 3, null, atoms, bonds)

    expect(result.consumed).toBe(1)
    expect(result.state).toBe(3)
    expect(result.prevAtomIndex).toBeNull()
    expect(atoms.length).toBe(0)
  })

  test('does not add bond for first atom', () => {
    const atoms = []
    const bonds = []

    const result = processAtomToken('C', 0, null, atoms, bonds)

    expect(bonds.length).toBe(0)
  })
})

describe('handleRingClosure', () => {
  test('adds new ring closure', () => {
    const bonds = []
    const rings = []

    handleRingClosure(0, 2, 1, bonds, rings)

    expect(rings.length).toBe(1)
    expect(rings[0]).toEqual({ from: 0, to: 2, order: 1 })
  })

  test('increases existing bond order', () => {
    const bonds = [{ from: 0, to: 2, order: 1 }]
    const rings = []

    handleRingClosure(0, 2, 1, bonds, rings)

    expect(bonds[0].order).toBe(2)
    expect(rings.length).toBe(0)
  })

  test('increases existing ring order', () => {
    const bonds = []
    const rings = [{ from: 0, to: 2, order: 1 }]

    handleRingClosure(0, 2, 1, bonds, rings)

    expect(rings[0].order).toBe(2)
    expect(rings.length).toBe(1)
  })

  test('caps bond order at 3', () => {
    const bonds = [{ from: 0, to: 2, order: 3 }]
    const rings = []

    handleRingClosure(0, 2, 2, bonds, rings)

    expect(bonds[0].order).toBe(3)
  })

  test('handles reversed bond direction', () => {
    const bonds = [{ from: 2, to: 0, order: 1 }]
    const rings = []

    handleRingClosure(0, 2, 1, bonds, rings)

    expect(bonds[0].order).toBe(2)
  })
})

describe('assignRingNumbers', () => {
  test('assigns numbers to rings', () => {
    const rings = [
      { from: 0, to: 2, order: 1 },
      { from: 1, to: 3, order: 1 }
    ]

    const ringNumbers = assignRingNumbers(rings)

    expect(ringNumbers.get('0-2')).toBe(1)
    expect(ringNumbers.get('2-0')).toBe(1)
    expect(ringNumbers.get('1-3')).toBe(2)
    expect(ringNumbers.get('3-1')).toBe(2)
  })

  test('handles empty rings array', () => {
    const ringNumbers = assignRingNumbers([])
    expect(ringNumbers.size).toBe(0)
  })

  test('assigns bidirectional mappings', () => {
    const rings = [{ from: 0, to: 5, order: 1 }]

    const ringNumbers = assignRingNumbers(rings)

    expect(ringNumbers.get('0-5')).toBe(ringNumbers.get('5-0'))
  })
})

describe('buildAdjacencyList', () => {
  test('builds adjacency list from bonds', () => {
    const atoms = [
      { element: 'C', capacity: 4, stereo: null },
      { element: 'C', capacity: 4, stereo: null },
      { element: 'C', capacity: 4, stereo: null }
    ]
    const bonds = [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 2 }
    ]

    const adj = buildAdjacencyList(atoms, bonds)

    expect(adj.get(0).length).toBe(1)
    expect(adj.get(0)[0]).toEqual({ to: 1, order: 1 })
    expect(adj.get(1).length).toBe(2)
    expect(adj.get(2).length).toBe(1)
  })

  test('creates entries for all atoms', () => {
    const atoms = [
      { element: 'C', capacity: 4, stereo: null },
      { element: 'C', capacity: 4, stereo: null }
    ]
    const bonds = []

    const adj = buildAdjacencyList(atoms, bonds)

    expect(adj.size).toBe(2)
    expect(adj.get(0)).toEqual([])
    expect(adj.get(1)).toEqual([])
  })
})

describe('writeBondSymbol', () => {
  test('writes single bond (nothing)', () => {
    const smiles = []
    writeBondSymbol(1, smiles)
    expect(smiles).toEqual([])
  })

  test('writes double bond', () => {
    const smiles = []
    writeBondSymbol(2, smiles)
    expect(smiles).toEqual(['='])
  })

  test('writes triple bond', () => {
    const smiles = []
    writeBondSymbol(3, smiles)
    expect(smiles).toEqual(['#'])
  })
})

describe('writeAtomSymbol', () => {
  test('writes simple atom', () => {
    const smiles = []
    const atom = { element: 'C', capacity: 4, stereo: null }
    writeAtomSymbol(atom, smiles)
    expect(smiles).toEqual(['C'])
  })

  test('writes atom with stereo', () => {
    const smiles = []
    const atom = { element: 'C', capacity: 4, stereo: 'C@H' }
    writeAtomSymbol(atom, smiles)
    expect(smiles).toEqual(['[C@H]'])
  })
})

describe('writeRingClosures', () => {
  test('writes opening ring closure', () => {
    const smiles = []
    const rings = [{ from: 0, to: 2, order: 1 }]
    const ringNumbers = new Map([['0-2', 1], ['2-0', 1]])
    const visited = new Set([0])

    writeRingClosures(0, rings, ringNumbers, visited, smiles)

    expect(smiles).toEqual(['1'])
  })

  test('writes closing ring closure', () => {
    const smiles = []
    const rings = [{ from: 0, to: 2, order: 1 }]
    const ringNumbers = new Map([['0-2', 1], ['2-0', 1]])
    const visited = new Set([0, 1, 2])

    writeRingClosures(2, rings, ringNumbers, visited, smiles)

    expect(smiles).toEqual(['1'])
  })

  test('writes double bond ring closure', () => {
    const smiles = []
    const rings = [{ from: 0, to: 2, order: 2 }]
    const ringNumbers = new Map([['0-2', 1], ['2-0', 1]])
    const visited = new Set([0])

    writeRingClosures(0, rings, ringNumbers, visited, smiles)

    expect(smiles).toEqual(['=', '1'])
  })

  test('writes triple bond ring closure', () => {
    const smiles = []
    const rings = [{ from: 0, to: 2, order: 3 }]
    const ringNumbers = new Map([['0-2', 1], ['2-0', 1]])
    const visited = new Set([0])

    writeRingClosures(0, rings, ringNumbers, visited, smiles)

    expect(smiles).toEqual(['#', '1'])
  })
})
