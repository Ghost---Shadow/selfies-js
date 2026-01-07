/**
 * Importer - Handles importing definitions from other .selfies files
 *
 * Supports import syntax like:
 *   import [methyl, ethyl] from './fragments.selfies'
 *   import * from './common.selfies'
 */

import { readFileSync } from 'fs'
import { resolve as resolvePath, dirname, join } from 'path'
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
 *   filePath: string        // Resolved absolute path
 * }
 */
export function parseImports(source, currentFilePath) {
  const imports = []
  const lines = source.split('\n')
  const nonImportLines = []

  const importRegex = /^import\s+(?:\[([^\]]+)\]|\*)\s+from\s+['"]([^'"]+)['"]/

  for (const line of lines) {
    const match = line.match(importRegex)

    if (match) {
      const namesStr = match[1]
      const relativeFilePath = match[2]

      // Parse names
      const names = namesStr ? namesStr.split(',').map(n => n.trim()) : '*'

      // Resolve file path relative to current file
      const currentDir = currentFilePath ? dirname(currentFilePath) : process.cwd()
      const absoluteFilePath = join(currentDir, relativeFilePath)

      imports.push({
        names,
        filePath: absoluteFilePath
      })
    } else {
      nonImportLines.push(line)
    }
  }

  return {
    imports,
    sourceWithoutImports: nonImportLines.join('\n')
  }
}

/**
 * Loads and merges imported definitions into a program
 * @param {string} source - DSL source code
 * @param {string} filePath - Path to current file
 * @returns {Object} Merged program with all imported definitions
 */
export function loadWithImports(source, filePath) {
  // Parse imports from source
  const { imports, sourceWithoutImports } = parseImports(source, filePath)

  // Parse the main file (without import statements)
  const mainProgram = parse(sourceWithoutImports)

  // Load each import and merge definitions
  for (const importSpec of imports) {
    try {
      const importedSource = readFileSync(importSpec.filePath, 'utf-8')
      const importedProgram = parse(importedSource)

      // Merge definitions based on import specification
      if (importSpec.names === '*') {
        // Import all definitions
        for (const [name, definition] of importedProgram.definitions) {
          if (!mainProgram.definitions.has(name)) {
            mainProgram.definitions.set(name, definition)
          }
        }
      } else {
        // Import specific definitions
        for (const name of importSpec.names) {
          if (importedProgram.definitions.has(name)) {
            if (!mainProgram.definitions.has(name)) {
              mainProgram.definitions.set(name, importedProgram.definitions.get(name))
            }
          } else {
            mainProgram.errors.push({
              message: `Cannot import '${name}': not found in ${importSpec.filePath}`,
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
        message: `Failed to import from ${importSpec.filePath}: ${error.message}`,
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
  const source = readFileSync(filePath, 'utf-8')
  return loadWithImports(source, filePath)
}
