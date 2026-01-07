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
  const tokens = []
  let line = 1
  let column = 1
  let i = 0

  while (i < source.length) {
    const char = source[i]
    const startColumn = column
    const startOffset = i

    // Skip whitespace (except newlines)
    if (char === ' ' || char === '\t' || char === '\r') {
      i++
      column++
      continue
    }

    // Newline
    if (char === '\n') {
      tokens.push({
        type: TokenType.NEWLINE,
        value: '\n',
        line,
        column,
        range: [i, i + 1]
      })
      i++
      line++
      column = 1
      continue
    }

    // Comment
    if (char === '#') {
      const commentStart = i
      let commentValue = ''
      while (i < source.length && source[i] !== '\n') {
        commentValue += source[i]
        i++
      }
      tokens.push({
        type: TokenType.COMMENT,
        value: commentValue,
        line,
        column: startColumn,
        range: [commentStart, i]
      })
      column += commentValue.length
      continue
    }

    // Equals
    if (char === '=') {
      tokens.push({
        type: TokenType.EQUALS,
        value: '=',
        line,
        column,
        range: [i, i + 1]
      })
      i++
      column++
      continue
    }

    // Bracketed token (could be NAME or SELFIES_TOKEN)
    if (char === '[') {
      const tokenStart = i
      let tokenValue = '['
      i++
      column++

      // Read until closing bracket
      while (i < source.length && source[i] !== ']') {
        tokenValue += source[i]
        i++
        column++
      }

      if (i >= source.length) {
        throw new Error(`Unclosed bracket at line ${line}, column ${startColumn}`)
      }

      tokenValue += ']'
      i++
      column++

      // Determine if this is a NAME or SELFIES_TOKEN
      // We'll initially mark all as SELFIES_TOKEN
      // The parser will determine context
      tokens.push({
        type: TokenType.SELFIES_TOKEN,
        value: tokenValue,
        line,
        column: startColumn,
        range: [tokenStart, i]
      })
      continue
    }

    // Unknown character
    throw new Error(`Unexpected character '${char}' at line ${line}, column ${column}`)
  }

  // Add EOF token
  tokens.push({
    type: TokenType.EOF,
    value: '',
    line,
    column,
    range: [i, i]
  })

  return tokens
}
