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
  if (!smiles || smiles.length === 0) {
    throw new Error('Empty SMILES string')
  }

  const tokens = []
  let i = 0
  const ringClosures = new Map() // ring number -> position in token array
  let aromaticCounter = 0 // track alternating aromatic bonds

  while (i < smiles.length) {
    const char = smiles[i]

    // Handle ring closures (digits)
    if (char >= '0' && char <= '9') {
      const ringNum = parseInt(char)

      if (ringClosures.has(ringNum)) {
        // Closing the ring
        const ringStartPos = ringClosures.get(ringNum)
        // Number of atoms in between (not including start and end)
        const atomsInBetween = tokens.length - ringStartPos - 2

        tokens.push('[Ring1]')
        tokens.push(getLengthToken(atomsInBetween))

        ringClosures.delete(ringNum)
      } else {
        // Opening the ring - mark the position of the CURRENT (last added) atom
        ringClosures.set(ringNum, tokens.length - 1)
      }

      i++
    } else if (char === '(') {
      // Start of branch - find matching closing paren
      const branchStart = i + 1
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

      // Extract branch content
      const branchContent = smiles.substring(branchStart, branchEnd)

      // Recursively encode the branch
      const branchTokens = encode(branchContent)

      // Count how many SELFIES tokens in branch
      const branchSymbolCount = countSelfiesSymbols(branchTokens)

      // Emit branch marker
      tokens.push('[Branch1]')

      // Emit length token
      tokens.push(getLengthToken(branchSymbolCount))

      // Emit branch tokens
      tokens.push(branchTokens)

      i = branchEnd + 1
    } else if (char === ')') {
      throw new Error('Unexpected closing parenthesis')
    } else if (char === '=') {
      // Double bond modifier for next atom
      i++
      if (i >= smiles.length) {
        throw new Error('Invalid SMILES: bond symbol at end')
      }
      const nextChar = smiles[i]
      if (isUpperCase(nextChar)) {
        // Single uppercase letter element with double bond
        tokens.push(`[=${nextChar}]`)
        i++
      } else if (isLowerCase(nextChar)) {
        // Aromatic element with double bond
        tokens.push(`[=${nextChar.toUpperCase()}]`)
        i++
      } else {
        throw new Error(`Invalid SMILES: unexpected character after =: ${nextChar}`)
      }
    } else if (char === '#') {
      // Triple bond modifier for next atom
      i++
      if (i >= smiles.length) {
        throw new Error('Invalid SMILES: bond symbol at end')
      }
      const nextChar = smiles[i]
      if (isUpperCase(nextChar)) {
        tokens.push(`[#${nextChar}]`)
        i++
      } else {
        throw new Error(`Invalid SMILES: unexpected character after #: ${nextChar}`)
      }
    } else if (isUpperCase(char)) {
      // Check for two-letter element (Cl, Br, etc.)
      if (i + 1 < smiles.length && isLowerCase(smiles[i + 1])) {
        tokens.push(`[${char}${smiles[i + 1]}]`)
        i += 2
      } else {
        // Single letter element
        tokens.push(`[${char}]`)
        i++
      }
    } else if (isLowerCase(char)) {
      // Aromatic atom - use alternating single/double bonds
      const element = char.toUpperCase()

      if (aromaticCounter % 2 === 0) {
        tokens.push(`[${element}]`)
      } else {
        tokens.push(`[=${element}]`)
      }

      aromaticCounter++
      i++
    } else {
      throw new Error(`Invalid SMILES character: ${char}`)
    }
  }

  return tokens.join('')
}

function countSelfiesSymbols(selfiesString) {
  let count = 0
  for (let i = 0; i < selfiesString.length; i++) {
    if (selfiesString[i] === '[') count++
  }
  return count
}

function getLengthToken(length) {
  // Length tokens use the alphabet ordering
  // First 30 positions use atom-based tokens
  // Then Branch-based tokens for larger lengths
  const lengthAlphabet = [
    'C', '=C', '#C', 'N', '=N', '#N', 'O', '=O', '#O', 'S', '=S', '#S',
    'P', '=P', '#P', 'F', '=F', '#F', 'Cl', '=Cl', '#Cl', 'Br', '=Br', '#Br',
    'I', '=I', '#I', 'B', '=B', '#B',
    // Larger lengths use Branch tokens
    'Branch1', '=Branch1', '#Branch1', 'Branch2', '=Branch2', '#Branch2', 'Branch3', '=Branch3', '#Branch3'
  ]

  if (length < 1 || length > lengthAlphabet.length) {
    throw new Error(`Branch/Ring length ${length} out of range (max ${lengthAlphabet.length})`)
  }

  return `[${lengthAlphabet[length - 1]}]`
}

function isUpperCase(char) {
  return char >= 'A' && char <= 'Z'
}

function isLowerCase(char) {
  return char >= 'a' && char <= 'z'
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
