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
  // TODO: Build and cache alphabet
  // Include:
  // - Basic atoms: [C], [N], [O], [S], [P], [F], [Cl], [Br], [I], [B]
  // - Bond modifiers: [=C], [=N], [=O], [#C], [#N], etc.
  // - Branches: [Branch1], [Branch2], [Branch3]
  // - Rings: [Ring1], [Ring2], [Ring3]
  // - Special tokens for branch/ring length specifiers

  if (_alphabet === null) {
    _alphabet = new Set()
    // TODO: Populate alphabet
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
  // TODO: Build and cache semantic alphabet
  // Include only:
  // - Basic atoms: [C], [N], [O], etc.
  // - Bond modifiers: [=C], [#N], etc.
  // Exclude:
  // - Branch/Ring tokens (context-dependent)

  if (_semanticAlphabet === null) {
    _semanticAlphabet = new Set()
    // TODO: Populate semantic alphabet
  }

  return _semanticAlphabet
}

/**
 * Checks if a token is in the alphabet
 * @param {string} token - Token to check
 * @returns {boolean} True if token is valid
 */
export function isValidToken(token) {
  // TODO: Check if token is in alphabet
  throw new Error('Not implemented')
}

/**
 * Checks if a token is semantic-robust
 * @param {string} token - Token to check
 * @returns {boolean} True if token is semantic-robust
 */
export function isSemanticRobust(token) {
  // TODO: Check if token is in semantic alphabet
  throw new Error('Not implemented')
}

/**
 * Builds the list of all atom tokens (with bond modifiers)
 * @returns {string[]} Array of atom tokens
 */
function buildAtomTokens() {
  // TODO: Generate atom tokens
  // For each element (C, N, O, S, P, F, Cl, Br, I, B):
  //   - Add basic token: [C]
  //   - Add double bond: [=C]
  //   - Add triple bond: [#C]
  throw new Error('Not implemented')
}

/**
 * Builds the list of structural tokens (branch, ring)
 * @returns {string[]} Array of structural tokens
 */
function buildStructuralTokens() {
  // TODO: Generate structural tokens
  // - [Branch1], [Branch2], [Branch3]
  // - [Ring1], [Ring2], [Ring3]
  // - Numeric tokens used as length specifiers
  throw new Error('Not implemented')
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
  // TODO: Implement alphabet extraction
  // Algorithm:
  // 1. Create empty Set
  // 2. For each SELFIES string in iterable:
  //    a. Tokenize it
  //    b. Add each token to the Set
  // 3. Return the Set
  // Note: Uses Set for automatic deduplication
  throw new Error('Not implemented')
}
