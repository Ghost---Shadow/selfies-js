/**
 * Formula - Generates molecular formula from SELFIES
 *
 * Computes the molecular formula in Hill notation:
 * C first, then H, then other elements alphabetically.
 */

import { tokenize } from '../tokenizer.js'
import { parse } from '../parser.js'

/**
 * Generates molecular formula from SELFIES string
 * @param {string} selfies - SELFIES string
 * @returns {string} Molecular formula in Hill notation
 *
 * Hill notation:
 * - Carbon first (if present)
 * - Hydrogen second (if present)
 * - Other elements alphabetically
 * - Omit count if 1
 *
 * Examples:
 *   getFormula('[C][C][O]') // => 'C2H6O'
 *   getFormula('[C]') // => 'CH4'
 *   getFormula('[N][C][C][=O]') // => 'C2H5NO'
 */
export function getFormula(selfies) {
  // TODO: Implement formula generation
  // Algorithm:
  // 1. Tokenize SELFIES string
  // 2. Parse into IR
  // 3. Count atoms (including implicit hydrogens)
  // 4. Sort in Hill notation order
  // 5. Format as string (omit 1 counts)
  // 6. Return formula
  throw new Error('Not implemented')
}

/**
 * Counts atoms in molecule IR (including implicit hydrogens)
 * @param {Object} ir - Molecule internal representation
 * @returns {Object} Map of element to count
 */
function countAtoms(ir) {
  // TODO: Count atoms from IR (same as in molecularWeight.js)
  // Consider extracting this to a shared utility
  throw new Error('Not implemented')
}

/**
 * Formats atom counts as Hill notation formula
 * @param {Object} counts - Map of element to count
 * @returns {string} Formatted formula
 *
 * Example:
 *   formatHill({ C: 2, H: 6, O: 1 }) // => 'C2H6O'
 *   formatHill({ H: 2, O: 1 }) // => 'H2O'
 */
function formatHill(counts) {
  // TODO: Format in Hill notation
  // Algorithm:
  // 1. Extract counts for C and H (if present)
  // 2. Sort remaining elements alphabetically
  // 3. Build string: C, H, then others
  // 4. For each element: append symbol + count (omit if count is 1)
  throw new Error('Not implemented')
}

/**
 * Formats a single element count
 * @param {string} element - Element symbol
 * @param {number} count - Number of atoms
 * @returns {string} Formatted string (e.g., 'C2', 'O', 'H3')
 */
function formatElement(element, count) {
  // TODO: Format element with count
  // If count is 1, return just element symbol
  // Otherwise return element + count
  throw new Error('Not implemented')
}
