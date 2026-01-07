/**
 * Encoder - Converts SMILES strings to SELFIES
 *
 * NOTE: This is post-MVP functionality. The encoder is more complex than
 * the decoder as it requires parsing SMILES and making decisions about
 * how to represent branches and rings in SELFIES format.
 */

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
    aromaticCounter: 0
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

  state.tokens.push('[Ring1]')
  state.tokens.push(getLengthToken(atomsInBetween))
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
  state.tokens.push(getLengthToken(branchSymbolCount))
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

  if (index + 1 < smiles.length && isLowerCase(smiles[index + 1])) {
    state.tokens.push(`[${char}${smiles[index + 1]}]`)
    return index + 2
  } else {
    state.tokens.push(`[${char}]`)
    return index + 1
  }
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
 * @param {number} length - Length value (1-based)
 * @returns {string} Length token in SELFIES format
 * @throws {Error} If length is out of range
 */
function getLengthToken(length) {
  const lengthAlphabet = [
    'C', '=C', '#C', 'N', '=N', '#N', 'O', '=O', '#O', 'S', '=S', '#S',
    'P', '=P', '#P', 'F', '=F', '#F', 'Cl', '=Cl', '#Cl', 'Br', '=Br', '#Br',
    'I', '=I', '#I', 'B', '=B', '#B',
    'Branch1', '=Branch1', '#Branch1', 'Branch2', '=Branch2', '#Branch2', 'Branch3', '=Branch3', '#Branch3'
  ]

  if (length < 1 || length > lengthAlphabet.length) {
    throw new Error(`Branch/Ring length ${length} out of range (max ${lengthAlphabet.length})`)
  }

  return `[${lengthAlphabet[length - 1]}]`
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
