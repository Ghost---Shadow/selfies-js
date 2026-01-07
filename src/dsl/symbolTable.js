/**
 * Symbol Table - Manages name-to-definition mappings for DSL
 *
 * Provides utilities for working with the symbol table in a Program object.
 */

/**
 * Creates an empty symbol table
 * @returns {Map<string, Object>} Empty symbol table
 */
export function createSymbolTable() {
  return new Map()
}

/**
 * Adds a definition to the symbol table
 * @param {Map} symbolTable - Symbol table to update
 * @param {string} name - Definition name
 * @param {Object} definition - Definition object
 * @throws {Error} If name already exists
 */
export function addDefinition(symbolTable, name, definition) {
  if (symbolTable.has(name)) {
    throw new Error(`Definition '${name}' already exists`)
  }
  symbolTable.set(name, definition)
}

/**
 * Looks up a definition by name
 * @param {Map} symbolTable - Symbol table to search
 * @param {string} name - Name to look up
 * @returns {Object|undefined} Definition if found, undefined otherwise
 */
export function lookup(symbolTable, name) {
  return symbolTable.get(name)
}

/**
 * Checks if a name is defined in the symbol table
 * @param {Map} symbolTable - Symbol table to check
 * @param {string} name - Name to check
 * @returns {boolean} True if name exists
 */
export function has(symbolTable, name) {
  return symbolTable.has(name)
}

/**
 * Gets all definition names in the symbol table
 * @param {Map} symbolTable - Symbol table
 * @returns {string[]} Array of definition names
 */
export function getNames(symbolTable) {
  return Array.from(symbolTable.keys())
}
