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
  // TODO: Implement validation
  // Algorithm:
  // 1. Try to tokenize - catch any bracket errors
  // 2. Check each token against alphabet
  // 3. Validate branch/ring token sequences have proper specifiers
  // 4. Return true if all checks pass, false otherwise
  throw new Error('Not implemented')
}

/**
 * Validates a single token
 * @param {string} token - SELFIES token to validate
 * @returns {boolean} True if token is valid
 */
function isValidToken(token) {
  // TODO: Check if token is in alphabet
  throw new Error('Not implemented')
}

/**
 * Validates branch/ring token sequences
 * @param {string[]} tokens - Array of tokens
 * @param {number} index - Index of branch/ring token
 * @returns {boolean} True if sequence is valid
 */
function validateSpecialToken(tokens, index) {
  // TODO: Validate that branch/ring tokens are followed by
  // appropriate length specifier tokens
  throw new Error('Not implemented')
}
