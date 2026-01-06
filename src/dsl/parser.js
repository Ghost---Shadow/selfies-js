/**
 * DSL Parser - Parses DSL tokens into AST and symbol table
 *
 * Converts lexer tokens into a structured Program object with
 * definitions, errors, and warnings.
 */

import { lex, TokenType } from './lexer.js'

/**
 * Parses DSL source code into a Program object
 * @param {string} source - DSL source code
 * @returns {Object} Program object
 *
 * Program structure:
 * {
 *   definitions: Map<string, Definition>,
 *   errors: Diagnostic[],
 *   warnings: Diagnostic[]
 * }
 *
 * Definition structure:
 * {
 *   name: string,
 *   tokens: Token[],      // SELFIES tokens in the definition
 *   line: number,
 *   range: [number, number]
 * }
 *
 * Diagnostic structure:
 * {
 *   message: string,
 *   severity: 'error' | 'warning',
 *   line: number,
 *   column: number,
 *   range: [number, number]
 * }
 */
export function parse(source) {
  // TODO: Implement DSL parser
  // Algorithm:
  // 1. Lex the source into tokens
  // 2. Initialize program structure
  // 3. Parse each line:
  //    - Expect: NAME EQUALS SELFIES_TOKEN+ NEWLINE
  //    - Build Definition objects
  //    - Detect syntax errors
  // 4. Check for duplicate definitions
  // 5. Return program with definitions and diagnostics
  throw new Error('Not implemented')
}

/**
 * Parses a single definition line
 * @param {Object[]} tokens - Tokens for the line
 * @param {number} startIndex - Index to start parsing
 * @returns {{definition: Object, errors: Object[]}} Parsed definition and any errors
 */
function parseDefinition(tokens, startIndex) {
  // TODO: Parse definition from token stream
  // Expected pattern: [name] = [token] [token] ...
  throw new Error('Not implemented')
}

/**
 * Creates a diagnostic object
 * @param {string} message - Error/warning message
 * @param {string} severity - 'error' or 'warning'
 * @param {Object} token - Token where diagnostic occurred
 * @returns {Object} Diagnostic object
 */
function createDiagnostic(message, severity, token) {
  // TODO: Build diagnostic object with proper structure
  throw new Error('Not implemented')
}
