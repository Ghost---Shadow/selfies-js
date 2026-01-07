/**
 * Encoder - Converts SMILES strings to SELFIES
 *
 * NOTE: This is post-MVP functionality. The encoder is more complex than
 * the decoder as it requires parsing SMILES and making decisions about
 * how to represent branches and rings in SELFIES format.
 */

import { getSelfiesFromIndex } from './grammar_rules.js'

/**
 * Encodes a SMILES string to SELFIES
 * @param {string} smiles - The SMILES string to encode
 * @returns {string} SELFIES representation
 * @throws {EncodeError} If the SMILES string is invalid
 *
 * Example:
 *   encode('CCO') // => '[C][C][O]'
 *   encode('c1ccccc1') // => '[C][=C][C][=C][C][=C][Ring1][=Branch1]'
 */
export function encode(smiles) {
  validateSmiles(smiles)

  const state = createEncoderState()
  let i = 0

  while (i < smiles.length) {
    const char = smiles[i]

    if (isDigit(char)) {
      i = handleRingClosure(smiles, i, state)
    } else if (char === '(') {
      i = handleBranch(smiles, i, state)
    } else if (char === ')') {
      throw new Error('Unexpected closing parenthesis')
    } else if (char === '=') {
      i = handleDoubleBond(smiles, i, state)
    } else if (char === '#') {
      i = handleTripleBond(smiles, i, state)
    } else if (char === '/' || char === '\\') {
      i = handleStereoBond(smiles, i, state)
    } else if (char === '[') {
      i = handleBracketAtom(smiles, i, state)
    } else if (isUpperCase(char)) {
      i = handleAliphaticAtom(smiles, i, state)
    } else if (isLowerCase(char)) {
      i = handleAromaticAtom(smiles, i, state)
    } else {
      throw new Error(`Invalid SMILES character: ${char}`)
    }
  }

  return state.tokens.join('')
}

/**
 * Validates SMILES string input
 * @param {string} smiles - SMILES string to validate
 * @throws {Error} If SMILES is empty or null
 */
function validateSmiles(smiles) {
  if (!smiles || smiles.length === 0) {
    throw new Error('Empty SMILES string')
  }
}

/**
 * Creates initial encoder state
 * @returns {Object} Encoder state object
 */
function createEncoderState() {
  return {
    tokens: [],
    ringClosures: new Map(),
    aromaticCounter: 0,
    pendingStereoBond: null  // Tracks / or \ for next bond
  }
}

/**
 * Handles ring closure digits in SMILES
 * @param {string} smiles - SMILES string
 * @param {number} index - Current position
 * @param {Object} state - Encoder state
 * @returns {number} New position
 */
function handleRingClosure(smiles, index, state) {
  const ringNum = parseInt(smiles[index])

  if (state.ringClosures.has(ringNum)) {
    closeRing(ringNum, state)
  } else {
    openRing(ringNum, state)
  }

  return index + 1
}

/**
 * Opens a new ring at the current position
 * @param {number} ringNum - Ring number
 * @param {Object} state - Encoder state
 */
function openRing(ringNum, state) {
  state.ringClosures.set(ringNum, state.tokens.length - 1)
}

/**
 * Closes an existing ring
 * @param {number} ringNum - Ring number
 * @param {Object} state - Encoder state
 */
function closeRing(ringNum, state) {
  const ringStartPos = state.ringClosures.get(ringNum)
  const atomsInBetween = state.tokens.length - ringStartPos - 1

  // Add ring token with stereochemistry if present
  if (state.pendingStereoBond) {
    state.tokens.push(`[${state.pendingStereoBond}Ring1]`)
    state.pendingStereoBond = null
  } else {
    state.tokens.push('[Ring1]')
  }

  // For decoder formula: targetIndex = prevAtomIndex - (Q.value + 1)
  // We want: Q.value + 1 = atomsInBetween, so Q.value = atomsInBetween - 1
  state.tokens.push(getLengthToken(atomsInBetween - 1))
  state.ringClosures.delete(ringNum)
}

/**
 * Handles branch notation in SMILES
 * @param {string} smiles - SMILES string
 * @param {number} index - Current position
 * @param {Object} state - Encoder state
 * @returns {number} New position
 */
function handleBranch(smiles, index, state) {
  const { content, endIndex } = extractBranchContent(smiles, index)
  const branchTokens = encode(content)
  const branchSymbolCount = countSelfiesSymbols(branchTokens)

  state.tokens.push('[Branch1]')
  // For decoder formula: reads Q.value + 1 atoms from branch
  // We want: Q.value + 1 = branchSymbolCount, so Q.value = branchSymbolCount - 1
  state.tokens.push(getLengthToken(branchSymbolCount - 1))
  state.tokens.push(branchTokens)

  return endIndex + 1
}

