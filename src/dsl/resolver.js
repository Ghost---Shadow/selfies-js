/**
 * Resolver - Expands DSL definitions to primitive SELFIES
 *
 * Recursively resolves references to other definitions until only
 * primitive SELFIES tokens remain.
 */

import { decode } from '../decoder.js'
import { validateValence } from './valenceValidator.js'

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
 * @param {boolean} options.validateValence - If true, validate chemical valence (default: true)
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

  // Validate valence if requested (default: true)
  if (options.validateValence !== false) {
    const valenceErrors = validateValence(selfies, name)
    if (valenceErrors.length > 0) {
      throw new ResolveError(valenceErrors[0].message, name)
    }
  }

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

  // Check if definition has tokens (parse errors can result in empty definitions)
  if (!definition.tokens || definition.tokens.length === 0) {
    throw new ResolveError(`Definition '${name}' has no tokens (possibly due to parse errors)`, name)
  }

  const resolvedTokens = []

  // Resolve each token
  for (const token of definition.tokens) {
    if (typeof token === 'object' && token.type === 'REPEAT_CALL') {
      // It's a repeat call - expand it
      const expandedTokens = expandRepeat(token, program, visiting)
      resolvedTokens.push(...expandedTokens)
    } else if (isReference(token, program)) {
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
 * Expands a repeat call by repeating the pattern
 * @param {Object} repeatToken - Repeat token object with pattern and count
 * @param {Object} program - Program object
 * @param {Set<string>} visiting - Set of currently visiting definitions
 * @returns {string[]} Expanded tokens
 */
function expandRepeat(repeatToken, program, visiting) {
  const { pattern, count } = repeatToken

  // Validate count
  if (count < 0) {
    throw new ResolveError(`Repeat count must be non-negative, got ${count}`)
  }

  if (!Number.isInteger(count)) {
    throw new ResolveError(`Repeat count must be an integer, got ${count}`)
  }

  // Tokenize the pattern string to extract individual SELFIES tokens
  const patternTokens = tokenizePattern(pattern)

  // Resolve each token in the pattern (they might be references)
  const resolvedPatternTokens = []
  for (const token of patternTokens) {
    if (isReference(token, program)) {
      // Recursively resolve the reference
      const refName = token.slice(1, -1)
      const refResolved = resolveRecursive(program, refName, visiting)
      resolvedPatternTokens.push(...refResolved)
    } else {
      resolvedPatternTokens.push(token)
    }
  }

  // Repeat the resolved pattern
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(...resolvedPatternTokens)
  }

  return result
}

/**
 * Tokenizes a pattern string into SELFIES tokens
 * @param {string} pattern - Pattern string like '[C][=C]'
 * @returns {string[]} Array of tokens
 */
function tokenizePattern(pattern) {
  const tokens = []
  let i = 0

  while (i < pattern.length) {
    if (pattern[i] === '[') {
      // Find the closing bracket
      let j = i + 1
      while (j < pattern.length && pattern[j] !== ']') {
        j++
      }
      if (j >= pattern.length) {
        throw new ResolveError(`Unclosed bracket in pattern: ${pattern}`)
      }
      tokens.push(pattern.slice(i, j + 1))
      i = j + 1
    } else if (pattern[i] === ' ' || pattern[i] === '\t') {
      // Skip whitespace
      i++
    } else {
      throw new ResolveError(`Invalid character in pattern: ${pattern[i]}`)
    }
  }

  return tokens
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
