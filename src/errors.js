/**
 * Errors - Custom error types for selfies-js
 *
 * Defines specific error classes for different failure modes.
 */

/**
 * Base error class for selfies-js errors
 */
export class SelfiesError extends Error {
  constructor(message) {
    super(message)
    this.name = 'SelfiesError'
  }
}

/**
 * Error thrown when decoding fails
 */
export class DecodeError extends SelfiesError {
  constructor(message, token = null, position = null) {
    super(message)
    this.name = 'DecodeError'
    this.token = token
    this.position = position
  }
}

/**
 * Error thrown when encoding fails
 */
export class EncodeError extends SelfiesError {
  constructor(message, smiles = null) {
    super(message)
    this.name = 'EncodeError'
    this.smiles = smiles
  }
}

/**
 * Error thrown when resolution fails
 */
export class ResolveError extends SelfiesError {
  constructor(message, name = null) {
    super(message)
    this.name = 'ResolveError'
    this.definitionName = name
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends SelfiesError {
  constructor(message, token = null, position = null) {
    super(message)
    this.name = 'ValidationError'
    this.token = token
    this.position = position
  }
}

/**
 * Error thrown when DSL parsing fails
 */
export class ParseError extends SelfiesError {
  constructor(message, line = null, column = null) {
    super(message)
    this.name = 'ParseError'
    this.line = line
    this.column = column
  }
}

// TODO: Add more specific error types as needed during implementation
// Examples:
// - CyclicDependencyError
// - UndefinedReferenceError
// - InvalidTokenError
