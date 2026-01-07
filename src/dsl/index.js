/**
 * DSL Module - Public API exports
 *
 * This module provides the complete DSL functionality for defining
 * named SELFIES molecules.
 */

export { lex, TokenType } from './lexer.js'
export { parse } from './parser.js'
export { resolve, resolveAll, ResolveError } from './resolver.js'
export {
  getDependencies,
  getDependents,
  detectCycles,
  findUnused
} from './analyzer.js'
export {
  createSymbolTable,
  addDefinition,
  lookup,
  has,
  getNames
} from './symbolTable.js'
export {
  validateValence,
  validateProgramValence
} from './valenceValidator.js'
export {
  parseImports,
  loadWithImports,
  loadFile
} from './importer.js'
