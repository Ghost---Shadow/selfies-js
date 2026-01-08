/**
 * Chemistry Validator - Validates molecular chemistry using RDKit
 *
 * Provides chemistry-aware validation beyond syntax checking.
 * Uses RDKit to verify that decoded molecules are chemically valid.
 */

import { decode } from './decoder.js'
import { initRDKit } from './renderers/svg.js'

/**
 * Checks if a SELFIES string decodes to a chemically valid molecule
 * @param {string} selfies - The SELFIES string to validate
 * @returns {Promise<boolean>} True if molecule is chemically valid
 *
 * Uses RDKit's molecule validation to ensure:
 * - Proper valence satisfaction
 * - Valid bonding patterns
 * - Chemically feasible structure
 *
 * Example:
 *   await isChemicallyValid('[C][C][O]') // => true
 *   await isChemicallyValid('[C][=C][=C][=C]') // => false (too many double bonds)
 */
export async function isChemicallyValid(selfies) {
  try {
    const RDKit = await initRDKit()
    const smiles = decode(selfies)

    // Empty SMILES is not valid
    if (!smiles || smiles.length === 0) {
      return false
    }

    const mol = RDKit.get_mol(smiles)

    if (!mol) {
      return false
    }

    const valid = mol.is_valid()
    mol.delete()
    return valid
  } catch (error) {
    return false
  }
}

/**
 * Gets the canonical SMILES representation of a SELFIES string
 * @param {string} selfies - The SELFIES string to convert
 * @returns {Promise<string|null>} Canonical SMILES, or null if invalid
 *
 * Canonical SMILES allows proper comparison of molecular structures
 * that may have different string representations.
 *
 * Example:
 *   await getCanonicalSmiles('[C][C][O]') // => 'CCO'
 *   await getCanonicalSmiles('[C][=C][C][=C][C][=C][Ring1][=Branch1]') // => 'c1ccccc1'
 */
export async function getCanonicalSmiles(selfies) {
  try {
    const RDKit = await initRDKit()
    const smiles = decode(selfies)

    // Empty SMILES returns null
    if (!smiles || smiles.length === 0) {
      return null
    }

    const mol = RDKit.get_mol(smiles)

    if (!mol || !mol.is_valid()) {
      if (mol) mol.delete()
      return null
    }

    const canonical = mol.get_smiles()
    mol.delete()
    return canonical
  } catch (error) {
    return null
  }
}

/**
 * Validates a roundtrip: SMILES → SELFIES → SMILES using canonical comparison
 * @param {string} originalSmiles - The original SMILES string
 * @param {string} selfies - The SELFIES encoding
 * @returns {Promise<boolean>} True if roundtrip preserves molecular structure
 *
 * This is the gold standard for validation - ensures that encoding and
 * decoding preserve the actual molecular structure, not just the string.
 *
 * Example:
 *   const selfies = encode('CCO')
 *   await validateRoundtrip('CCO', selfies) // => true
 */
export async function validateRoundtrip(originalSmiles, selfies) {
  try {
    const RDKit = await initRDKit()

    // Get canonical form of original
    const mol1 = RDKit.get_mol(originalSmiles)
    if (!mol1 || !mol1.is_valid()) {
      if (mol1) mol1.delete()
      return false
    }
    const canonical1 = mol1.get_smiles()
    mol1.delete()

    // Get canonical form of decoded SELFIES
    const decoded = decode(selfies)
    const mol2 = RDKit.get_mol(decoded)
    if (!mol2 || !mol2.is_valid()) {
      if (mol2) mol2.delete()
      return false
    }
    const canonical2 = mol2.get_smiles()
    mol2.delete()

    return canonical1 === canonical2
  } catch (error) {
    return false
  }
}

/**
 * Gets detailed validation information about a SELFIES string
 * @param {string} selfies - The SELFIES string to validate
 * @returns {Promise<Object>} Validation result with details
 *
 * Returns object with:
 *   - isValid: boolean
 *   - smiles: decoded SMILES (or null)
 *   - canonical: canonical SMILES (or null)
 *   - error: error message if invalid (or null)
 *
 * Example:
 *   const result = await getValidationDetails('[C][C][O]')
 *   // => { isValid: true, smiles: 'CCO', canonical: 'CCO', error: null }
 */
export async function getValidationDetails(selfies) {
  const result = {
    isValid: false,
    smiles: null,
    canonical: null,
    error: null
  }

  try {
    const RDKit = await initRDKit()

    // Try to decode
    try {
      result.smiles = decode(selfies)
    } catch (error) {
      result.error = `Decode error: ${error.message}`
      return result
    }

    // Empty SMILES means the SELFIES contained only invalid/unknown tokens
    if (!result.smiles || result.smiles.length === 0) {
      result.error = 'Decoded to empty SMILES (invalid tokens in SELFIES)'
      return result
    }

    // Try to create molecule
    const mol = RDKit.get_mol(result.smiles)
    if (!mol) {
      result.error = 'RDKit could not parse SMILES'
      return result
    }

    // Check validity
    if (!mol.is_valid()) {
      mol.delete()
      result.error = 'Molecule is not chemically valid'
      return result
    }

    // Get canonical form
    result.canonical = mol.get_smiles()
    result.isValid = true
    mol.delete()

  } catch (error) {
    result.error = error.message
  }

  return result
}

/**
 * Batch validates multiple SELFIES strings
 * @param {string[]} selfiesArray - Array of SELFIES strings
 * @returns {Promise<Object>} Validation statistics
 *
 * Returns:
 *   - total: number of strings tested
 *   - valid: number of valid molecules
 *   - invalid: number of invalid molecules
 *   - validPercentage: percentage valid
 *   - failures: array of {selfies, error} for invalid ones
 *
 * Example:
 *   const results = await batchValidate(['[C][C][O]', '[C][=C]'])
 *   // => { total: 2, valid: 2, invalid: 0, validPercentage: 100, failures: [] }
 */
export async function batchValidate(selfiesArray) {
  const results = {
    total: selfiesArray.length,
    valid: 0,
    invalid: 0,
    validPercentage: 0,
    failures: []
  }

  for (const selfies of selfiesArray) {
    const isValid = await isChemicallyValid(selfies)
    if (isValid) {
      results.valid++
    } else {
      results.invalid++
      const details = await getValidationDetails(selfies)
      results.failures.push({
        selfies,
        error: details.error
      })
    }
  }

  results.validPercentage = (results.valid / results.total) * 100

  return results
}