/**
 * Extracts content between matching parentheses
 * @param {string} smiles - SMILES string
 * @param {number} startIndex - Position of opening parenthesis
 * @returns {Object} Branch content and end index
 */
function extractBranchContent(smiles, startIndex) {
  const branchStart = startIndex + 1
  let depth = 1
  let branchEnd = branchStart

  while (branchEnd < smiles.length && depth > 0) {
    if (smiles[branchEnd] === '(') depth++
    if (smiles[branchEnd] === ')') depth--
    if (depth > 0) branchEnd++
  }

  if (depth !== 0) {
    throw new Error('Unmatched parenthesis in SMILES')
  }

  return {
    content: smiles.substring(branchStart, branchEnd),
    endIndex: branchEnd
  }
}

/**
 * Handles double bond notation
 * @param {string} smiles - SMILES string
 * @param {number} index - Current position
 * @param {Object} state - Encoder state
 * @returns {number} New position
 */
function handleDoubleBond(smiles, index, state) {
  return handleBondedAtom(smiles, index, state, '=')
}

/**
 * Handles triple bond notation
 * @param {string} smiles - SMILES string
 * @param {number} index - Current position
 * @param {Object} state - Encoder state
 * @returns {number} New position
 */
function handleTripleBond(smiles, index, state) {
  return handleBondedAtom(smiles, index, state, '#')
}

/**
 * Handles stereochemistry bond notation (/ and \)
 * @param {string} smiles - SMILES string
 * @param {number} index - Current position
 * @param {Object} state - Encoder state
 * @returns {number} New position
 */
function handleStereoBond(smiles, index, state) {
  const stereoChar = smiles[index]

  // Store the stereochemistry marker to be used with the next ring closure
  state.pendingStereoBond = stereoChar === '/' ? '-/' : '\\/'

  return index + 1
}

/**
 * Handles atoms with bond prefix (= or #)
 * @param {string} smiles - SMILES string
 * @param {number} index - Current position
 * @param {Object} state - Encoder state
 * @param {string} bondSymbol - Bond symbol (= or #)
 * @returns {number} New position
 */
function handleBondedAtom(smiles, index, state, bondSymbol) {
  const nextIndex = index + 1

  if (nextIndex >= smiles.length) {
    throw new Error('Invalid SMILES: bond symbol at end')
  }

  const nextChar = smiles[nextIndex]

  if (isUpperCase(nextChar)) {
    return handleBondedUppercaseAtom(smiles, nextIndex, state, bondSymbol)
  } else if (isLowerCase(nextChar)) {
    state.tokens.push(`[${bondSymbol}${nextChar.toUpperCase()}]`)
    return nextIndex + 1
  } else {
    throw new Error(`Invalid SMILES: unexpected character after ${bondSymbol}: ${nextChar}`)
  }
}

/**
 * Handles bonded uppercase atoms (checking for two-letter elements)
 * @param {string} smiles - SMILES string
 * @param {number} index - Current position at the atom
 * @param {Object} state - Encoder state
 * @param {string} bondSymbol - Bond symbol
 * @returns {number} New position
 */
function handleBondedUppercaseAtom(smiles, index, state, bondSymbol) {
  const char = smiles[index]

  if (index + 1 < smiles.length && isLowerCase(smiles[index + 1])) {
    state.tokens.push(`[${bondSymbol}${char}${smiles[index + 1]}]`)
    return index + 2
  } else {
    state.tokens.push(`[${bondSymbol}${char}]`)
    return index + 1
  }
}

/**
 * Handles bracket atom notation like [nH], [NH2+], etc.
 * @param {string} smiles - SMILES string
 * @param {number} index - Current position
 * @param {Object} state - Encoder state
 * @returns {number} New position
 */
function handleBracketAtom(smiles, index, state) {
  const closeBracket = smiles.indexOf(']', index)

  if (closeBracket === -1) {
    throw new Error('Invalid SMILES: unclosed bracket atom')
  }

  const bracketContent = smiles.substring(index + 1, closeBracket)
  const element = extractElementFromBracket(bracketContent)

  state.tokens.push(`[${element}]`)
  return closeBracket + 1
}

/**
 * Extracts element symbol from bracket notation
 * @param {string} bracketContent - Content inside brackets
 * @returns {string} Element symbol
 */
function extractElementFromBracket(bracketContent) {
  let elementMatch = bracketContent.match(/^([A-Z][a-z]?)/)

  if (!elementMatch) {
    elementMatch = bracketContent.match(/^([a-z]+)/)
    if (elementMatch) {
      return elementMatch[1].charAt(0).toUpperCase() + elementMatch[1].slice(1)
    }
  }

  if (elementMatch) {
    return elementMatch[1]
  }

  const firstLetter = bracketContent.match(/[A-Za-z]/)
  if (firstLetter) {
    return firstLetter[0].toUpperCase()
  }

  return 'C'
}

