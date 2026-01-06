/**
 * Molecular Weight - Calculates molecular weight from SELFIES
 *
 * Computes the molecular weight by parsing the SELFIES string,
 * determining the molecular formula, and summing atomic masses.
 */

import { tokenize } from '../tokenizer.js'
import { parse } from '../parser.js'
import { getAtomicMass } from './atoms.js'

/**
 * Calculates molecular weight of a SELFIES molecule
 * @param {string} selfies - SELFIES string
 * @returns {number} Molecular weight in g/mol
 *
 * Example:
 *   getMolecularWeight('[C][C][O]') // => 46.068 (ethanol: C2H6O)
 *   getMolecularWeight('[C]') // => 16.043 (methane: CH4)
 */
export function getMolecularWeight(selfies) {
  const tokens = tokenize(selfies)
  const ir = parse(tokens)

  const counts = countAtoms(ir)

  let totalWeight = 0
  for (const [element, count] of Object.entries(counts)) {
    totalWeight += getAtomicMass(element) * count
  }

  return totalWeight
}

/**
 * Counts atoms in molecule IR (including implicit hydrogens)
 * @param {Object} ir - Molecule internal representation
 * @returns {Object} Map of element to count
 *
 * Example return:
 *   { 'C': 2, 'H': 6, 'O': 1 }  // for ethanol
 */
function countAtoms(ir) {
  const counts = {}

  // Count explicit atoms and calculate used valence
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
 * Calculates number of implicit hydrogens for an atom
 * @param {Object} atom - Atom from IR
 * @returns {number} Number of implicit hydrogens
 */
function getImplicitHydrogens(atom) {
  return atom.valence - atom.usedValence
}
