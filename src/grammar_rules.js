/**
 * Grammar rules for SELFIES derivation
 * Based on selfies-py/selfies/grammar_rules.py
 */

// Index alphabet for Q-value calculations
export const INDEX_ALPHABET = [
  '[C]', '[Ring1]', '[Ring2]',
  '[Branch1]', '[=Branch1]', '[#Branch1]',
  '[Branch2]', '[=Branch2]', '[#Branch2]',
  '[O]', '[N]', '[=N]', '[=C]', '[#C]', '[S]', '[P]'
]

// Index code mapping
export const INDEX_CODE = {}
for (let i = 0; i < INDEX_ALPHABET.length; i++) {
  INDEX_CODE[INDEX_ALPHABET[i]] = i
}

/**
 * Process branch symbol and extract (bond_order, L)
 * where L is the number of tokens to read for the Q-value
 */
export function processBranchSymbol(symbol) {
  const match = symbol.match(/^\[(=|#)?Branch([1-3])\]$/)
  if (!match) return null

  const bondChar = match[1] || ''
  const L = parseInt(match[2])
  const order = bondChar === '=' ? 2 : bondChar === '#' ? 3 : 1

  return { order, L }
}

/**
 * Process ring symbol and extract (bond_order, L, stereo)
 * where L is the number of tokens to read for the Q-value
 */
export function processRingSymbol(symbol) {
  // Basic rings: [Ring1], [=Ring1], [#Ring1], etc.
  const basicMatch = symbol.match(/^\[(=|#)?Ring([1-3])\]$/)
  if (basicMatch) {
    const bondChar = basicMatch[1] || ''
    const L = parseInt(basicMatch[2])
    const order = bondChar === '=' ? 2 : bondChar === '#' ? 3 : 1
    return { order, L, stereo: null }
  }

  // Stereo rings: [-/Ring1], [\/Ring1], etc.
  const stereoMatch = symbol.match(/^\[([-\\/])([-\\/])Ring([1-3])\]$/)
  if (stereoMatch) {
    const L = parseInt(stereoMatch[3])
    return { order: 1, L, stereo: [stereoMatch[1], stereoMatch[2]] }
  }

  return null
}

/**
 * Calculate next state after processing an atom
 * Returns [actualBondOrder, nextState]
 */
export function nextAtomState(requestedBondOrder, bondingCapacity, state) {
  let actualBondOrder = requestedBondOrder

  if (state === 0) {
    actualBondOrder = 0
  } else {
    actualBondOrder = Math.min(requestedBondOrder, state, bondingCapacity)
  }

  const bondsLeft = bondingCapacity - actualBondOrder
  const nextState = bondsLeft === 0 ? null : bondsLeft

  return [actualBondOrder, nextState]
}

/**
 * Calculate branch init state and next state
 * Returns [branchInitState, nextState]
 */
export function nextBranchState(branchType, state) {
  if (state <= 1) {
    throw new Error('Branch requires state > 1')
  }

  const branchInitState = Math.min(state - 1, branchType)
  const nextState = state - branchInitState

  return [branchInitState, nextState]
}

/**
 * Calculate bond order and next state for ring
 * Returns [bondOrder, nextState]
 */
export function nextRingState(ringType, state) {
  if (state === 0) {
    throw new Error('Ring requires state > 0')
  }

  const bondOrder = Math.min(ringType, state)
  const bondsLeft = state - bondOrder
  const nextState = bondsLeft === 0 ? null : bondsLeft

  return [bondOrder, nextState]
}

/**
 * Get index value from SELFIES symbols
 * @param {string[]} symbols - Array of symbol contents (without brackets)
 */
export function getIndexFromSelfies(symbols) {
  let index = 0
  const base = INDEX_ALPHABET.length

  for (let i = 0; i < symbols.length; i++) {
    const symbolIndex = symbols.length - 1 - i
    const code = INDEX_CODE[symbols[symbolIndex]] || 0
    index += code * Math.pow(base, i)
  }

  return index
}

/**
 * Get SELFIES symbols from index value
 */
export function getSelfiesFromIndex(index) {
  if (index < 0) {
    throw new Error('Index must be non-negative')
  }
  if (index === 0) {
    return [INDEX_ALPHABET[0]]
  }

  const symbols = []
  const base = INDEX_ALPHABET.length

  while (index > 0) {
    symbols.push(INDEX_ALPHABET[index % base])
    index = Math.floor(index / base)
  }

  return symbols.reverse()
}
