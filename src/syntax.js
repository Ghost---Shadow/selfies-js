/**
 * Syntax Highlighting API - Provides token information for syntax highlighting
 *
 * This module exports functions to tokenize SELFIES and DSL code for
 * syntax highlighting in editors and other downstream tools.
 */

import { lex as dslLex, TokenType } from './dsl/lexer.js'
import { getAlphabet, isValidToken } from './alphabet.js'

/**
 * Token types for syntax highlighting
 */
export const SyntaxTokenType = {
  // SELFIES tokens
  ATOM: 'atom',               // Valid atom: [C], [N], [O]
  BOND: 'bond',               // Bond modifier: [=C], [#N]
  BRANCH: 'branch',           // Branch token: [Branch1], [=Branch2]
  RING: 'ring',               // Ring token: [Ring1], [Ring2]
  INVALID_TOKEN: 'invalid_token',  // Invalid SELFIES token

  // DSL tokens
  KEYWORD: 'keyword',         // import, from
  IDENTIFIER: 'identifier',   // User-defined names: [methyl], [ethanol]
  REFERENCE: 'reference',     // Reference to defined name in expression
  OPERATOR: 'operator',       // =
  COMMENT: 'comment',         // # comment
  STRING: 'string',           // "path/to/file.selfies"
  PUNCTUATION: 'punctuation', // *, ,

  // Common
  WHITESPACE: 'whitespace',
  NEWLINE: 'newline',
  ERROR: 'error'              // Syntax errors
}

/**
 * Semantic token modifiers for enhanced highlighting
 */
export const TokenModifier = {
  DEFINITION: 'definition',   // Where a name is defined
  REFERENCE: 'reference',     // Where a name is used
  VALID: 'valid',             // Chemically valid
  INVALID: 'invalid',         // Chemically invalid
  ORGANIC: 'organic',         // Organic subset atom (C, N, O, S, P, F, Cl, Br, I)
  METAL: 'metal',             // Metal atom
  HALOGEN: 'halogen'          // Halogen atom
}

/**
 * Result from tokenization containing tokens and metadata
 * @typedef {Object} TokenizationResult
 * @property {SyntaxToken[]} tokens - Array of syntax tokens
 * @property {Object[]} errors - Array of tokenization errors
 * @property {Object} metadata - Additional metadata (defined names, etc.)
 */

/**
 * Single syntax token
 * @typedef {Object} SyntaxToken
 * @property {string} type - Token type from SyntaxTokenType
 * @property {string} value - Token text
 * @property {number} start - Start offset in source
 * @property {number} end - End offset in source
 * @property {number} line - Line number (1-indexed)
 * @property {number} column - Column number (1-indexed)
 * @property {string[]} [modifiers] - Optional semantic modifiers
 * @property {Object} [data] - Optional additional data
 */

/**
 * Tokenizes a SELFIES string for syntax highlighting
 * @param {string} selfies - SELFIES string
 * @param {Object} [options] - Options
 * @param {boolean} [options.validateAgainstAlphabet=true] - Validate tokens against SELFIES alphabet
 * @param {Set<string>} [options.knownNames] - Set of known DSL names to highlight as references
 * @returns {TokenizationResult} Tokenization result
 *
 * Example:
 *   tokenizeSelfies('[C][=C][Branch1][C][O]')
 *   // {
 *   //   tokens: [
 *   //     { type: 'atom', value: '[C]', start: 0, end: 3, ... },
 *   //     { type: 'bond', value: '[=C]', start: 3, end: 7, ... },
 *   //     { type: 'branch', value: '[Branch1]', start: 7, end: 16, ... },
 *   //     { type: 'atom', value: '[C]', start: 16, end: 19, ... },
 *   //     { type: 'atom', value: '[O]', start: 19, end: 22, ... }
 *   //   ],
 *   //   errors: [],
 *   //   metadata: {}
 *   // }
 */
