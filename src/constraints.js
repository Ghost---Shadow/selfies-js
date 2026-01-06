/**
 * Constraints - Semantic constraint management for SELFIES
 *
 * Manages bonding constraints that define what chemical structures are valid.
 * Based on selfies-py's bond_constraints.py system.
 */

/**
 * Preset constraint configurations
 * Maps element symbols (with optional charge) to maximum bonding capacity
 */
const PRESET_CONSTRAINTS = {
  // Default constraints (balanced between permissive and realistic)
  default: {
    'H': 1,
    'F': 1, 'Cl': 1, 'Br': 1, 'I': 1,
    'O': 2, 'O+1': 3, 'O-1': 1,
    'N': 3, 'N+1': 4, 'N-1': 2,
    'C': 4, 'C+1': 3, 'C-1': 3,
    'B': 3, 'B+1': 2, 'B-1': 4,
    'S': 6, 'S+1': 5, 'S-1': 5,
    'P': 5, 'P+1': 4, 'P-1': 6,
    '?': 8  // Default for unspecified atoms
  },

  // Octet rule (stricter, follows traditional chemistry)
  octet_rule: {
    // TODO: Fill in octet rule constraints
    // More restrictive: S→2, P→3, etc.
  },

  // Hypervalent (more permissive for heavy elements)
  hypervalent: {
    // TODO: Fill in hypervalent constraints
    // More permissive: Cl/Br/I→7, N→5, etc.
  }
}

/**
 * Current active constraints (default to 'default' preset)
 * This is module-level state
 */
let _currentConstraints = { ...PRESET_CONSTRAINTS.default }

/**
 * Gets a preset constraint configuration by name
 * @param {string} name - Preset name: "default", "octet_rule", or "hypervalent"
 * @returns {Object} Constraint object mapping element → max bonds
 * @throws {Error} If preset name is unknown
 *
 * Example:
 *   const constraints = getPresetConstraints('default')
 *   // { 'C': 4, 'N': 3, 'O': 2, ... }
 */
export function getPresetConstraints(name) {
  // TODO: Validate preset name
  // TODO: Return copy of preset constraints
  throw new Error('Not implemented')
}

/**
 * Gets the current semantic constraints
 * @returns {Object} Current constraint configuration
 *
 * Example:
 *   const constraints = getSemanticConstraints()
 *   console.log(constraints['C'])  // 4
 */
export function getSemanticConstraints() {
  // TODO: Return copy of current constraints
  throw new Error('Not implemented')
}

/**
 * Sets new semantic constraints
 * @param {Object} constraints - Constraint object mapping element → max bonds
 * @throws {Error} If constraints are invalid
 *
 * Example:
 *   setSemanticConstraints({
 *     'C': 4,
 *     'N': 3,
 *     'O': 2,
 *     '?': 8  // default for unknown
 *   })
 */
export function setSemanticConstraints(constraints) {
  // TODO: Validate constraints object
  // TODO: Update _currentConstraints
  // TODO: Invalidate any cached alphabets that depend on constraints
  throw new Error('Not implemented')
}

/**
 * Gets bonding capacity for a specific element (optionally with charge)
 * @param {string} element - Element symbol (e.g., 'C', 'N', 'O')
 * @param {number} charge - Optional charge (default: 0)
 * @returns {number} Maximum number of bonds for this element
 *
 * Example:
 *   getBondingCapacity('C')      // 4
 *   getBondingCapacity('N', 1)   // 4 (N+1)
 *   getBondingCapacity('O', -1)  // 1 (O-1)
 */
export function getBondingCapacity(element, charge = 0) {
  // TODO: Build key from element + charge
  // TODO: Look up in current constraints
  // TODO: Fall back to '?' default if not found
  throw new Error('Not implemented')
}

/**
 * Validates that a constraint object is well-formed
 * @param {Object} constraints - Constraint object to validate
 * @returns {boolean} True if valid
 * @throws {Error} If constraints are invalid with explanation
 */
export function validateConstraints(constraints) {
  // TODO: Check that constraints is an object
  // TODO: Check that all values are positive integers
  // TODO: Check that '?' default is present
  // TODO: Check that common elements are present
  throw new Error('Not implemented')
}

/**
 * Checks if an atom with given bonds would violate constraints
 * @param {string} element - Element symbol
 * @param {number} charge - Atom charge
 * @param {number} usedBonds - Number of bonds already used
 * @param {number} newBondOrder - Order of new bond to add
 * @returns {boolean} True if adding bond would violate constraints
 *
 * Used during parsing to enforce semantic validity
 */
export function wouldViolateConstraints(element, charge, usedBonds, newBondOrder) {
  // TODO: Get bonding capacity for element
  // TODO: Check if usedBonds + newBondOrder > capacity
  throw new Error('Not implemented')
}

/**
 * Resets constraints to default preset
 */
export function resetConstraints() {
  // TODO: Reset to default preset
  throw new Error('Not implemented')
}
