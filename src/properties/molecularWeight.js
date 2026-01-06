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
  // TODO: Implement molecular weight calculation
  // Algorithm:
  // 1. Tokenize SELFIES string
  // 2. Parse into IR
  // 3. Count atoms (including implicit hydrogens)
  // 4. Look up atomic mass for each element
  // 5. Sum: (count * mass) for each element
  // 6. Return total
  throw new Error('Not implemented')
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
  // TODO: Count atoms from IR
  // 1. Count explicit atoms from ir.atoms
  // 2. Calculate implicit hydrogens for each atom:
  //    implicitH = valence - usedValence
  // 3. Return element -> count map
  throw new Error('Not implemented')
}

/**
 * Calculates number of implicit hydrogens for an atom
 * @param {Object} atom - Atom from IR
 * @returns {number} Number of implicit hydrogens
 */
function getImplicitHydrogens(atom) {
  // TODO: Calculate implicit H count
  // implicitH = atom.valence - atom.usedValence
  throw new Error('Not implemented')
}
