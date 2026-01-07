/**
 * Valence Validator - Validates chemical valence in DSL definitions
 *
 * Checks that SELFIES molecules defined in the DSL follow valence rules
 * and returns compilation errors for invalid structures.
 */

import { getBondingCapacity } from '../constraints.js'
import { decode } from '../decoder.js'

/**
 * Validates valence for a resolved SELFIES string
 * @param {string} selfies - Resolved SELFIES string
 * @param {string} defName - Definition name (for error messages)
 * @returns {Object[]} Array of valence error diagnostics
 *
 * Each diagnostic contains:
 * {
 *   message: string,
 *   severity: 'error',
 *   definitionName: string
 * }
 */
export function validateValence(selfies, defName) {
  const errors = []

  try {
    // Try to decode to SMILES - this will catch many structural issues
    const smiles = decode(selfies)

    // Parse the SELFIES to extract atoms and bonds
    const tokens = tokenizeSelfies(selfies)
    const atomBonds = calculateBonds(tokens)

    // Check each atom's valence
    for (const [atom, bondCount] of Object.entries(atomBonds)) {
      const { element, charge } = parseAtom(atom)
      const maxBonds = getBondingCapacity(element, charge)

      if (bondCount > maxBonds) {
        errors.push({
          message: `Valence error in '${defName}': ${element} has ${bondCount} bonds but max is ${maxBonds}`,
          severity: 'error',
          definitionName: defName
        })
      }
    }
  } catch (error) {
    // If decoding fails, it's a structural error
    errors.push({
      message: `Invalid structure in '${defName}': ${error.message}`,
      severity: 'error',
      definitionName: defName
    })
  }

  return errors
}

/**
 * Validates valence for all definitions in a program
 * @param {Object} program - Program object with definitions
 * @param {Map} resolvedMap - Map of resolved SELFIES strings
 * @returns {Object[]} Array of all valence errors
 */
export function validateProgramValence(program, resolvedMap) {
  const allErrors = []

  for (const [name, definition] of program.definitions) {
    if (resolvedMap.has(name)) {
      const selfies = resolvedMap.get(name)
      const errors = validateValence(selfies, name)
      allErrors.push(...errors)
    }
  }

  return allErrors
}

/**
 * Tokenizes SELFIES string into individual tokens
 * @param {string} selfies - SELFIES string
 * @returns {string[]} Array of tokens
 */
function tokenizeSelfies(selfies) {
  const tokens = selfies.match(/\[[^\]]+\]/g) || []
  return tokens
}

/**
 * Calculates bond counts for each atom
 * @param {string[]} tokens - SELFIES tokens
 * @returns {Object} Map of atom index to bond count
 */
function calculateBonds(tokens) {
  const atomBonds = {}
  let atomIndex = 0
  let currentBondOrder = 1

  for (const token of tokens) {
    const content = token.slice(1, -1) // Remove brackets

    // Check if it's a bond modifier
    if (content.startsWith('=')) {
      currentBondOrder = 2
      continue
    } else if (content.startsWith('#')) {
      currentBondOrder = 3
      continue
    }

    // Check if it's a structural token (Branch, Ring)
    if (content.includes('Branch') || content.includes('Ring')) {
      continue
    }

    // It's an atom
    const atomKey = `${atomIndex}:${content}`
    atomBonds[atomKey] = (atomBonds[atomKey] || 0) + currentBondOrder

    // Reset bond order for next atom
    currentBondOrder = 1
    atomIndex++
  }

  return atomBonds
}

/**
 * Parses atom token to extract element and charge
 * @param {string} atomKey - Atom key like "0:C" or "1:N+1"
 * @returns {Object} {element, charge}
 */
function parseAtom(atomKey) {
  const [_, content] = atomKey.split(':')

  // Check for charge
  const chargeMatch = content.match(/([A-Z][a-z]?)([+-]\d+)?/)
  if (chargeMatch) {
    const element = chargeMatch[1]
    const chargeStr = chargeMatch[2] || '+0'
    const charge = parseInt(chargeStr)
    return { element, charge }
  }

  return { element: content, charge: 0 }
}
