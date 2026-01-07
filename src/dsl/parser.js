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
  const tokens = lex(source)
  const program = {
    definitions: new Map(),
    errors: [],
    warnings: []
  }

  let i = 0

  while (i < tokens.length && tokens[i].type !== TokenType.EOF) {
    const token = tokens[i]

    // Skip comments and newlines
    if (token.type === TokenType.COMMENT || token.type === TokenType.NEWLINE) {
      i++
      continue
    }

    // Parse definition line
    const { definition, errors, nextIndex } = parseDefinition(tokens, i)

    if (definition) {
      // Check for duplicate definitions
      if (program.definitions.has(definition.name)) {
        program.errors.push({
          message: `Duplicate definition of '${definition.name}'`,
          severity: 'error',
          line: definition.line,
          column: 1,
          range: definition.range
        })
      } else {
        program.definitions.set(definition.name, definition)
      }
    }

    if (errors && errors.length > 0) {
      program.errors.push(...errors)
    }

    i = nextIndex
  }

  return program
}

/**
 * Parses a single definition line
 * @param {Object[]} tokens - Tokens for the line
 * @param {number} startIndex - Index to start parsing
 * @returns {{definition: Object, errors: Object[], nextIndex: number}} Parsed definition and any errors
 */
function parseDefinition(tokens, startIndex) {
  const errors = []
  let i = startIndex
  const lineStart = tokens[i].line

  // Expected pattern: [name] = [token] [token] ... NEWLINE|EOF

  // 1. Expect NAME (SELFIES_TOKEN that acts as name)
  if (tokens[i].type !== TokenType.SELFIES_TOKEN) {
    errors.push(createDiagnostic(
      `Expected definition name, got ${tokens[i].type}`,
      'error',
      tokens[i]
    ))
    // Skip to next line
    while (i < tokens.length && tokens[i].type !== TokenType.NEWLINE && tokens[i].type !== TokenType.EOF) {
      i++
    }
    if (tokens[i].type === TokenType.NEWLINE) i++
    return { definition: null, errors, nextIndex: i }
  }

  const nameToken = tokens[i]
  const name = nameToken.value.slice(1, -1) // Remove brackets
  i++

  // 2. Expect EQUALS
  if (i >= tokens.length || tokens[i].type !== TokenType.EQUALS) {
    errors.push(createDiagnostic(
      `Expected '=' after definition name`,
      'error',
      tokens[i] || nameToken
    ))
    // Skip to next line
    while (i < tokens.length && tokens[i].type !== TokenType.NEWLINE && tokens[i].type !== TokenType.EOF) {
      i++
    }
    if (i < tokens.length && tokens[i].type === TokenType.NEWLINE) i++
    return { definition: null, errors, nextIndex: i }
  }
  i++

  // 3. Collect SELFIES_TOKENs until NEWLINE or EOF
  const definitionTokens = []
  const tokenStart = nameToken.range[0]
  let tokenEnd = tokens[i - 1].range[1]

  while (i < tokens.length &&
         tokens[i].type !== TokenType.NEWLINE &&
         tokens[i].type !== TokenType.EOF &&
         tokens[i].type !== TokenType.COMMENT) {
    if (tokens[i].type === TokenType.SELFIES_TOKEN) {
      definitionTokens.push(tokens[i].value)
      tokenEnd = tokens[i].range[1]
      i++
    } else {
      errors.push(createDiagnostic(
        `Unexpected token in definition body: ${tokens[i].type}`,
        'error',
        tokens[i]
      ))
      i++
    }
  }

  // 4. Check if we have at least one token
  if (definitionTokens.length === 0) {
    errors.push(createDiagnostic(
      `Definition must have at least one token`,
      'error',
      nameToken
    ))
  }

  // Skip trailing comment if present
  if (i < tokens.length && tokens[i].type === TokenType.COMMENT) {
    i++
  }

  // Skip newline
  if (i < tokens.length && tokens[i].type === TokenType.NEWLINE) {
    i++
  }

  const definition = {
    name,
    tokens: definitionTokens,
    line: lineStart,
    range: [tokenStart, tokenEnd]
  }

  return { definition, errors, nextIndex: i }
}

/**
 * Creates a diagnostic object
 * @param {string} message - Error/warning message
 * @param {string} severity - 'error' or 'warning'
 * @param {Object} token - Token where diagnostic occurred
 * @returns {Object} Diagnostic object
 */
function createDiagnostic(message, severity, token) {
  return {
    message,
    severity,
    line: token.line,
    column: token.column,
    range: token.range
  }
}
