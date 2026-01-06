/**
 * DSL Lexer - Tokenizes .selfies DSL source code
 *
 * The DSL allows defining named SELFIES molecules:
 *   [methyl] = [C]
 *   [ethanol] = [methyl][C][O]
 */

/**
 * Token types for DSL
 */
export const TokenType = {
  NAME: 'NAME',           // [identifier]
  EQUALS: 'EQUALS',       // =
  SELFIES_TOKEN: 'SELFIES_TOKEN', // [C], [=O], etc.
  COMMENT: 'COMMENT',     // # comment
  NEWLINE: 'NEWLINE',     // \n
  EOF: 'EOF',             // end of file
}

/**
 * Lexes DSL source code into tokens
 * @param {string} source - DSL source code
 * @returns {Object[]} Array of tokens with type, value, line, column
 *
 * Token structure:
 * {
 *   type: TokenType,
 *   value: string,
 *   line: number,
 *   column: number,
 *   range: [number, number]  // character offsets
 * }
 */
export function lex(source) {
  // TODO: Implement DSL lexer
  // Algorithm:
  // 1. Scan through source character by character
  // 2. Track line and column numbers
  // 3. Recognize patterns:
  //    - [identifier] at start of line = NAME
  //    - [token] after equals = SELFIES_TOKEN
  //    - = symbol = EQUALS
  //    - # to end of line = COMMENT
  //    - \n = NEWLINE
  // 4. Build and return token array
  throw new Error('Not implemented')
}

/**
 * Helper: Determines if character is start of identifier
 * @param {string} char - Character to check
 * @returns {boolean} True if valid identifier start
 */
function isIdentifierStart(char) {
  // TODO: Check if char is letter or underscore
  throw new Error('Not implemented')
}

/**
 * Helper: Determines if character can be in identifier
 * @param {string} char - Character to check
 * @returns {boolean} True if valid identifier character
 */
function isIdentifierChar(char) {
  // TODO: Check if char is letter, digit, underscore, or hyphen
  throw new Error('Not implemented')
}
