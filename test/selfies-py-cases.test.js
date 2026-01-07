/**
 * Test cases ported from selfies-py to ensure compatibility
 * Source: https://github.com/aspuru-guzik-group/selfies/blob/master/tests/test_specific_cases.py
 */

import { describe, test, expect, beforeAll } from 'bun:test'
import { decode, decodeToAST } from '../src/decoder.js'
import { encode } from '../src/encoder.js'
import { isChemicallyValid, validateRoundtrip } from '../src/chemistryValidator.js'
import { initRDKit } from '../src/renderers/svg.js'

describe('selfies-py compatibility tests', () => {
  describe('basic encoding/decoding', () => {
    test('encodes simple molecules', () => {
      expect(encode('C')).toBe('[C]')
      expect(encode('CC')).toBe('[C][C]')
      expect(encode('CCO')).toBe('[C][C][O]')
    })

    test('encodes molecules with double bonds', () => {
      expect(encode('C=C')).toBe('[C][=C]')
      expect(encode('C=O')).toBe('[C][=O]')
    })

    test('encodes molecules with triple bonds', () => {
      expect(encode('C#C')).toBe('[C][#C]')
      expect(encode('C#N')).toBe('[C][#N]')
    })

    test('decodes simple molecules', () => {
      expect(decode('[C]')).toBe('C')
      expect(decode('[C][C]')).toBe('CC')
      expect(decode('[C][C][O]')).toBe('CCO')
    })

    test('decodes molecules with bond modifiers', () => {
      expect(decode('[C][=C]')).toBe('C=C')
      expect(decode('[C][=O]')).toBe('C=O')
      expect(decode('[C][#C]')).toBe('C#C')
      expect(decode('[C][#N]')).toBe('C#N')
    })

    test('encodes toluene to SELFIES', () => {
      // Fixed: Encoder now correctly separates C and c as different atoms
      // Uses [=Branch1] (Q=4) for ring closure instead of [=N] (Q=11)
      const tolueneSMILES = 'Cc1ccccc1'
      const correctSELFIES = '[C][C][=C][C][=C][C][=C][Ring1][=Branch1]'
      expect(encode(tolueneSMILES)).toBe(correctSELFIES)
    })

    test('decodes toluene SELFIES correctly', () => {
      // Fixed: Now decodes to correct 7-carbon toluene structure
      // Output format is Kekulé notation with explicit double bonds
      const tolueneSELFIES = '[C][C][=C][C][=C][C][=C][Ring1][=Branch1]'
      const decoded = decode(tolueneSELFIES)
      // Should decode to 7-carbon structure (toluene)
      expect(decoded).toBe('CC1=CC=CC=C1')
    })
  })

  describe('branch edge cases', () => {
    test('skips branch symbols at state X0 (beginning)', () => {
      expect(decode('[Branch3][C][S][C][O]')).toBe('CSCO')
      expect(decode('[Ring3][C][S][C][O]')).toBe('CSCO')
      expect(decode('[Branch1][Ring1][Ring3][C][S][C][O]')).toBe('CSCO')
    })

    test('handles branch at end of SELFIES', () => {
      expect(decode('[C][C][C][C][Branch1]')).toBe('CCCC')
      expect(decode('[C][C][C][C][#Branch3]')).toBe('CCCC')
    })

    test('handles branch with no atoms', () => {
      // Branch that contains only structural tokens, no atoms
      expect(decode('[C][Branch1][Ring2][Branch1][Branch1][Branch1][F]')).toBe('CF')
      expect(decode('[C][Branch1][Ring2][Ring1][Ring1][Branch1][F]')).toBe('CF')
    })

    test('encodes branched molecules', () => {
      expect(encode('CC(C)C')).toBe('[C][C][Branch1][C][C][C]')
      // Neopentane: CC(C)(C)C
      expect(encode('CC(C)(C)C')).toBe('[C][C][Branch1][C][C][Branch1][C][C][C]')
    })
  })

  describe('ring edge cases', () => {
    test('handles ring at end of SELFIES', () => {
      // Ring marker at the end should be skipped
      expect(decode('[C][C][C][C][C][Ring1]')).toBe('CCCC=C')
      expect(decode('[C][C][C][C][C][Ring3]')).toBe('CCCC=C')
    })

    test('handles ring on top of existing bond', () => {
      // Ring between adjacent atoms increases bond order
      expect(decode('[C][C][Ring1][C]')).toBe('C=C')
      expect(decode('[C][C][=Ring1][C]')).toBe('C#C')
      expect(decode('[C][C][#Ring1][C]')).toBe('C#C')
    })

    test('handles consecutive rings', () => {
      // Multiple rings on same pair of atoms
      expect(decode('[C][C][C][C][Ring1][Ring2][Ring1][Ring2]')).toBe('C=1CCC=1')
      expect(decode('[C][C][C][C][Ring1][Ring2][Ring1][Ring2][Ring1][Ring2]')).toBe('C#1CCC#1')
      expect(decode('[C][C][C][C][=Ring1][Ring2][Ring1][Ring2]')).toBe('C#1CCC#1')
    })

    test('encodes cyclic molecules', () => {
      // Fixed: Now uses [Ring1] (Q=1) instead of [=C] (Q=12)
      expect(encode('C1CC1')).toBe('[C][C][C][Ring1][Ring1]')
      // Fixed: Benzene now uses [=Branch1] (Q=4) instead of [=N] (Q=11)
      expect(encode('c1ccccc1')).toBe('[C][=C][C][=C][C][=C][Ring1][=Branch1]')
    })
  })

  describe('complex structures', () => {
    test('handles branch and ring decrement state', () => {
      // These test that branches/rings properly modify the derivation state
      expect(decode('[C][C][C][Ring1][Ring1][#C]')).toBe('C1CC1=C')
      expect(decode('[C][=C][C][C][#Ring1][Ring1][#C]')).toBe('C=C#1CC#1')
    })

    test('handles ring immediately following branch', () => {
      const s = '[C][C][C][C][C][C][C][Branch1][Ring2][O][C][O][Ring1][Branch1]'
      expect(decode(s)).toBe('CCC1CCCC1OCO')
    })

    test('handles branch at beginning of branch', () => {
      // Nested branches
      const s = '[C@][=Branch1][Branch1][Branch1][C][Br][Cl][F]'
      const ast = decodeToAST(s)

      // Assert full AST structure
      expect(ast).toEqual({
        atoms: [
          { element: 'C', capacity: 4, stereo: 'C@' },
          { element: 'C', capacity: 4, stereo: null },
          { element: 'Br', capacity: 1, stereo: null },
          { element: 'Cl', capacity: 1, stereo: null }
        ],
        bonds: [
          { from: 0, to: 1, order: 1 },
          { from: 1, to: 2, order: 1 },
          { from: 0, to: 3, order: 1 }
        ],
        rings: []
      })

      expect(decode(s)).toBe('[C@](CBr)Cl')
    })
  })

  describe('two-letter elements', () => {
    test('encodes two-letter elements', () => {
      expect(encode('CCl')).toBe('[C][Cl]')
      expect(encode('CBr')).toBe('[C][Br]')
      expect(encode('C=Cl')).toBe('[C][=Cl]')
    })

    test('decodes two-letter elements', () => {
      expect(decode('[C][Cl]')).toBe('CCl')
      expect(decode('[C][Br]')).toBe('CBr')
      // Cl has capacity 1, so double bond request is capped to single bond
      expect(decode('[C][=Cl]')).toBe('CCl')
    })
  })

  describe('edge cases from python tests', () => {
    test('handles empty branches correctly', () => {
      // Special case: #Branch3 takes atoms but there are no more symbols
      expect(decode('[C][C][C][C][#Branch3][O][O]')).toBe('CCCC')
    })

    test('handles oversized branch', () => {
      // Branch with Q larger than remaining SELFIES length
      const s = '[C][Branch2][O][O][C][C][S][F][C]'
      const ast = decodeToAST(s)

      // Assert full AST structure
      expect(ast).toEqual({
        atoms: [
          { element: 'C', capacity: 4, stereo: null },
          { element: 'C', capacity: 4, stereo: null },
          { element: 'C', capacity: 4, stereo: null },
          { element: 'S', capacity: 6, stereo: null },
          { element: 'F', capacity: 1, stereo: null },
          { element: 'C', capacity: 4, stereo: null }
        ],
        bonds: [
          { from: 0, to: 1, order: 1 },
          { from: 1, to: 2, order: 1 },
          { from: 2, to: 3, order: 1 },
          { from: 3, to: 4, order: 1 },
          { from: 0, to: 5, order: 1 }
        ],
        rings: []
      })

      expect(decode(s)).toBe('C(CCSF)C')
    })

    test('handles oversized ring', () => {
      // Ring with Q so large the target atom doesn't exist
      expect(decode('[C][C][C][C][Ring1][O]')).toBe('C1CCC1')
      expect(decode('[C][C][C][C][Ring2][O][C]')).toBe('C1CCC1')
    })

    test('handles ring to self (should skip)', () => {
      // Ring between 1st atom and 1st atom
      expect(decode('[C][Ring1][O]')).toBe('C')
    })
  })

  describe('roundtrip encoding/decoding', () => {
    beforeAll(async () => {
      await initRDKit()
    })

    test('roundtrips simple molecules', () => {
      const molecules = ['C', 'CC', 'CCO', 'C=C', 'C#C', 'C1CC1']

      for (const smiles of molecules) {
        const selfies = encode(smiles)
        const decoded = decode(selfies)
        // Note: decoded might be canonicalized differently
        expect(decoded).toBeTruthy()
      }
    })

    test('roundtrips produce chemically valid molecules', async () => {
      const molecules = ['C', 'CC', 'CCO', 'C=C', 'C#C', 'C1CC1']

      for (const smiles of molecules) {
        const selfies = encode(smiles)
        const valid = await isChemicallyValid(selfies)
        expect(valid).toBe(true)
      }
    })

    test('roundtrips preserve molecular structure using canonical SMILES', async () => {
      const molecules = ['C', 'CC', 'CCO', 'C=C', 'C#C', 'C1CC1']

      for (const smiles of molecules) {
        const selfies = encode(smiles)
        const valid = await validateRoundtrip(smiles, selfies)
        expect(valid).toBe(true)
      }
    })

    test('roundtrips branched molecules', () => {
      const smiles = 'CC(C)C'
      const selfies = encode(smiles)
      expect(selfies).toBe('[C][C][Branch1][C][C][C]')
      const decoded = decode(selfies)
      expect(decoded).toBe('CC(C)C')
    })

    test('roundtrips branched molecules with chemistry validation', async () => {
      const smiles = 'CC(C)C'
      const selfies = encode(smiles)
      const valid = await validateRoundtrip(smiles, selfies)
      expect(valid).toBe(true)
    })
  })

  describe('error handling', () => {
    test('throws on empty SMILES', () => {
      expect(() => encode('')).toThrow()
    })

    test('throws on unclosed parenthesis', () => {
      expect(() => encode('C(C')).toThrow()
    })

    test('throws on unexpected closing parenthesis', () => {
      expect(() => encode('C)C')).toThrow()
    })

    test('throws on invalid bond at end', () => {
      expect(() => encode('C=')).toThrow()
      expect(() => encode('C#')).toThrow()
    })
  })

  describe('aromatic systems', () => {
    beforeAll(async () => {
      await initRDKit()
    })

    test('handles aromatic benzene', () => {
      // Aromatic carbons with ring
      // Fixed: Now uses [=Branch1] (Q=4) for proper ring closure
      const selfies = encode('c1ccccc1')
      expect(selfies).toBe('[C][=C][C][=C][C][=C][Ring1][=Branch1]')
    })

    test('aromatic benzene is chemically valid', async () => {
      const selfies = encode('c1ccccc1')
      const valid = await isChemicallyValid(selfies)
      expect(valid).toBe(true)
    })

    test('aromatic benzene roundtrip preserves structure', async () => {
      const selfies = encode('c1ccccc1')
      const valid = await validateRoundtrip('c1ccccc1', selfies)
      expect(valid).toBe(true)
    })

    test('encodes toluene (methylbenzene)', () => {
      // Fixed: Now correctly encodes C and c as separate atoms
      // Uses [=Branch1] (Q=4) for ring closure, not [=N] (Q=11)
      const selfies = encode('Cc1ccccc1')
      expect(selfies).toBe('[C][C][=C][C][=C][C][=C][Ring1][=Branch1]')
    })

    test('toluene is chemically valid', async () => {
      // Fixed: Now decodes to correct 7-carbon toluene molecule
      const selfies = encode('Cc1ccccc1')
      const valid = await isChemicallyValid(selfies)
      expect(valid).toBe(true)
    })

    test('toluene roundtrip preserves structure', async () => {
      // Fixed: Roundtrip now correctly preserves toluene structure
      const selfies = encode('Cc1ccccc1')
      const valid = await validateRoundtrip('Cc1ccccc1', selfies)
      expect(valid).toBe(true)
    })

    test('handles aromatic pyrrole', () => {
      // Five-membered aromatic with N
      const selfies = encode('c1cc[nH]c1')
      // Should alternate bonds and handle N
      expect(selfies).toContain('[N')
      expect(selfies).toContain('Ring1')
    })

    test('aromatic pyrrole is chemically valid', async () => {
      const selfies = encode('c1cc[nH]c1')
      const valid = await isChemicallyValid(selfies)
      expect(valid).toBe(true)
    })
  })

  describe('multi-element support', () => {
    test('encodes nitrogen-containing molecules', () => {
      expect(encode('CN')).toBe('[C][N]')
      expect(encode('C=N')).toBe('[C][=N]')
      expect(encode('C#N')).toBe('[C][#N]')
    })

    test('encodes sulfur-containing molecules', () => {
      expect(encode('CS')).toBe('[C][S]')
      expect(encode('C=S')).toBe('[C][=S]')
    })

    test('encodes phosphorus-containing molecules', () => {
      expect(encode('CP')).toBe('[C][P]')
      expect(encode('C=P')).toBe('[C][=P]')
    })

    test('encodes halogen-containing molecules', () => {
      expect(encode('CF')).toBe('[C][F]')
      expect(encode('CCl')).toBe('[C][Cl]')
      expect(encode('CBr')).toBe('[C][Br]')
      expect(encode('CI')).toBe('[C][I]')
    })
  })
})
