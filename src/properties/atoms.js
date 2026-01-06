/**
 * Atoms - Atomic data for SELFIES elements
 *
 * Contains atomic masses, valences, and other properties for
 * supported elements.
 */

/**
 * Atomic data for supported elements
 * Maps element symbol to properties
 */
export const ATOMIC_DATA = {
  // TODO: Fill in atomic data for all supported elements
  // Format:
  // 'C': { mass: 12.011, valence: 4, name: 'Carbon' },
  // 'N': { mass: 14.007, valence: 3, name: 'Nitrogen' },
  // etc.
  //
  // Supported elements (from design doc):
  // C, N, O, S, P, F, Cl, Br, I, B
}

/**
 * Gets atomic mass for an element
 * @param {string} element - Element symbol (e.g., 'C', 'N', 'O')
 * @returns {number} Atomic mass in g/mol
 * @throws {Error} If element is not supported
 */
export function getAtomicMass(element) {
  // TODO: Look up and return atomic mass
  throw new Error('Not implemented')
}

/**
 * Gets standard valence for an element
 * @param {string} element - Element symbol
 * @returns {number} Standard valence
 * @throws {Error} If element is not supported
 */
export function getValence(element) {
  // TODO: Look up and return valence
  throw new Error('Not implemented')
}

/**
 * Checks if an element is supported
 * @param {string} element - Element symbol to check
 * @returns {boolean} True if element is supported
 */
export function isSupported(element) {
  // TODO: Check if element exists in ATOMIC_DATA
  throw new Error('Not implemented')
}

/**
 * Gets list of all supported element symbols
 * @returns {string[]} Array of element symbols
 */
export function getSupportedElements() {
  // TODO: Return array of keys from ATOMIC_DATA
  throw new Error('Not implemented')
}
