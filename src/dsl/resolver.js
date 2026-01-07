/**
 * Resolver - Expands DSL definitions to primitive SELFIES
 *
 * Recursively resolves references to other definitions until only
 * primitive SELFIES tokens remain.
 */

import { decode } from '../decoder.js'

/**
 * Custom error for resolution failures
 */
export class ResolveError extends Error {
  constructor(message, name) {
    super(message)
    this.name = 'ResolveError'
    this.definitionName = name
  }
}

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
  // Look up the definition
  if (!program.definitions.has(name)) {
    throw new ResolveError(`Undefined definition: ${name}`, name)
  }

  // Resolve recursively with cycle detection
  const visiting = new Set()
  const resolved = resolveRecursive(program, name, visiting)

  // Join tokens to form SELFIES string
  const selfies = resolved.join('')

  // Optionally decode to SMILES
  if (options.decode) {
    return decode(selfies)
  }

  return selfies
}

/**
 * Resolves all definitions in a program
 * @param {Object} program - Program object from parser
 * @param {Object} options - Resolution options
 * @returns {Map<string, string>} Map of name to resolved SELFIES
 */
export function resolveAll(program, options = {}) {
  const resolved = new Map()

  for (const [name, definition] of program.definitions) {
    try {
      resolved.set(name, resolve(program, name, options))
    } catch (error) {
      // Skip definitions that can't be resolved (e.g., circular dependencies)
      // The error will be caught when trying to resolve individually
    }
  }

  return resolved
}

/**
 * Internal recursive resolution with cycle detection
 * @param {Object} program - Program object
 * @param {string} name - Name to resolve
 * @param {Set<string>} visiting - Set of names currently being visited (for cycle detection)
 * @returns {string[]} Resolved primitive tokens
 */
function resolveRecursive(program, name, visiting = new Set()) {
  // Check for circular dependency
  if (visiting.has(name)) {
    throw new ResolveError(`Circular dependency detected involving '${name}'`, name)
  }

  // Mark as visiting
  visiting.add(name)

  // Get definition
  const definition = program.definitions.get(name)
  const resolvedTokens = []

  // Resolve each token
  for (const token of definition.tokens) {
    if (isReference(token, program)) {
      // It's a reference to another definition - resolve it recursively
      const refName = token.slice(1, -1) // Remove brackets
      const refResolved = resolveRecursive(program, refName, visiting)
      resolvedTokens.push(...refResolved)
    } else {
      // It's a primitive token - keep it as is
      resolvedTokens.push(token)
    }
  }

  // Unmark as visiting
  visiting.delete(name)

  return resolvedTokens
}

/**
 * Checks if a token is a reference to another definition
 * @param {string} token - Token to check
 * @param {Object} program - Program object
 * @returns {boolean} True if token is a defined name
 */
function isReference(token, program) {
  // Strip brackets and check if it's a defined name
  const name = token.slice(1, -1)
  return program.definitions.has(name)
}
