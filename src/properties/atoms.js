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
  'C': { mass: 12.011, valence: 4, name: 'Carbon' },
  'N': { mass: 14.007, valence: 3, name: 'Nitrogen' },
  'O': { mass: 15.999, valence: 2, name: 'Oxygen' },
  'S': { mass: 32.06, valence: 2, name: 'Sulfur' },
  'P': { mass: 30.974, valence: 3, name: 'Phosphorus' },
  'F': { mass: 18.998, valence: 1, name: 'Fluorine' },
  'Cl': { mass: 35.45, valence: 1, name: 'Chlorine' },
  'Br': { mass: 79.904, valence: 1, name: 'Bromine' },
  'I': { mass: 126.904, valence: 1, name: 'Iodine' },
  'B': { mass: 10.81, valence: 3, name: 'Boron' },
  'H': { mass: 1.008, valence: 1, name: 'Hydrogen' }
}

/**
 * Gets atomic mass for an element
 * @param {string} element - Element symbol (e.g., 'C', 'N', 'O')
 * @returns {number} Atomic mass in g/mol
 * @throws {Error} If element is not supported
 */
export function getAtomicMass(element) {
  const data = ATOMIC_DATA[element]
  if (!data) {
    throw new Error(`Unsupported element: ${element}`)
  }
  return data.mass
}

/**
 * Gets standard valence for an element
 * @param {string} element - Element symbol
 * @returns {number} Standard valence
 * @throws {Error} If element is not supported
 */
export function getValence(element) {
  const data = ATOMIC_DATA[element]
  if (!data) {
    throw new Error(`Unsupported element: ${element}`)
  }
  return data.valence
}

/**
 * Checks if an element is supported
 * @param {string} element - Element symbol to check
 * @returns {boolean} True if element is supported
 */
export function isSupported(element) {
  return element in ATOMIC_DATA
}

/**
 * Gets list of all supported element symbols
 * @returns {string[]} Array of element symbols
 */
export function getSupportedElements() {
  return Object.keys(ATOMIC_DATA)
}
