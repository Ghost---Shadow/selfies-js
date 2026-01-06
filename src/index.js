/**
 * selfies-js - Pure JavaScript SELFIES encoder/decoder
 *
 * Public API exports
 */

// Core functionality
export { decode } from './decoder.js'
export { encode } from './encoder.js'
export { isValid } from './validator.js'

// Tokenization
export { tokenize, join } from './tokenizer.js'

// Properties
export { getMolecularWeight } from './properties/molecularWeight.js'
export { getFormula } from './properties/formula.js'

// Alphabet
export { getAlphabet, getSemanticAlphabet } from './alphabet.js'

// DSL
export { parse } from './dsl/parser.js'
export { resolve, resolveAll } from './dsl/resolver.js'
export { getDependencies, getDependents } from './dsl/analyzer.js'

// Errors
export {
  SelfiesError,
  DecodeError,
  EncodeError,
  ResolveError,
  ValidationError,
  ParseError,
} from './errors.js'
