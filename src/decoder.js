/**
 * Decoder - Converts SELFIES strings to SMILES
 *
 * This is the core functionality for converting SELFIES molecular
 * representations into SMILES format.
 */

import { tokenize } from './tokenizer.js'
import { parse } from './parser.js'

/**
 * Decodes a SELFIES string to SMILES
 * @param {string} selfies - The SELFIES string to decode
 * @returns {string} SMILES representation
 * @throws {DecodeError} If the SELFIES string is invalid
 *
 * Example:
 *   decode('[C][C][O]') // => 'CCO'
 *   decode('[C][=C][C][=C][C][=C][Ring1][=Branch1]') // => 'C1=CC=CC=C1'
 */
export function decode(selfies) {
  // TODO: Implement SELFIES decoding
  // Algorithm:
  // 1. Tokenize the SELFIES string
  // 2. Parse tokens into molecule IR
  // 3. Convert IR to SMILES:
  //    - Traverse atoms in order
  //    - Write SMILES symbols
  //    - Handle branches with parentheses
  //    - Handle rings with numbers
  //    - Add implicit hydrogens notation if needed
  // 4. Return SMILES string
  throw new Error('Not implemented')
}

/**
 * Converts molecule IR to SMILES string
 * @param {Object} ir - Molecule internal representation
 * @returns {string} SMILES string
 */
function irToSmiles(ir) {
  // TODO: Implement IR to SMILES conversion
  // Algorithm:
  // 1. DFS traversal of molecule graph
  // 2. Track visited atoms
  // 3. For each atom:
  //    - Write element symbol
  //    - If branching, use parentheses
  //    - If ring closure, use ring numbers
  // 4. Build SMILES string
  throw new Error('Not implemented')
}
