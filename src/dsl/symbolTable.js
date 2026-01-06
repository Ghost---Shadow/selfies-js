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
  // TODO: Return new Map
  throw new Error('Not implemented')
}

/**
 * Adds a definition to the symbol table
 * @param {Map} symbolTable - Symbol table to update
 * @param {string} name - Definition name
 * @param {Object} definition - Definition object
 * @throws {Error} If name already exists
 */
export function addDefinition(symbolTable, name, definition) {
  // TODO: Add definition to symbol table
  // Check for duplicates and throw error if exists
  throw new Error('Not implemented')
}

/**
 * Looks up a definition by name
 * @param {Map} symbolTable - Symbol table to search
 * @param {string} name - Name to look up
 * @returns {Object|undefined} Definition if found, undefined otherwise
 */
export function lookup(symbolTable, name) {
  // TODO: Look up name in symbol table
  throw new Error('Not implemented')
}

/**
 * Checks if a name is defined in the symbol table
 * @param {Map} symbolTable - Symbol table to check
 * @param {string} name - Name to check
 * @returns {boolean} True if name exists
 */
export function has(symbolTable, name) {
  // TODO: Check if name exists in symbol table
  throw new Error('Not implemented')
}

/**
 * Gets all definition names in the symbol table
 * @param {Map} symbolTable - Symbol table
 * @returns {string[]} Array of definition names
 */
export function getNames(symbolTable) {
  // TODO: Return array of all names in symbol table
  throw new Error('Not implemented')
}
