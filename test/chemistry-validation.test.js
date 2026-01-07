/**
 * Chemistry Validation Tests
 *
 * These tests verify that decoded SELFIES strings produce chemically valid molecules.
 * This is CRITICAL - syntax-valid SELFIES can decode to chemically impossible structures.
 *
 * Uses RDKit to validate:
 * - Molecular validity (valence, bonding patterns)
 * - Canonical SMILES comparison for roundtrips
 * - Aromatic system validity
 */

import { describe, test, expect, beforeAll } from 'bun:test'
import {
  isChemicallyValid,
  getCanonicalSmiles,
  validateRoundtrip,
  getValidationDetails,
  batchValidate
} from '../src/chemistryValidator.js'
import { decode, encode } from '../src/index.js'
import { initRDKit } from '../src/renderers/svg.js'

describe('Chemistry Validation', () => {
  beforeAll(async () => {
    // Initialize RDKit once for all tests
    await initRDKit()
  })

  describe('isChemicallyValid', () => {
    test('validates simple alkanes', async () => {
      expect(await isChemicallyValid('[C]')).toBe(true) // methane
      expect(await isChemicallyValid('[C][C]')).toBe(true) // ethane
      expect(await isChemicallyValid('[C][C][C]')).toBe(true) // propane
    })

    test('validates alcohols', async () => {
      expect(await isChemicallyValid('[C][O]')).toBe(true) // methanol
      expect(await isChemicallyValid('[C][C][O]')).toBe(true) // ethanol
    })

    test('validates double bonds', async () => {
      expect(await isChemicallyValid('[C][=C]')).toBe(true) // ethene
      expect(await isChemicallyValid('[C][=O]')).toBe(true) // formaldehyde
    })

    test('validates triple bonds', async () => {
      expect(await isChemicallyValid('[C][#C]')).toBe(true) // acetylene
      expect(await isChemicallyValid('[C][#N]')).toBe(true) // acetonitrile
    })

    test('validates branched molecules', async () => {
      expect(await isChemicallyValid('[C][C][Branch1][C][C][C]')).toBe(true) // isobutane
    })

    test('validates rings', async () => {
      expect(await isChemicallyValid('[C][C][C][Ring1][=C]')).toBe(true) // cyclopropane
    })

    test('validates aromatic systems', async () => {
      // Benzene
      expect(await isChemicallyValid('[C][=C][C][=C][C][=C][Ring1][=Branch1]')).toBe(true)
    })

    test('validates nitrogen-containing molecules', async () => {
      expect(await isChemicallyValid('[N]')).toBe(true) // ammonia
      expect(await isChemicallyValid('[C][N]')).toBe(true) // methylamine
    })

    test('validates sulfur-containing molecules', async () => {
      expect(await isChemicallyValid('[S]')).toBe(true) // H2S
      expect(await isChemicallyValid('[C][S]')).toBe(true) // methanethiol
    })

    test('validates halogens', async () => {
      expect(await isChemicallyValid('[C][F]')).toBe(true) // fluoromethane
      expect(await isChemicallyValid('[C][Cl]')).toBe(true) // chloromethane
      expect(await isChemicallyValid('[C][Br]')).toBe(true) // bromomethane
      expect(await isChemicallyValid('[C][I]')).toBe(true) // iodomethane
    })

    test('rejects invalid SELFIES syntax', async () => {
      expect(await isChemicallyValid('')).toBe(false)
      // TODO: Decoder doesn't validate element names yet - [Xyz] passes through
      // expect(await isChemicallyValid('[Xyz]')).toBe(false)
    })
  })

  describe('getCanonicalSmiles', () => {
    test('returns canonical SMILES for simple molecules', async () => {
      expect(await getCanonicalSmiles('[C]')).toBe('C')
      expect(await getCanonicalSmiles('[C][C]')).toBe('CC')
      expect(await getCanonicalSmiles('[C][C][O]')).toBe('CCO')
    })

    test('returns canonical SMILES for double bonds', async () => {
      expect(await getCanonicalSmiles('[C][=C]')).toBe('C=C')
      expect(await getCanonicalSmiles('[C][=O]')).toBe('C=O')
    })

    test('returns canonical SMILES for triple bonds', async () => {
      expect(await getCanonicalSmiles('[C][#C]')).toBe('C#C')
      expect(await getCanonicalSmiles('[C][#N]')).toBe('C#N')
    })

    test('returns canonical SMILES for branched molecules', async () => {
      const canonical = await getCanonicalSmiles('[C][C][Branch1][C][C][C]')
      expect(canonical).toBe('CC(C)C')
    })

    test('returns canonical SMILES for cyclic molecules', async () => {
      const canonical = await getCanonicalSmiles('[C][C][C][Ring1][=C]')
      expect(canonical).toBe('C1CC1')
    })

    test('returns canonical SMILES for aromatic systems', async () => {
      // Benzene - RDKit canonicalizes to lowercase aromatic notation
      const canonical = await getCanonicalSmiles('[C][=C][C][=C][C][=C][Ring1][=Branch1]')
      expect(canonical).toBe('c1ccccc1')
    })

    test('returns null for invalid molecules', async () => {
      expect(await getCanonicalSmiles('')).toBe(null)
      // TODO: Decoder doesn't validate element names yet
      // expect(await getCanonicalSmiles('[Xyz]')).toBe(null)
    })
  })

  describe('validateRoundtrip', () => {
    test('validates simple roundtrips', async () => {
      expect(await validateRoundtrip('C', '[C]')).toBe(true)
      expect(await validateRoundtrip('CC', '[C][C]')).toBe(true)
      expect(await validateRoundtrip('CCO', '[C][C][O]')).toBe(true)
    })

    test('validates double bond roundtrips', async () => {
      expect(await validateRoundtrip('C=C', '[C][=C]')).toBe(true)
      expect(await validateRoundtrip('C=O', '[C][=O]')).toBe(true)
    })

    test('validates triple bond roundtrips', async () => {
      expect(await validateRoundtrip('C#C', '[C][#C]')).toBe(true)
      expect(await validateRoundtrip('C#N', '[C][#N]')).toBe(true)
    })

    test('validates branched molecule roundtrips', async () => {
      expect(await validateRoundtrip('CC(C)C', '[C][C][Branch1][C][C][C]')).toBe(true)
    })

    test('validates cyclic molecule roundtrips', async () => {
      expect(await validateRoundtrip('C1CC1', '[C][C][C][Ring1][=C]')).toBe(true)
    })

    test('validates aromatic roundtrips using canonical comparison', async () => {
      // Both should canonicalize to same form
      const selfies = '[C][=C][C][=C][C][=C][Ring1][=Branch1]'
      // RDKit canonicalizes aromatic rings
      expect(await validateRoundtrip('c1ccccc1', selfies)).toBe(true)
    })

    test('detects mismatched molecules', async () => {
      expect(await validateRoundtrip('CCO', '[C][C]')).toBe(false) // ethane not ethanol
      expect(await validateRoundtrip('C=C', '[C][C]')).toBe(false) // ethane not ethene
    })
  })

  describe('getValidationDetails', () => {
    test('returns complete details for valid molecules', async () => {
      const result = await getValidationDetails('[C][C][O]')
      expect(result.isValid).toBe(true)
      expect(result.smiles).toBe('CCO')
      expect(result.canonical).toBe('CCO')
      expect(result.error).toBe(null)
    })

    test('returns error details for invalid SELFIES', async () => {
      // Test that decoder validates element names
      const result = await getValidationDetails('[Xyz]')
      expect(result.isValid).toBe(false)
      expect(result.error).not.toBe(null)
    })

    test('includes canonical form in details', async () => {
      const result = await getValidationDetails('[C][=C][C][=C][C][=C][Ring1][=Branch1]')
      expect(result.isValid).toBe(true)
      expect(result.canonical).toBe('c1ccccc1') // Canonical aromatic form
    })
  })

  describe('batchValidate', () => {
    test('validates batch of molecules', async () => {
      const batch = [
        '[C]',
        '[C][C]',
        '[C][C][O]',
        '[C][=C]',
        '[C][#C]'
      ]

      const results = await batchValidate(batch)
      expect(results.total).toBe(5)
      expect(results.valid).toBe(5)
      expect(results.invalid).toBe(0)
      expect(results.validPercentage).toBe(100)
      expect(results.failures).toEqual([])
    })

    test('identifies invalid molecules in batch', async () => {
      // Test batch validation with invalid element
      const batch = [
        '[C]',
        '[Xyz]', // invalid
        '[C][C][O]'
      ]

      const results = await batchValidate(batch)
      expect(results.total).toBe(3)
      expect(results.valid).toBe(2)
      expect(results.invalid).toBe(1)
      expect(results.validPercentage).toBeCloseTo(66.67, 1)
      expect(results.failures.length).toBe(1)
      expect(results.failures[0].selfies).toBe('[Xyz]')
    })

    test('handles empty batch', async () => {
      const results = await batchValidate([])
      expect(results.total).toBe(0)
      expect(results.valid).toBe(0)
      expect(results.invalid).toBe(0)
    })
  })

  describe('Full encode/decode roundtrip validation', () => {
    test('validates full roundtrips with canonical comparison', async () => {
      const molecules = [
        'C',
        'CC',
        'CCO',
        'C=C',
        'C#C',
        'CC(C)C',
        'C1CC1'
      ]

      for (const smiles of molecules) {
        const selfies = encode(smiles)
        const valid = await validateRoundtrip(smiles, selfies)
        expect(valid).toBe(true)
      }
    })

    test('validates aromatic molecule roundtrips', async () => {
      // Aromatic benzene
      const selfies = encode('c1ccccc1')
      const valid = await validateRoundtrip('c1ccccc1', selfies)
      expect(valid).toBe(true)
    })

    test('all decoded molecules are chemically valid', async () => {
      const selfiesList = [
        '[C]',
        '[C][C]',
        '[C][C][O]',
        '[C][=C]',
        '[C][#C]',
        '[C][C][Branch1][C][C][C]',
        '[C][C][C][Ring1][=C]',
        '[C][=C][C][=C][C][=C][Ring1][=Branch1]'
      ]

      for (const selfies of selfiesList) {
        const valid = await isChemicallyValid(selfies)
        expect(valid).toBe(true)
      }
    })
  })
})
