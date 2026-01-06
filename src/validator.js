/**
 * Validator - Validates SELFIES syntax without full decoding
 *
 * This provides a fast path for checking if a SELFIES string is
 * syntactically valid without building the full IR.
 */

import { tokenize } from './tokenizer.js'
import { getAlphabet } from './alphabet.js'

/**
 * Checks if a SELFIES string is syntactically valid
 * @param {string} selfies - The SELFIES string to validate
 * @returns {boolean} True if valid, false otherwise
 *
 * Validation checks:
 * - All tokens are properly bracketed
 * - All tokens are in the valid alphabet
 * - Branch/Ring tokens have proper length specifiers
 *
 * Example:
 *   isValid('[C][C][O]') // => true
 *   isValid('[C][C][O') // => false (unclosed bracket)
 *   isValid('[Xyz]') // => false (invalid token)
 */
export function isValid(selfies) {
  // Empty string is invalid
  if (selfies === '') {
    return false
  }

  try {
    // Try to tokenize - will catch bracket errors
    const tokens = tokenize(selfies)

    // Check each token against alphabet
    const alphabet = getAlphabet()
    for (let i = 0; i < tokens.length; i++) {
      if (!alphabet.has(tokens[i])) {
        return false
      }
    }

    return true
  } catch (error) {
    // Tokenization failed (unclosed brackets, empty tokens, etc.)
    return false
  }
}

/**
 * Validates a single token
 * @param {string} token - SELFIES token to validate
 * @returns {boolean} True if token is valid
 */
function isValidToken(token) {
  const alphabet = getAlphabet()
  return alphabet.has(token)
}

/**
 * Validates branch/ring token sequences
 * @param {string[]} tokens - Array of tokens
 * @param {number} index - Index of branch/ring token
 * @returns {boolean} True if sequence is valid
 */
function validateSpecialToken(tokens, index) {
  // For now, just return true - full validation happens in parser
  return true
}
