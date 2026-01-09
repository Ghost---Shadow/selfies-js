/**
 * Importer - Handles importing definitions from other .selfies files
 *
 * Supports import syntax like:
 *   import "./fragments.selfies"                       # Import all definitions
 *   import * from "./common.selfies"                  # Import all (alternative syntax)
 *   import [methyl, ethyl] from "./fragments.selfies" # Import specific definitions
 */

import { readFileSync, existsSync } from 'fs'
import { resolve as resolvePath, dirname, join, isAbsolute } from 'path'
import { parse } from './parser.js'

/**
 * Parses import statements from DSL source
 * @param {string} source - DSL source code
 * @param {string} currentFilePath - Path to current file (for relative imports)
 * @returns {Object} {imports: Import[], sourceWithoutImports: string}
 *
 * Import structure:
 * {
 *   names: string[] | '*',  // Array of names or '*' for all
 *   filePath: string,       // Resolved absolute path
 *   originalPath: string    // Original path from import statement
 * }
 */
export function parseImports(source, currentFilePath) {
  const imports = []
  const lines = source.split('\n')
  const processedLines = []

  // Match: import [names] from "path"  OR  import * from "path"  OR  import "path"
  const importWithNamesRegex = /^import\s+\[([^\]]+)\]\s+from\s+['"]([^'"]+)['"]/
  const importAllFromRegex = /^import\s+\*\s+from\s+['"]([^'"]+)['"]/
  const importSimpleRegex = /^import\s+['"]([^'"]+)['"]/

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines and comments for import matching
    if (!trimmed.startsWith('import')) {
      processedLines.push(line)
      continue
    }

    let match
    let names
    let relativeFilePath

    // Try matching different import patterns
    if ((match = trimmed.match(importWithNamesRegex))) {
      // import [name1, name2] from "path"
      names = match[1].split(',').map(n => n.trim())
      relativeFilePath = match[2]
    } else if ((match = trimmed.match(importAllFromRegex))) {
      // import * from "path"
      names = '*'
      relativeFilePath = match[1]
    } else if ((match = trimmed.match(importSimpleRegex))) {
      // import "path" (shorthand for import all)
      names = '*'
      relativeFilePath = match[1]
    } else {
      // Not a valid import line, keep it
      processedLines.push(line)
      continue
    }

    // Resolve file path relative to current file
    const currentDir = currentFilePath ? dirname(resolvePath(currentFilePath)) : process.cwd()
    const absoluteFilePath = isAbsolute(relativeFilePath)
      ? relativeFilePath
      : join(currentDir, relativeFilePath)

    imports.push({
      names,
      filePath: absoluteFilePath,
      originalPath: relativeFilePath
    })

    // Replace import line with blank line to preserve line numbers
    processedLines.push('')
  }

  return {
    imports,
    sourceWithoutImports: processedLines.join('\n')
  }
}

/**
 * Loads and merges imported definitions into a program
 * Handles recursive imports with cycle detection
 * @param {string} source - DSL source code
 * @param {string} filePath - Path to current file
 * @param {Set<string>} visited - Set of already visited file paths (for cycle detection)
 * @returns {Object} Merged program with all imported definitions
 */
export function loadWithImports(source, filePath, visited = new Set()) {
  // Normalize the file path for cycle detection
  const normalizedPath = filePath ? resolvePath(filePath) : null

  // Check for circular imports
  if (normalizedPath && visited.has(normalizedPath)) {
    return {
      definitions: new Map(),
      errors: [{
        message: `Circular import detected: ${filePath}`,
        severity: 'error',
        line: 1,
        column: 1,
        range: [0, 0]
      }],
      warnings: []
    }
  }

  // Add current file to visited set
  if (normalizedPath) {
    visited.add(normalizedPath)
  }

  // Parse imports from source
  const { imports, sourceWithoutImports } = parseImports(source, filePath)

  // Parse the main file (without import statements)
  const mainProgram = parse(sourceWithoutImports)

  // Load each import and merge definitions
  for (const importSpec of imports) {
    // Check if file exists
    if (!existsSync(importSpec.filePath)) {
      mainProgram.errors.push({
        message: `Import file not found: ${importSpec.originalPath} (resolved to ${importSpec.filePath})`,
        severity: 'error',
        line: 1,
        column: 1,
        range: [0, 0]
      })
      continue
    }

    try {
      const importedSource = readFileSync(importSpec.filePath, 'utf-8')

      // Recursively load with imports (pass visited set for cycle detection)
      const importedProgram = loadWithImports(importedSource, importSpec.filePath, visited)

      // Propagate errors from imported file
      if (importedProgram.errors.length > 0) {
        for (const error of importedProgram.errors) {
          mainProgram.errors.push({
            ...error,
            message: `In ${importSpec.originalPath}: ${error.message}`
          })
        }
      }

      // Merge definitions based on import specification
      if (importSpec.names === '*') {
        // Import all definitions
        for (const [name, definition] of importedProgram.definitions) {
          if (!mainProgram.definitions.has(name)) {
            // Mark definition as imported
            mainProgram.definitions.set(name, {
              ...definition,
              importedFrom: importSpec.originalPath
            })
          }
        }
      } else {
        // Import specific definitions
        for (const name of importSpec.names) {
          if (importedProgram.definitions.has(name)) {
            if (!mainProgram.definitions.has(name)) {
              mainProgram.definitions.set(name, {
                ...importedProgram.definitions.get(name),
                importedFrom: importSpec.originalPath
              })
            }
          } else {
            mainProgram.errors.push({
              message: `Cannot import '${name}': not found in ${importSpec.originalPath}`,
              severity: 'error',
              line: 1,
              column: 1,
              range: [0, 0]
            })
          }
        }
      }
    } catch (error) {
      mainProgram.errors.push({
        message: `Failed to import from ${importSpec.originalPath}: ${error.message}`,
        severity: 'error',
        line: 1,
        column: 1,
        range: [0, 0]
      })
    }
  }

  return mainProgram
}

/**
 * Recursively loads a file with all its transitive imports
 * @param {string} filePath - Path to .selfies file
 * @returns {Object} Merged program with all definitions
 */
export function loadFile(filePath) {
  const absolutePath = resolvePath(filePath)

  if (!existsSync(absolutePath)) {
    return {
      definitions: new Map(),
      errors: [{
        message: `File not found: ${filePath}`,
        severity: 'error',
        line: 1,
        column: 1,
        range: [0, 0]
      }],
      warnings: []
    }
  }

  const source = readFileSync(absolutePath, 'utf-8')
  return loadWithImports(source, absolutePath)
}

/**
 * Gets the list of imports from a source file without loading them
 * @param {string} source - DSL source code
 * @param {string} currentFilePath - Path to current file
 * @returns {Object[]} Array of import specifications
 */
export function getImports(source, currentFilePath) {
  const { imports } = parseImports(source, currentFilePath)
  return imports
}