/**
 * Handles aliphatic (uppercase) atoms
 * @param {string} smiles - SMILES string
 * @param {number} index - Current position
 * @param {Object} state - Encoder state
 * @returns {number} New position
 */
function handleAliphaticAtom(smiles, index, state) {
  const char = smiles[index]

  // Check if next character forms a two-letter element
  if (index + 1 < smiles.length && isLowerCase(smiles[index + 1])) {
    const twoLetter = char + smiles[index + 1]
    // Valid two-letter elements: Cl, Br, Si, etc.
    // NOT Cc, Cn, Co, etc. which are separate atoms
    if (isTwoLetterElement(twoLetter)) {
      state.tokens.push(`[${twoLetter}]`)
      return index + 2
    }
  }

  // Single-letter element
  state.tokens.push(`[${char}]`)
  return index + 1
}

/**
 * Handles aromatic (lowercase) atoms
 * @param {string} smiles - SMILES string
 * @param {number} index - Current position
 * @param {Object} state - Encoder state
 * @returns {number} New position
 */
function handleAromaticAtom(smiles, index, state) {
  const element = smiles[index].toUpperCase()

  if (state.aromaticCounter % 2 === 0) {
    state.tokens.push(`[${element}]`)
  } else {
    state.tokens.push(`[=${element}]`)
  }

  state.aromaticCounter++
  return index + 1
}

/**
 * Counts SELFIES symbols in a string
 * @param {string} selfiesString - SELFIES string
 * @returns {number} Number of symbols (opening brackets)
 */
function countSelfiesSymbols(selfiesString) {
  let count = 0
  for (let i = 0; i < selfiesString.length; i++) {
    if (selfiesString[i] === '[') count++
  }
  return count
}

/**
 * Generates length token for branch/ring notation
 * Uses INDEX_ALPHABET from grammar_rules.js for consistency with decoder
 * @param {number} length - Length value (0-indexed, matching atom count)
 * @returns {string} Length token in SELFIES format
 * @throws {Error} If length is out of range
 */
function getLengthToken(length) {
  // Use getSelfiesFromIndex to convert length to SELFIES symbols
  // This ensures encoder and decoder use the same INDEX_ALPHABET
  const symbols = getSelfiesFromIndex(length)

  // For single symbol, return it directly
  if (symbols.length === 1) {
    return symbols[0]
  }

  // For multiple symbols, join them (for large indices requiring multiple tokens)
  return symbols.join('')
}

/**
 * Checks if a two-character string is a valid two-letter element symbol
 * @param {string} symbol - Two-character string to check
 * @returns {boolean} True if valid two-letter element
 */
function isTwoLetterElement(symbol) {
  const twoLetterElements = new Set([
    'Cl', 'Br', 'Si', 'Se', 'As', 'Al', 'Ca', 'Mg', 'Na', 'He',
    'Li', 'Be', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn', 'Sc', 'Ti', 'Cr',
    'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'Sr', 'Zr',
    'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn',
    'Sb', 'Te', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu',
    'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta',
    'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po',
    'At', 'Ra', 'Ac', 'Th', 'Pa', 'Np', 'Pu', 'Am', 'Cm', 'Bk',
    'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh',
    'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og'
  ])
  return twoLetterElements.has(symbol)
}

/**
 * Checks if character is uppercase letter
 * @param {string} char - Character to check
 * @returns {boolean} True if uppercase
 */
function isUpperCase(char) {
  return char >= 'A' && char <= 'Z'
}

/**
 * Checks if character is lowercase letter
 * @param {string} char - Character to check
 * @returns {boolean} True if lowercase
 */
function isLowerCase(char) {
  return char >= 'a' && char <= 'z'
}

/**
 * Checks if character is a digit
 * @param {string} char - Character to check
 * @returns {boolean} True if digit
 */
function isDigit(char) {
  return char >= '0' && char <= '9'
}

/**
 * Parses a SMILES string into a molecule graph
 * @param {string} smiles - SMILES string
 * @returns {Object} Molecule graph structure
 */
function parseSmiles(smiles) {
  // TODO: Implement SMILES parser (POST-MVP)
  throw new Error('Not implemented - encoder is post-MVP')
}

/**
 * Converts aromatic bonds to explicit single/double bonds (Kekulization)
 * @param {Object} graph - Molecule graph
 * @returns {Object} Kekulized graph
 */
function kekulize(graph) {
  // TODO: Implement Kekulization (POST-MVP)
  throw new Error('Not implemented - encoder is post-MVP')
}