export function tokenizeSelfies(selfies, options = {}) {
  const {
    validateAgainstAlphabet = true,
    knownNames = new Set()
  } = options

  const tokens = []
  const errors = []
  const regex = /\[[^\]]+\]/g
  let match
  let lastEnd = 0

  // Get the alphabet for validation
  const alphabet = validateAgainstAlphabet ? getAlphabet() : null

  while ((match = regex.exec(selfies)) !== null) {
    // Check for gap (invalid content between tokens)
    if (match.index > lastEnd) {
      const gapContent = selfies.slice(lastEnd, match.index)
      tokens.push({
        type: SyntaxTokenType.ERROR,
        value: gapContent,
        start: lastEnd,
        end: match.index,
        line: 1,
        column: lastEnd + 1
      })
      errors.push({
        message: `Invalid content between tokens: "${gapContent}"`,
        start: lastEnd,
        end: match.index
      })
    }

    const value = match[0]
    const content = value.slice(1, -1) // Remove brackets
    const { type, modifiers } = classifySelfiesToken(content, alphabet, knownNames)

    tokens.push({
      type,
      value,
      start: match.index,
      end: match.index + value.length,
      line: 1,
      column: match.index + 1,
      modifiers
    })

    lastEnd = match.index + value.length
  }

  // Check for trailing content
  if (lastEnd < selfies.length) {
    const trailingContent = selfies.slice(lastEnd)
    tokens.push({
      type: SyntaxTokenType.ERROR,
      value: trailingContent,
      start: lastEnd,
      end: selfies.length,
      line: 1,
      column: lastEnd + 1
    })
    errors.push({
      message: `Invalid trailing content: "${trailingContent}"`,
      start: lastEnd,
      end: selfies.length
    })
  }

  return { tokens, errors, metadata: {} }
}

/**
 * Classifies a SELFIES token content (without brackets)
 * @param {string} content - Token content without brackets
 * @param {Set<string>|null} alphabet - SELFIES alphabet for validation
 * @param {Set<string>} knownNames - Known DSL names
 * @returns {{ type: string, modifiers: string[] }}
 */
function classifySelfiesToken(content, alphabet, knownNames) {
  const fullToken = `[${content}]`
  const modifiers = []

  // Check if it's a known DSL name reference
  if (knownNames.has(fullToken)) {
    return { type: SyntaxTokenType.REFERENCE, modifiers: [TokenModifier.REFERENCE] }
  }

  // Check branches
  if (content.includes('Branch')) {
    // Check for bond-modified branch: [=Branch1], [#Branch1]
    if (content.startsWith('=') || content.startsWith('#')) {
      modifiers.push(content.startsWith('=') ? 'double' : 'triple')
    }
    if (alphabet && !alphabet.has(fullToken)) {
      modifiers.push(TokenModifier.INVALID)
      return { type: SyntaxTokenType.INVALID_TOKEN, modifiers }
    }
    return { type: SyntaxTokenType.BRANCH, modifiers }
  }

  // Check rings
  if (content.includes('Ring')) {
    if (alphabet && !alphabet.has(fullToken)) {
      modifiers.push(TokenModifier.INVALID)
      return { type: SyntaxTokenType.INVALID_TOKEN, modifiers }
    }
    return { type: SyntaxTokenType.RING, modifiers }
  }

  // Check for bond-modified atoms
  if (content.startsWith('=') || content.startsWith('#')) {
    const element = content.slice(1)
    modifiers.push(content.startsWith('=') ? 'double' : 'triple')
    addElementModifiers(element, modifiers)

    if (alphabet && !alphabet.has(fullToken)) {
      modifiers.push(TokenModifier.INVALID)
      return { type: SyntaxTokenType.INVALID_TOKEN, modifiers }
    }
    return { type: SyntaxTokenType.BOND, modifiers }
  }

  // Regular atom
  addElementModifiers(content, modifiers)

  if (alphabet && !alphabet.has(fullToken)) {
    modifiers.push(TokenModifier.INVALID)
    return { type: SyntaxTokenType.INVALID_TOKEN, modifiers }
  }

  modifiers.push(TokenModifier.VALID)
  return { type: SyntaxTokenType.ATOM, modifiers }
}

/**
 * Adds element-specific modifiers
 * @param {string} element - Element symbol
 * @param {string[]} modifiers - Modifiers array to add to
 */
