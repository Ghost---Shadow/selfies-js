/**
 * Tokenizer - Splits SELFIES strings into individual tokens
 *
 * SELFIES tokens are bracketed expressions like [C], [=C], [Branch1], etc.
 */

/**
 * Splits a SELFIES string into individual tokens
 * @param {string} selfies - The SELFIES string to tokenize
 * @returns {string[]} Array of tokens
 *
 * Example:
 *   tokenize('[C][=C][Branch1][C][O]')
 *   // => ['[C]', '[=C]', '[Branch1]', '[C]', '[O]']
 */
export function tokenize(selfies) {
  // TODO: Implement tokenization
  // Algorithm:
  // 1. Scan through string character by character
  // 2. When '[' is found, start accumulating token
  // 3. When ']' is found, complete the token
  // 4. Handle edge cases:
  //    - Unclosed brackets
  //    - Empty tokens []
  //    - Malformed input
  throw new Error('Not implemented')
}

/**
 * Joins tokens back into a SELFIES string
 * @param {string[]} tokens - Array of SELFIES tokens
 * @returns {string} Joined SELFIES string
 *
 * Example:
 *   join(['[C]', '[C]', '[O]']) // => '[C][C][O]'
 */
export function join(tokens) {
  // TODO: Implement token joining
  // Simple concatenation of tokens
  throw new Error('Not implemented')
}
