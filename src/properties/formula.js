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
  const tokens = tokenize(selfies)
  const ir = parse(tokens)
  const counts = countAtoms(ir)
  return formatHill(counts)
}

/**
 * Counts atoms in molecule IR (including implicit hydrogens)
 * @param {Object} ir - Molecule internal representation
 * @returns {Object} Map of element to count
 */
function countAtoms(ir) {
  const counts = {}

  // Count explicit atoms
  for (const atom of ir.atoms) {
    counts[atom.element] = (counts[atom.element] || 0) + 1
  }

  // Calculate used valence from bonds
  const usedValence = new Array(ir.atoms.length).fill(0)
  for (const bond of ir.bonds) {
    usedValence[bond.from] += bond.order
    usedValence[bond.to] += bond.order
  }

  // Add implicit hydrogens
  let totalH = 0
  for (let i = 0; i < ir.atoms.length; i++) {
    const atom = ir.atoms[i]
    const implicitH = Math.max(0, atom.valence - usedValence[i])
    totalH += implicitH
  }

  if (totalH > 0) {
    counts['H'] = totalH
  }

  return counts
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
  let formula = ''

  // C first
  if (counts['C']) {
    formula += formatElement('C', counts['C'])
  }

  // H second
  if (counts['H']) {
    formula += formatElement('H', counts['H'])
  }

  // Other elements alphabetically
  const others = Object.keys(counts)
    .filter(el => el !== 'C' && el !== 'H')
    .sort()

  for (const element of others) {
    formula += formatElement(element, counts[element])
  }

  return formula
}

/**
 * Formats a single element count
 * @param {string} element - Element symbol
 * @param {number} count - Number of atoms
 * @returns {string} Formatted string (e.g., 'C2', 'O', 'H3')
 */
function formatElement(element, count) {
  return count === 1 ? element : element + count
}
