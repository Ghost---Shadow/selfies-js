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
  const tokens = tokenize(selfies)
  let smiles = ''

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    // Remove brackets and check for bond prefix
    const content = token.slice(1, -1)

    // Check for bond modifiers
    if (content.startsWith('=')) {
      smiles += '=' + content.slice(1)
    } else if (content.startsWith('#')) {
      smiles += '#' + content.slice(1)
    } else {
      smiles += content
    }
  }

  return smiles
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
