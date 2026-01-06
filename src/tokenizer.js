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
  if (selfies === '') {
    return []
  }

  const tokens = []
  let current = ''
  let inToken = false

  for (let i = 0; i < selfies.length; i++) {
    const char = selfies[i]

    if (char === '[') {
      if (inToken) {
        throw new Error(`Unclosed bracket at position ${i}`)
      }
      inToken = true
      current = '['
    } else if (char === ']') {
      if (!inToken) {
        throw new Error(`Unexpected closing bracket at position ${i}`)
      }
      current += ']'

      // Check for empty token
      if (current === '[]') {
        throw new Error(`Empty token at position ${i - 1}`)
      }

      tokens.push(current)
      current = ''
      inToken = false
    } else if (inToken) {
      current += char
    } else {
      throw new Error(`Character '${char}' outside of token at position ${i}`)
    }
  }

  // Check for unclosed bracket at end
  if (inToken) {
    throw new Error(`Unclosed bracket at end of string`)
  }

  return tokens
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
  return tokens.join('')
}

/**
 * Counts the number of SELFIES symbols (not character length)
 * @param {string} selfies - The SELFIES string
 * @returns {number} Number of symbols
 *
 * This is more efficient than tokenize().length as it just counts '[' characters.
 * Based on selfies-py's len_selfies() function.
 *
 * Example:
 *   lenSelfies('[C][C][O]')  // => 3 (not 9!)
 *   lenSelfies('[Cl][Br]')   // => 2
 *
 * Reference: selfies-py/selfies/utils/selfies_utils.py::len_selfies()
 */
export function lenSelfies(selfies) {
  // Count occurrences of '[' character
  // This equals the number of symbols and is faster than tokenizing
  let count = 0
  for (let i = 0; i < selfies.length; i++) {
    if (selfies[i] === '[') {
      count++
    }
  }
  return count
}
