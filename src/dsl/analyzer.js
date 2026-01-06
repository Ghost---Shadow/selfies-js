/**
 * Analyzer - Static analysis for DSL programs
 *
 * Detects forward references, circular dependencies, unused definitions,
 * and other semantic issues.
 */

/**
 * Gets the names that a definition depends on
 * @param {Object} program - Program object
 * @param {string} name - Name of definition to analyze
 * @returns {string[]} Array of dependency names
 *
 * Example:
 *   // [methyl] = [C]
 *   // [ethanol] = [methyl][C][O]
 *   getDependencies(program, 'ethanol') // => ['methyl']
 *   getDependencies(program, 'methyl') // => []
 */
export function getDependencies(program, name) {
  // TODO: Implement dependency extraction
  // Algorithm:
  // 1. Get definition for name
  // 2. Scan tokens for references to other definitions
  // 3. Return array of referenced names
  throw new Error('Not implemented')
}

/**
 * Gets the names that depend on a definition
 * @param {Object} program - Program object
 * @param {string} name - Name to find dependents of
 * @returns {string[]} Array of dependent names
 *
 * Example:
 *   // [methyl] = [C]
 *   // [ethyl] = [methyl][C]
 *   // [ethanol] = [ethyl][O]
 *   getDependents(program, 'methyl') // => ['ethyl', 'ethanol']
 */
export function getDependents(program, name) {
  // TODO: Implement dependent search
  // Algorithm:
  // 1. Iterate through all definitions
  // 2. Check if each definition depends on target name
  // 3. Return array of names that depend on target
  throw new Error('Not implemented')
}

/**
 * Detects circular dependencies in a program
 * @param {Object} program - Program object
 * @returns {Object[]} Array of cycle diagnostics
 *
 * Each diagnostic contains:
 * {
 *   message: string,
 *   severity: 'error',
 *   cycle: string[],  // Names forming the cycle
 *   ...location info
 * }
 */
export function detectCycles(program) {
  // TODO: Implement cycle detection
  // Algorithm:
  // 1. Build dependency graph
  // 2. DFS with visiting set to detect back edges
  // 3. When cycle found, trace back to find cycle path
  // 4. Create diagnostic for each cycle
  throw new Error('Not implemented')
}

/**
 * Detects forward references (using a name before it's defined)
 * @param {Object} program - Program object
 * @returns {Object[]} Array of forward reference diagnostics
 */
export function detectForwardReferences(program) {
  // TODO: Implement forward reference detection
  // Algorithm:
  // 1. Process definitions in order
  // 2. Track which names have been defined so far
  // 3. For each definition, check if it references undefined names
  // 4. Create diagnostics for forward references
  throw new Error('Not implemented')
}

/**
 * Finds unused definitions (not referenced by any other definition)
 * @param {Object} program - Program object
 * @returns {string[]} Array of unused definition names
 */
export function findUnused(program) {
  // TODO: Implement unused definition detection
  // Algorithm:
  // 1. Build reverse dependency map
  // 2. Find definitions with no dependents
  // 3. Return array of unused names
  throw new Error('Not implemented')
}
