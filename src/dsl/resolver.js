/**
 * Resolver - Expands DSL definitions to primitive SELFIES
 *
 * Recursively resolves references to other definitions until only
 * primitive SELFIES tokens remain.
 */

import { decode } from '../decoder.js'

/**
 * Resolves a definition name to its primitive SELFIES string
 * @param {Object} program - Program object from parser
 * @param {string} name - Name to resolve
 * @param {Object} options - Resolution options
 * @param {boolean} options.decode - If true, return SMILES instead of SELFIES
 * @returns {string} Resolved SELFIES (or SMILES if decode option is true)
 * @throws {ResolveError} If name is not defined or circular reference detected
 *
 * Example:
 *   const program = parse('[methyl] = [C]\n[ethanol] = [methyl][C][O]')
 *   resolve(program, 'ethanol') // => '[C][C][O]'
 *   resolve(program, 'ethanol', { decode: true }) // => 'CCO'
 */
export function resolve(program, name, options = {}) {
  // TODO: Implement resolution
  // Algorithm:
  // 1. Look up name in program.definitions
  // 2. Get tokens from definition
  // 3. For each token:
  //    - If it's a reference ([name]), recursively resolve it
  //    - If it's a primitive token, keep it
  // 4. Join resolved tokens
  // 5. If options.decode is true, decode to SMILES
  // 6. Return result
  //
  // Need to track visited names to detect cycles
  throw new Error('Not implemented')
}

/**
 * Resolves all definitions in a program
 * @param {Object} program - Program object from parser
 * @param {Object} options - Resolution options
 * @returns {Map<string, string>} Map of name to resolved SELFIES
 */
export function resolveAll(program, options = {}) {
  // TODO: Resolve all definitions
  // Iterate through program.definitions and resolve each one
  throw new Error('Not implemented')
}

/**
 * Internal recursive resolution with cycle detection
 * @param {Object} program - Program object
 * @param {string} name - Name to resolve
 * @param {Set<string>} visiting - Set of names currently being visited (for cycle detection)
 * @returns {string[]} Resolved primitive tokens
 */
function resolveRecursive(program, name, visiting = new Set()) {
  // TODO: Implement recursive resolution with cycle detection
  // 1. Check if name is in visiting set (cycle detected)
  // 2. Add name to visiting set
  // 3. Get definition
  // 4. Resolve each token in definition
  // 5. Remove name from visiting set
  // 6. Return resolved tokens
  throw new Error('Not implemented')
}

/**
 * Checks if a token is a reference to another definition
 * @param {string} token - Token to check
 * @param {Object} program - Program object
 * @returns {boolean} True if token is a defined name
 */
function isReference(token, program) {
  // TODO: Check if token (stripped of brackets) is a defined name
  throw new Error('Not implemented')
}
