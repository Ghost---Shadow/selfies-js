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
    'H': 1,
    'F': 1, 'Cl': 1, 'Br': 1, 'I': 1,
    'O': 2, 'O+1': 3, 'O-1': 1,
    'N': 3, 'N+1': 4, 'N-1': 2,
    'C': 4, 'C+1': 3, 'C-1': 3,
    'B': 3, 'B+1': 2, 'B-1': 4,
    'S': 2, 'S+1': 3, 'S-1': 1,  // Stricter than default
    'P': 3, 'P+1': 2, 'P-1': 4,  // Stricter than default
    '?': 8
  },

  // Hypervalent (more permissive for heavy elements)
  hypervalent: {
    'H': 1,
    'F': 1,
    'Cl': 7, 'Br': 7, 'I': 7,  // More permissive for halogens
    'O': 2, 'O+1': 3, 'O-1': 1,
    'N': 5, 'N+1': 6, 'N-1': 4,  // More permissive
    'C': 4, 'C+1': 3, 'C-1': 3,
    'B': 3, 'B+1': 2, 'B-1': 4,
    'S': 6, 'S+1': 5, 'S-1': 5,
    'P': 5, 'P+1': 4, 'P-1': 6,
    '?': 8
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
  if (!(name in PRESET_CONSTRAINTS)) {
    throw new Error(`Unknown preset: ${name}. Valid presets: default, octet_rule, hypervalent`)
  }
  // Return a copy to prevent mutation
  return { ...PRESET_CONSTRAINTS[name] }
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
  // Return a copy to prevent mutation
  return { ..._currentConstraints }
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
  // Validate constraints object
  validateConstraints(constraints)

  // Update current constraints
  _currentConstraints = { ...constraints }
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
  // Build key from element + charge
  const key = charge === 0 ? element : `${element}${charge > 0 ? '+' : ''}${charge}`

  // Look up in current constraints
  if (key in _currentConstraints) {
    return _currentConstraints[key]
  }

  // Fall back to '?' default if not found
  return _currentConstraints['?']
}

/**
 * Validates that a constraint object is well-formed
 * @param {Object} constraints - Constraint object to validate
 * @returns {boolean} True if valid
 * @throws {Error} If constraints are invalid with explanation
 */
export function validateConstraints(constraints) {
  // Check that constraints is an object
  if (typeof constraints !== 'object' || constraints === null) {
    throw new Error('Constraints must be an object')
  }

  // Check that '?' default is present
  if (!('?' in constraints)) {
    throw new Error("Constraints must include '?' default for unknown elements")
  }

  // Check that all values are positive integers
  for (const [element, capacity] of Object.entries(constraints)) {
    if (!Number.isInteger(capacity)) {
      throw new Error(`Bonding capacity for ${element} must be an integer, got ${capacity}`)
    }
    if (capacity < 0) {
      throw new Error(`Bonding capacity for ${element} must be non-negative, got ${capacity}`)
    }
  }

  return true
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
  const capacity = getBondingCapacity(element, charge)
  return usedBonds + newBondOrder > capacity
}

/**
 * Resets constraints to default preset
 */
export function resetConstraints() {
  _currentConstraints = { ...PRESET_CONSTRAINTS.default }
}
