/**
 * Alphabet - Valid SELFIES token sets
 *
 * Defines the full SELFIES alphabet and semantic-robust subset.
 */

/**
 * Full SELFIES alphabet - all valid tokens
 * @type {Set<string>}
 */
let _alphabet = null

/**
 * Semantic-robust alphabet - tokens that are always chemically meaningful
 * @type {Set<string>}
 */
let _semanticAlphabet = null

/**
 * Gets the full SELFIES alphabet
 * @returns {Set<string>} Set of all valid SELFIES tokens
 */
export function getAlphabet() {
  if (_alphabet === null) {
    _alphabet = new Set()

    // Add all atom tokens (basic, double bond, triple bond)
    const atomTokens = buildAtomTokens()
    for (const token of atomTokens) {
      _alphabet.add(token)
    }

    // Add structural tokens (branches, rings, length specifiers)
    const structuralTokens = buildStructuralTokens()
    for (const token of structuralTokens) {
      _alphabet.add(token)
    }
  }

  return _alphabet
}

/**
 * Gets the semantic-robust SELFIES alphabet
 * @returns {Set<string>} Set of semantically robust tokens
 *
 * Semantic-robust tokens are those that produce valid molecules
 * regardless of context (no branch/ring tokens, etc.)
 */
export function getSemanticAlphabet() {
  if (_semanticAlphabet === null) {
    _semanticAlphabet = new Set()

    // Add only atom tokens (basic, double bond, triple bond)
    // Exclude structural tokens (Branch, Ring) as they are context-dependent
    const atomTokens = buildAtomTokens()
    for (const token of atomTokens) {
      _semanticAlphabet.add(token)
    }
  }

  return _semanticAlphabet
}

/**
 * Checks if a token is in the alphabet
 * @param {string} token - Token to check
 * @returns {boolean} True if token is valid
 */
export function isValidToken(token) {
  return getAlphabet().has(token)
}

/**
 * Checks if a token is semantic-robust
 * @param {string} token - Token to check
 * @returns {boolean} True if token is semantic-robust
 */
export function isSemanticRobust(token) {
  return getSemanticAlphabet().has(token)
}

/**
 * Builds the list of all atom tokens (with bond modifiers)
 * @returns {string[]} Array of atom tokens
 */
function buildAtomTokens() {
  const elements = ['C', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I', 'B']
  const tokens = []

  for (const element of elements) {
    tokens.push(`[${element}]`)      // basic atom
    tokens.push(`[=${element}]`)     // double bond
    tokens.push(`[#${element}]`)     // triple bond
  }

  return tokens
}

/**
 * Builds the list of structural tokens (branch, ring)
 * @returns {string[]} Array of structural tokens
 */
function buildStructuralTokens() {
  const tokens = []

  // Branch and Ring tokens
  tokens.push('[Branch1]', '[Branch2]', '[Branch3]')
  tokens.push('[Ring1]', '[Ring2]', '[Ring3]')

  // Numeric tokens used as length specifiers (based on atom tokens)
  // These are the same as bond-modified atoms but used as numbers
  tokens.push('[=Branch1]', '[=Branch2]', '[=Branch3]')
  tokens.push('[#Branch1]', '[#Branch2]', '[#Branch3]')

  return tokens
}

/**
 * Extracts the unique SELFIES alphabet from a collection of SELFIES strings
 * @param {Iterable<string>} selfiesIterable - Collection of SELFIES strings
 * @returns {Set<string>} Set of unique SELFIES symbols found
 *
 * Based on selfies-py's get_alphabet_from_selfies() function.
 *
 * Example:
 *   const alphabet = getAlphabetFromSelfies(['[C][C][O]', '[N][C][=O]'])
 *   // Set { '[C]', '[O]', '[N]', '[=O]' }
 *
 * Reference: selfies-py/selfies/utils/selfies_utils.py::get_alphabet_from_selfies()
 */
export function getAlphabetFromSelfies(selfiesIterable) {
  // TODO: Will implement this after tokenizer is ready
  // For now, manually tokenize by extracting [...] patterns
  const alphabet = new Set()

  for (const selfies of selfiesIterable) {
    // Simple regex-based tokenization (temporary until tokenizer.js is ready)
    const tokens = selfies.match(/\[[^\]]+\]/g) || []
    for (const token of tokens) {
      alphabet.add(token)
    }
  }

  return alphabet
}
