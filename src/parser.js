/**
 * Parser - Converts SELFIES tokens into an internal molecule representation (IR)
 *
 * The IR is a graph structure with atoms and bonds that can be used for
 * decoding to SMILES, validation, and property calculation.
 */

/**
 * Parses SELFIES tokens into a molecule IR
 * @param {string[]} tokens - Array of SELFIES tokens
 * @returns {Object} Molecule IR with atoms and bonds
 *
 * IR Structure:
 * {
 *   atoms: [
 *     { element: 'C', index: 0, valence: 4, usedValence: 0 },
 *     { element: 'O', index: 1, valence: 2, usedValence: 0 },
 *     ...
 *   ],
 *   bonds: [
 *     { from: 0, to: 1, order: 1 },
 *     ...
 *   ]
 * }
 */
import { getValence } from './properties/atoms.js'

export function parse(tokens) {
  const atoms = []
  const bonds = []

  for (let i = 0; i < tokens.length; i++) {
    const tokenInfo = parseToken(tokens[i])

    // Skip branch/ring tokens for now (simplified)
    if (isBranchToken(tokens[i]) || isRingToken(tokens[i])) {
      continue
    }

    if (tokenInfo.element) {
      const atom = {
        element: tokenInfo.element,
        index: atoms.length,
        valence: getValence(tokenInfo.element),
        usedValence: 0
      }
      atoms.push(atom)

      // Create bond to previous atom
      if (atoms.length > 1) {
        bonds.push({
          from: atoms.length - 2,
          to: atoms.length - 1,
          order: tokenInfo.bondOrder
        })
      }
    }
  }

  return { atoms, bonds }
}

/**
 * Extracts element symbol and bond prefix from a token
 * @param {string} token - SELFIES token like '[C]', '[=O]', '[#N]'
 * @returns {{element: string, bondOrder: number}} Parsed token info
 */
function parseToken(token) {
  const content = token.slice(1, -1)

  if (content.startsWith('=')) {
    return { element: content.slice(1), bondOrder: 2 }
  } else if (content.startsWith('#')) {
    return { element: content.slice(1), bondOrder: 3 }
  } else {
    return { element: content, bondOrder: 1 }
  }
}

/**
 * Determines if a token is a branch token
 * @param {string} token - SELFIES token
 * @returns {boolean} True if token is [Branch1], [Branch2], or [Branch3]
 */
function isBranchToken(token) {
  return token.match(/^\[=?#?Branch[123]\]$/) !== null
}

/**
 * Determines if a token is a ring token
 * @param {string} token - SELFIES token
 * @returns {boolean} True if token is [Ring1], [Ring2], or [Ring3]
 */
function isRingToken(token) {
  return token.match(/^\[=?#?Ring[123]\]$/) !== null
}