function addElementModifiers(element, modifiers) {
  const organicSubset = ['C', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I', 'B']
  const halogens = ['F', 'Cl', 'Br', 'I']
  const metals = ['Li', 'Na', 'K', 'Mg', 'Ca', 'Fe', 'Cu', 'Zn', 'Al']

  if (organicSubset.includes(element)) {
    modifiers.push(TokenModifier.ORGANIC)
  }
  if (halogens.includes(element)) {
    modifiers.push(TokenModifier.HALOGEN)
  }
  if (metals.includes(element)) {
    modifiers.push(TokenModifier.METAL)
  }
}

/**
 * Tokenizes DSL source code for syntax highlighting
 * @param {string} source - DSL source code
 * @param {Object} [options] - Options
 * @param {boolean} [options.trackDefinitions=true] - Track name definitions
 * @param {boolean} [options.validateSelfies=true] - Validate SELFIES tokens against alphabet
 * @returns {TokenizationResult} Tokenization result
 *
 * Example:
 *   tokenizeDSL('[methyl] = [C]  # comment')
 *   // {
 *   //   tokens: [
 *   //     { type: 'identifier', value: '[methyl]', start: 0, end: 8, modifiers: ['definition'] },
 *   //     { type: 'operator', value: '=', start: 9, end: 10 },
 *   //     { type: 'atom', value: '[C]', start: 11, end: 14, modifiers: ['valid', 'organic'] },
 *   //     { type: 'comment', value: '# comment', start: 16, end: 25 }
 *   //   ],
 *   //   errors: [],
 *   //   metadata: { definedNames: Set(['[methyl]']) }
 *   // }
 */
export function tokenizeDSL(source, options = {}) {
  const {
    trackDefinitions = true,
    validateSelfies = true
  } = options

  const tokens = []
  const errors = []
  const definedNames = new Set()
  const alphabet = validateSelfies ? getAlphabet() : null

  let lexTokens
  try {
    lexTokens = dslLex(source)
  } catch (e) {
    errors.push({
      message: e.message,
      start: 0,
      end: source.length
    })
    return { tokens: [], errors, metadata: { definedNames } }
  }

  // First pass: identify definitions
  let inDefinition = false
  let currentDefinitionName = null

  for (let i = 0; i < lexTokens.length; i++) {
    const token = lexTokens[i]
    const nextToken = lexTokens[i + 1]

    // Track definition context
    if (token.type === TokenType.SELFIES_TOKEN && nextToken?.type === TokenType.EQUALS) {
      definedNames.add(token.value)
    }
  }

  // Second pass: generate syntax tokens with context
  inDefinition = false

  for (let i = 0; i < lexTokens.length; i++) {
    const token = lexTokens[i]
    const nextToken = lexTokens[i + 1]

    // Skip EOF
    if (token.type === TokenType.EOF) continue

    const syntaxToken = {
      value: token.value,
      start: token.range[0],
      end: token.range[1],
      line: token.line,
      column: token.column
    }

    switch (token.type) {
      case TokenType.IMPORT:
        syntaxToken.type = SyntaxTokenType.KEYWORD
        break

      case TokenType.FROM:
        syntaxToken.type = SyntaxTokenType.KEYWORD
        break

      case TokenType.STRING:
        syntaxToken.type = SyntaxTokenType.STRING
        break

      case TokenType.STAR:
      case TokenType.COMMA:
        syntaxToken.type = SyntaxTokenType.PUNCTUATION
        break

      case TokenType.SELFIES_TOKEN:
        // Check if this is a definition (name before =)
        if (nextToken?.type === TokenType.EQUALS) {
          syntaxToken.type = SyntaxTokenType.IDENTIFIER
          syntaxToken.modifiers = [TokenModifier.DEFINITION]
          inDefinition = true
          currentDefinitionName = token.value
        }
        // Check if this is a reference to a defined name
        else if (definedNames.has(token.value)) {
          syntaxToken.type = SyntaxTokenType.REFERENCE
          syntaxToken.modifiers = [TokenModifier.REFERENCE]
          syntaxToken.data = { referenceTo: token.value }
        }
        // Otherwise, treat as SELFIES token
        else {
          const content = token.value.slice(1, -1)
          const { type, modifiers } = classifySelfiesToken(content, alphabet, definedNames)
          syntaxToken.type = type
          syntaxToken.modifiers = modifiers
        }
        break

      case TokenType.EQUALS:
        syntaxToken.type = SyntaxTokenType.OPERATOR
        break

      case TokenType.COMMENT:
        syntaxToken.type = SyntaxTokenType.COMMENT
        break

      case TokenType.NEWLINE:
        syntaxToken.type = SyntaxTokenType.NEWLINE
        inDefinition = false
        break

      case TokenType.NAME:
        // Bare word (shouldn't normally appear in valid DSL)
        syntaxToken.type = SyntaxTokenType.ERROR
        errors.push({
          message: `Unexpected bare word: "${token.value}"`,
          start: token.range[0],
          end: token.range[1]
        })
        break

      default:
        syntaxToken.type = SyntaxTokenType.ERROR
        errors.push({
          message: `Unknown token type: ${token.type}`,
          start: token.range[0],
          end: token.range[1]
        })
    }

    tokens.push(syntaxToken)
  }

  return {
    tokens,
    errors,
    metadata: { definedNames }
  }
}

/**
 * Gets color recommendations for token types
 * @param {string} [theme='dark'] - Theme: 'dark' or 'light'
 * @returns {Object} Map of token type to CSS color value
 *
 * Example:
 *   const colors = getColorScheme('dark')
 *   // { atom: '#61afef', bond: '#c678dd', ... }
 */
export function getColorScheme(theme = 'dark') {
  if (theme === 'light') {
    return {
      [SyntaxTokenType.ATOM]: '#0184bc',          // Blue
      [SyntaxTokenType.BOND]: '#a626a4',          // Purple
      [SyntaxTokenType.BRANCH]: '#c18401',        // Orange
      [SyntaxTokenType.RING]: '#c18401',          // Orange
      [SyntaxTokenType.INVALID_TOKEN]: '#e45649', // Red
      [SyntaxTokenType.KEYWORD]: '#a626a4',       // Purple
      [SyntaxTokenType.IDENTIFIER]: '#0997b3',    // Cyan
      [SyntaxTokenType.REFERENCE]: '#4078f2',     // Bright blue
      [SyntaxTokenType.OPERATOR]: '#383a42',      // Gray
      [SyntaxTokenType.COMMENT]: '#a0a1a7',       // Light gray
      [SyntaxTokenType.STRING]: '#50a14f',        // Green
      [SyntaxTokenType.PUNCTUATION]: '#383a42',   // Gray
      [SyntaxTokenType.WHITESPACE]: 'transparent',
      [SyntaxTokenType.NEWLINE]: 'transparent',
      [SyntaxTokenType.ERROR]: '#e45649'          // Red
    }
  }

  // Dark theme (default)
  return {
    [SyntaxTokenType.ATOM]: '#61afef',          // Blue
    [SyntaxTokenType.BOND]: '#c678dd',          // Purple
    [SyntaxTokenType.BRANCH]: '#e5c07b',        // Yellow/Orange
    [SyntaxTokenType.RING]: '#e5c07b',          // Yellow/Orange
    [SyntaxTokenType.INVALID_TOKEN]: '#e06c75', // Red
    [SyntaxTokenType.KEYWORD]: '#c678dd',       // Purple
    [SyntaxTokenType.IDENTIFIER]: '#56b6c2',    // Cyan
    [SyntaxTokenType.REFERENCE]: '#61afef',     // Blue
    [SyntaxTokenType.OPERATOR]: '#abb2bf',      // Gray
    [SyntaxTokenType.COMMENT]: '#5c6370',       // Dark gray
    [SyntaxTokenType.STRING]: '#98c379',        // Green
    [SyntaxTokenType.PUNCTUATION]: '#abb2bf',   // Gray
    [SyntaxTokenType.WHITESPACE]: 'transparent',
    [SyntaxTokenType.NEWLINE]: 'transparent',
    [SyntaxTokenType.ERROR]: '#e06c75'          // Red
  }
}

/**
 * Gets TextMate-compatible scope names for token types
 * @returns {Object} Map of token type to TextMate scope
 *
 * Useful for integrating with VS Code, Sublime Text, etc.
 */
export function getTextMateScopes() {
  return {
    [SyntaxTokenType.ATOM]: 'entity.name.tag.atom.selfies',
    [SyntaxTokenType.BOND]: 'keyword.operator.bond.selfies',
    [SyntaxTokenType.BRANCH]: 'keyword.control.branch.selfies',
    [SyntaxTokenType.RING]: 'keyword.control.ring.selfies',
    [SyntaxTokenType.INVALID_TOKEN]: 'invalid.illegal.selfies',
    [SyntaxTokenType.KEYWORD]: 'keyword.control.import.selfies',
    [SyntaxTokenType.IDENTIFIER]: 'entity.name.function.selfies',
    [SyntaxTokenType.REFERENCE]: 'variable.other.reference.selfies',
    [SyntaxTokenType.OPERATOR]: 'keyword.operator.assignment.selfies',
    [SyntaxTokenType.COMMENT]: 'comment.line.number-sign.selfies',
    [SyntaxTokenType.STRING]: 'string.quoted.double.selfies',
    [SyntaxTokenType.PUNCTUATION]: 'punctuation.separator.selfies',
    [SyntaxTokenType.WHITESPACE]: 'text.whitespace.selfies',
    [SyntaxTokenType.NEWLINE]: 'text.whitespace.selfies',
    [SyntaxTokenType.ERROR]: 'invalid.illegal.selfies'
  }
}

/**
 * Gets Monaco Editor compatible token types
 * @returns {Object} Map of token type to Monaco token class
 */
export function getMonacoTokenTypes() {
  return {
    [SyntaxTokenType.ATOM]: 'type.identifier',
    [SyntaxTokenType.BOND]: 'keyword',
    [SyntaxTokenType.BRANCH]: 'keyword.control',
    [SyntaxTokenType.RING]: 'keyword.control',
    [SyntaxTokenType.INVALID_TOKEN]: 'invalid',
    [SyntaxTokenType.KEYWORD]: 'keyword',
    [SyntaxTokenType.IDENTIFIER]: 'type.identifier',
    [SyntaxTokenType.REFERENCE]: 'variable',
    [SyntaxTokenType.OPERATOR]: 'operator',
    [SyntaxTokenType.COMMENT]: 'comment',
    [SyntaxTokenType.STRING]: 'string',
    [SyntaxTokenType.PUNCTUATION]: 'delimiter',
    [SyntaxTokenType.WHITESPACE]: 'white',
    [SyntaxTokenType.NEWLINE]: 'white',
    [SyntaxTokenType.ERROR]: 'invalid'
  }
}

/**
 * Creates a Monaco Editor language definition
 * @returns {Object} Monaco language definition object
 */
export function createMonacoLanguage() {
  return {
    id: 'selfies',
    extensions: ['.selfies'],
    aliases: ['SELFIES', 'selfies'],
    mimetypes: ['text/x-selfies'],

    tokenizer: {
      root: [
        // Comments
        [/#.*$/, 'comment'],

        // Keywords
        [/\b(import|from)\b/, 'keyword'],

        // Strings
        [/"[^"]*"/, 'string'],

        // Operators and punctuation
        [/=/, 'operator'],
        [/[*,]/, 'delimiter'],

        // Branch tokens
        [/\[=?#?Branch[123]\]/, 'keyword.control'],

        // Ring tokens
        [/\[-?\/?\\?Ring[123]\]/, 'keyword.control'],

        // Bond + atom tokens
        [/\[[=#][A-Z][a-z]?\]/, 'keyword'],

        // Regular atom tokens
        [/\[[A-Z][a-z]?\]/, 'type.identifier'],

        // User-defined names (identifiers)
        [/\[[a-z][a-zA-Z0-9_]*\]/, 'variable'],

        // Whitespace
        [/\s+/, 'white']
      ]
    }
  }
}

/**
 * Validates that a token stream completely covers the source
 * @param {SyntaxToken[]} tokens - Array of syntax tokens
 * @param {string} originalSource - Original source string
 * @returns {{ valid: boolean, gaps: Array<{start: number, end: number}> }}
 */
export function validateTokenization(tokens, originalSource) {
  const gaps = []
  let expectedPos = 0

  for (const token of tokens) {
    if (token.start > expectedPos) {
      gaps.push({ start: expectedPos, end: token.start })
    }
    expectedPos = Math.max(expectedPos, token.end)
  }

  if (expectedPos < originalSource.length) {
    gaps.push({ start: expectedPos, end: originalSource.length })
  }

  return {
    valid: gaps.length === 0,
    gaps
  }
}

/**
 * Highlights source code by wrapping tokens in HTML spans
 * @param {string} source - Source code
 * @param {Object} [options] - Options
 * @param {string} [options.language='dsl'] - 'selfies' or 'dsl'
 * @param {string} [options.theme='dark'] - Color theme
 * @param {string} [options.classPrefix='selfies-'] - CSS class prefix
 * @returns {string} HTML string with highlighted tokens
 */
export function highlightToHtml(source, options = {}) {
  const {
    language = 'dsl',
    theme = 'dark',
    classPrefix = 'selfies-'
  } = options

  const result = language === 'selfies'
    ? tokenizeSelfies(source)
    : tokenizeDSL(source)

  const colors = getColorScheme(theme)
  let html = ''
  let lastEnd = 0

  for (const token of result.tokens) {
    // Add any gap content
    if (token.start > lastEnd) {
      html += escapeHtml(source.slice(lastEnd, token.start))
    }

    const className = `${classPrefix}${token.type}`
    const color = colors[token.type] || 'inherit'
    const modifierClasses = token.modifiers?.map(m => `${classPrefix}${m}`).join(' ') || ''

    html += `<span class="${className} ${modifierClasses}" style="color: ${color}">${escapeHtml(token.value)}</span>`
    lastEnd = token.end
  }

  // Add any remaining content
  if (lastEnd < source.length) {
    html += escapeHtml(source.slice(lastEnd))
  }

  return html
}

/**
 * Escapes HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
