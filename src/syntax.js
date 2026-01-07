/**
 * Syntax Highlighting API - Provides token information for syntax highlighting
 *
 * This module exports functions to tokenize SELFIES and DSL code for
 * syntax highlighting in editors and other downstream tools.
 */

import { lex as dslLex, TokenType } from './dsl/lexer.js'

/**
 * Token types for syntax highlighting
 */
export const SyntaxTokenType = {
  // SELFIES tokens
  ATOM: 'atom',
  BOND: 'bond',
  BRANCH: 'branch',
  RING: 'ring',
  BRACKET: 'bracket',

  // DSL tokens
  KEYWORD: 'keyword',
  IDENTIFIER: 'identifier',
  OPERATOR: 'operator',
  COMMENT: 'comment',
  STRING: 'string',
  NUMBER: 'number',

  // Common
  WHITESPACE: 'whitespace',
  INVALID: 'invalid'
}

/**
 * Tokenizes a SELFIES string for syntax highlighting
 * @param {string} selfies - SELFIES string
 * @returns {Object[]} Array of syntax tokens
 *
 * Each token has:
 * {
 *   type: string,        // Token type from SyntaxTokenType
 *   value: string,       // Token text
 *   start: number,       // Start position in string
 *   end: number          // End position in string
 * }
 *
 * Example:
 *   tokenizeSelfies('[C][=C][Branch1][C]')
 *   // [
 *   //   { type: 'atom', value: '[C]', start: 0, end: 3 },
 *   //   { type: 'bond', value: '[=C]', start: 3, end: 7 },
 *   //   { type: 'branch', value: '[Branch1]', start: 7, end: 16 },
 *   //   { type: 'atom', value: '[C]', start: 16, end: 19 }
 *   // ]
 */
export function tokenizeSelfies(selfies) {
  const tokens = []
  const regex = /\[[^\]]+\]/g
  let match

  while ((match = regex.exec(selfies)) !== null) {
    const value = match[0]
    const content = value.slice(1, -1) // Remove brackets

    let type = SyntaxTokenType.ATOM

    // Determine token type
    if (content.includes('Branch')) {
      type = SyntaxTokenType.BRANCH
    } else if (content.includes('Ring')) {
      type = SyntaxTokenType.RING
    } else if (content.startsWith('=') || content.startsWith('#')) {
      type = SyntaxTokenType.BOND
    }

    tokens.push({
      type,
      value,
      start: match.index,
      end: match.index + value.length
    })
  }

  return tokens
}

/**
 * Tokenizes DSL source code for syntax highlighting
 * @param {string} source - DSL source code
 * @returns {Object[]} Array of syntax tokens
 *
 * Example:
 *   tokenizeDSL('[methyl] = [C]  # comment')
 *   // [
 *   //   { type: 'identifier', value: '[methyl]', start: 0, end: 8, line: 1 },
 *   //   { type: 'operator', value: '=', start: 9, end: 10, line: 1 },
 *   //   { type: 'atom', value: '[C]', start: 11, end: 14, line: 1 },
 *   //   { type: 'comment', value: '# comment', start: 16, end: 25, line: 1 }
 *   // ]
 */
export function tokenizeDSL(source) {
  const lexTokens = dslLex(source)
  const syntaxTokens = []

  for (const token of lexTokens) {
    let type = SyntaxTokenType.WHITESPACE

    switch (token.type) {
      case TokenType.SELFIES_TOKEN:
        // Could be identifier or atom depending on context
        type = token.value.match(/^\[(methyl|ethyl|propyl|butyl|hydroxyl|carboxyl|amino)\]/)
          ? SyntaxTokenType.IDENTIFIER
          : SyntaxTokenType.ATOM
        break
      case TokenType.EQUALS:
        type = SyntaxTokenType.OPERATOR
        break
      case TokenType.COMMENT:
        type = SyntaxTokenType.COMMENT
        break
      case TokenType.NEWLINE:
        type = SyntaxTokenType.WHITESPACE
        break
      case TokenType.IMPORT:
        type = SyntaxTokenType.KEYWORD
        break
      case TokenType.FROM:
        type = SyntaxTokenType.KEYWORD
        break
      case TokenType.STRING:
        type = SyntaxTokenType.STRING
        break
      default:
        type = SyntaxTokenType.INVALID
    }

    syntaxTokens.push({
      type,
      value: token.value,
      start: token.range[0],
      end: token.range[1],
      line: token.line
    })
  }

  return syntaxTokens
}

/**
 * Gets color recommendations for token types
 * @returns {Object} Map of token type to recommended color
 *
 * Colors are provided as semantic names that can be mapped to
 * specific colors by the consumer.
 */
export function getColorScheme() {
  return {
    [SyntaxTokenType.ATOM]: 'blue',
    [SyntaxTokenType.BOND]: 'purple',
    [SyntaxTokenType.BRANCH]: 'orange',
    [SyntaxTokenType.RING]: 'orange',
    [SyntaxTokenType.BRACKET]: 'gray',
    [SyntaxTokenType.KEYWORD]: 'magenta',
    [SyntaxTokenType.IDENTIFIER]: 'cyan',
    [SyntaxTokenType.OPERATOR]: 'yellow',
    [SyntaxTokenType.COMMENT]: 'green',
    [SyntaxTokenType.STRING]: 'red',
    [SyntaxTokenType.NUMBER]: 'blue',
    [SyntaxTokenType.WHITESPACE]: 'none',
    [SyntaxTokenType.INVALID]: 'red-bold'
  }
}

/**
 * Validates that a token stream is complete and well-formed
 * @param {Object[]} tokens - Array of syntax tokens
 * @param {string} originalSource - Original source string
 * @returns {boolean} True if tokens cover entire source
 */
export function validateTokenization(tokens, originalSource) {
  if (tokens.length === 0) {
    return originalSource.length === 0
  }

  // Check that tokens are contiguous and cover the entire source
  let expectedPos = 0
  for (const token of tokens) {
    if (token.start !== expectedPos) {
      return false
    }
    expectedPos = token.end
  }

  return expectedPos === originalSource.length
}
