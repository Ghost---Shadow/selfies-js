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
  const definition = program.definitions.get(name)
  if (!definition) {
    return []
  }

  const dependencies = []
  for (const token of definition.tokens) {
    const tokenName = token.slice(1, -1) // Remove brackets
    if (program.definitions.has(tokenName)) {
      if (!dependencies.includes(tokenName)) {
        dependencies.push(tokenName)
      }
    }
  }

  return dependencies
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
  const dependents = []

  // Build a set of all transitive dependents
  const visited = new Set()

  function findDirectDependents(targetName) {
    for (const [defName, definition] of program.definitions) {
      if (visited.has(defName)) continue

      const deps = getDependencies(program, defName)
      if (deps.includes(targetName)) {
        visited.add(defName)
        dependents.push(defName)
        // Recursively find dependents of this dependent
        findDirectDependents(defName)
      }
    }
  }

  findDirectDependents(name)
  return dependents
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
  const diagnostics = []
  const visited = new Set()
  const visiting = new Set()
  const cyclesFound = new Set()

  function dfs(name, path = []) {
    if (visiting.has(name)) {
      // Found a cycle
      const cycleStart = path.indexOf(name)
      const cycle = [...path.slice(cycleStart), name]
      const cycleKey = cycle.sort().join(',')

      // Only report each unique cycle once
      if (!cyclesFound.has(cycleKey)) {
        cyclesFound.add(cycleKey)
        const definition = program.definitions.get(name)
        diagnostics.push({
          message: `Circular dependency: ${cycle.join(' -> ')}`,
          severity: 'error',
          cycle,
          line: definition?.line || 1,
          column: 1,
          range: definition?.range || [0, 0]
        })
      }
      return
    }

    if (visited.has(name)) {
      return
    }

    visiting.add(name)
    path.push(name)

    const deps = getDependencies(program, name)
    for (const dep of deps) {
      dfs(dep, [...path])
    }

    path.pop()
    visiting.delete(name)
    visited.add(name)
  }

  for (const name of program.definitions.keys()) {
    if (!visited.has(name)) {
      dfs(name)
    }
  }

  return diagnostics
}

/**
 * Finds unused definitions (not referenced by any other definition)
 * @param {Object} program - Program object
 * @returns {string[]} Array of unused definition names
 */
export function findUnused(program) {
  const referenced = new Set()

  // Find all referenced names
  for (const [name, definition] of program.definitions) {
    for (const token of definition.tokens) {
      const tokenName = token.slice(1, -1)
      if (program.definitions.has(tokenName)) {
        referenced.add(tokenName)
      }
    }
  }

  // Find definitions that are not referenced
  const unused = []
  for (const name of program.definitions.keys()) {
    if (!referenced.has(name)) {
      unused.push(name)
    }
  }

  return unused
}
