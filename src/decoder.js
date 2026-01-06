/**
 * Decoder - Converts SELFIES strings to SMILES
 *
 * This implements the SELFIES derivation state machine to properly
 * reconstruct molecular structures with branches and rings.
 */

import { tokenize } from './tokenizer.js'
import { getBondingCapacity } from './constraints.js'
import {
  processBranchSymbol,
  processRingSymbol,
  nextAtomState,
  nextBranchState,
  nextRingState,
  getIndexFromSelfies,
  INDEX_CODE
} from './grammar_rules.js'

/**
 * Decodes a SELFIES string to SMILES
 * @param {string} selfies - The SELFIES string to decode
 * @returns {string} SMILES representation
 * @throws {Error} If the SELFIES string is invalid
 */
export function decode(selfies) {
  const ast = decodeToAST(selfies)
  return buildSmiles(ast.atoms, ast.bonds, ast.rings)
}

/**
 * Decodes a SELFIES string to an Abstract Syntax Tree (AST)
 * @param {string} selfies - The SELFIES string to decode
 * @returns {Object} AST with atoms, bonds, and rings arrays
 * @throws {Error} If the SELFIES string is invalid
 */
export function decodeToAST(selfies) {
  const tokens = tokenize(selfies)
  const atoms = []
  const bonds = []
  const rings = []

  // Derivation state machine
  let state = 0 // 0 = start, >0 = bonding capacity remaining
  let prevAtomIndex = null
  let i = 0

  while (i < tokens.length) {
    const token = tokens[i]
    const content = token.slice(1, -1) // Remove brackets

    // Skip [nop] tokens
    if (content === 'nop') {
      i++
      continue
    }

    // Branch symbols
    if (content.includes('Branch') || content.includes('ch')) {
      const branchInfo = processBranchSymbol(token)
      if (!branchInfo) {
        i++
        continue
      }

      if (state <= 1) {
        // Skip branch at X0 or X1
        i++
        continue
      }

      const { order: branchOrder, L } = branchInfo
      const [branchInitState, nextState] = nextBranchState(branchOrder, state)

      // Read length specifier (Q) - read L tokens
      i++
      if (i >= tokens.length) {
        // Branch at end with no length
        state = nextState
        break
      }

      const Q = readIndexFromTokens(tokens, i, L)
      i += Q.consumed

      // Derive branch
      const branchResult = deriveBranch(
        tokens,
        i,
        Q.value + 1,
        branchInitState,
        prevAtomIndex,
        atoms,
        bonds,
        rings
      )
      i += branchResult.consumed
      state = nextState

      // If branch consumed all remaining tokens, stop
      if (i >= tokens.length) {
        break
      }
      continue
    }

    // Ring symbols
    if (content.includes('Ring') || content.includes('ng')) {
      const ringInfo = processRingSymbol(token)
      if (!ringInfo) {
        i++
        continue
      }

      if (state === 0) {
        // Skip ring at X0
        i++
        continue
      }

      const { order: requestedOrder, L } = ringInfo
      const [bondOrder, nextState] = nextRingState(requestedOrder, state)

      // Read length specifier (Q) - read L tokens
      i++
      if (i >= tokens.length) {
        // Ring at end - apply as bond to prev atom
        if (prevAtomIndex !== null && bonds.length > 0) {
          // Increase bond order of last bond
          const lastBond = bonds[bonds.length - 1]
          lastBond.order = Math.min(lastBond.order + bondOrder, 3)
        }
        state = nextState
        break
      }

      const Q = readIndexFromTokens(tokens, i, L)
      i += Q.consumed

      // Calculate ring closure atom index
      const targetIndex = Math.max(0, prevAtomIndex - (Q.value + 1))

      // Skip ring to self
      if (targetIndex === prevAtomIndex) {
        state = nextState
        continue
      }

      // Check if there's already a bond between these atoms
      const existingBond = bonds.find(b =>
        (b.from === targetIndex && b.to === prevAtomIndex) ||
        (b.from === prevAtomIndex && b.to === targetIndex)
      )

      if (existingBond) {
        // Ring on existing bond - increase bond order
        existingBond.order = Math.min(existingBond.order + bondOrder, 3)
      } else {
        // Check if there's already a ring between these atoms
        const existingRing = rings.find(r =>
          (r.from === targetIndex && r.to === prevAtomIndex) ||
          (r.from === prevAtomIndex && r.to === targetIndex)
        )

        if (existingRing) {
          // Ring on existing ring - increase ring order
          existingRing.order = Math.min(existingRing.order + bondOrder, 3)
        } else {
          // Add new ring closure
          rings.push({
            from: targetIndex,
            to: prevAtomIndex,
            order: bondOrder
          })
        }
      }

      state = nextState
      continue
    }

    // Regular atom symbols
    const atomInfo = parseAtomSymbol(content)
    if (atomInfo) {
      const { element, bondOrder: requestedBond, stereo } = atomInfo
      const capacity = getBondingCapacity(element)

      // Determine actual bond order and next state
      const [actualBond, nextState] = nextAtomState(requestedBond, capacity, state)

      // Add atom
      const atomIndex = atoms.length
      atoms.push({ element, capacity, stereo })

      // Add bond (if not first atom and has bonding)
      if (actualBond > 0 && prevAtomIndex !== null) {
        bonds.push({
          from: prevAtomIndex,
          to: atomIndex,
          order: actualBond
        })
      }

      // Update state
      state = nextState
      prevAtomIndex = atomIndex

      if (state === null) {
        i++
        break // No more bonding capacity
      }
    }

    i++
  }

  // Return AST
  return { atoms, bonds, rings }
}

/**
 * Dumps the AST as formatted JSON string
 * @param {string} selfies - The SELFIES string to decode
 * @returns {string} Formatted JSON representation of the AST
 */
export function dumpAST(selfies) {
  const ast = decodeToAST(selfies)
  return JSON.stringify(ast, null, 2)
}

/**
 * Reads an index value from SELFIES tokens
 * Returns {value, consumed} where consumed is number of tokens used
 * @param {number} numTokens - Number of tokens to read (from Branch/Ring L value)
 */
function readIndexFromTokens(tokens, startIndex, numTokens = 1) {
  if (startIndex >= tokens.length) {
    return { value: 0, consumed: 0 }
  }

  const symbols = []
  let i = startIndex

  // Read exactly numTokens tokens
  while (i < tokens.length && symbols.length < numTokens) {
    const symbol = tokens[i]
    if (INDEX_CODE.hasOwnProperty(symbol)) {
      symbols.push(symbol)
      i++
    } else {
      // If we encounter a non-index token, treat as None (0 value)
      symbols.push(null)
      i++
    }
  }

  if (symbols.length === 0) {
    return { value: 0, consumed: 0 }
  }

  // Calculate index value using getIndexFromSelfies
  const value = getIndexFromSelfies(symbols)
  return { value, consumed: symbols.length }
}

/**
 * Derives a branch subtree
 */
function deriveBranch(tokens, startIndex, maxDerive, initState, rootAtom, atoms, bonds, rings) {
  let state = initState
  let prevAtomIndex = rootAtom
  let consumed = 0
  let derived = 0

  while (consumed < tokens.length - startIndex && derived < maxDerive) {
    if (state === null || state === 0) break

    const token = tokens[startIndex + consumed]
    const content = token.slice(1, -1)

    // Skip structural tokens in branch
    if (content.includes('Branch') || content.includes('Ring') ||
        content.includes('ch') || content.includes('ng')) {
      consumed++
      continue
    }

    const atomInfo = parseAtomSymbol(content)
    if (!atomInfo) {
      consumed++
      continue
    }

    const { element, bondOrder: requestedBond, stereo } = atomInfo
    const capacity = getBondingCapacity(element)
    const [actualBond, nextState] = nextAtomState(requestedBond, capacity, state)

    // Add atom
    const atomIndex = atoms.length
    atoms.push({ element, capacity, stereo })

    // Add bond
    if (actualBond > 0 && prevAtomIndex !== null) {
      bonds.push({
        from: prevAtomIndex,
        to: atomIndex,
        order: actualBond
      })
    }

    // Update state
    state = nextState
    prevAtomIndex = atomIndex
    derived++
    consumed++
  }

  return { consumed, derived }
}

/**
 * Parses an atom symbol and extracts element, bond order, and stereo
 */
function parseAtomSymbol(content) {
  let bondOrder = 1
  let element = content
  let stereo = null

  if (content.startsWith('=')) {
    bondOrder = 2
    element = content.slice(1)
  } else if (content.startsWith('#')) {
    bondOrder = 3
    element = content.slice(1)
  } else if (content.startsWith('/') || content.startsWith('\\')) {
    element = content.slice(1)
  }

  // Check for stereo notation: C@, C@@, C@H, etc.
  if (element.includes('@')) {
    stereo = element
    // Extract base element (everything before @)
    const match = element.match(/^([A-Z][a-z]?)/)
    if (match) {
      element = match[1]
    }
  }

  // Check if it's a valid element
  const validElements = ['C', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I', 'B', 'H']
  if (!validElements.includes(element)) {
    return null
  }

  return { element, bondOrder, stereo }
}

/**
 * Builds SMILES string from atom/bond/ring structure
 */
function buildSmiles(atoms, bonds, rings) {
  if (atoms.length === 0) return ''

  const smiles = []
  const visited = new Set()
  const ringNumbers = new Map()
  let nextRingNum = 1

  // Process rings first to assign ring numbers
  for (const ring of rings) {
    if (!ringNumbers.has(`${ring.from}-${ring.to}`)) {
      ringNumbers.set(`${ring.from}-${ring.to}`, nextRingNum)
      ringNumbers.set(`${ring.to}-${ring.from}`, nextRingNum)
      nextRingNum++
    }
  }

  // Build adjacency list
  const adj = new Map()
  for (let i = 0; i < atoms.length; i++) {
    adj.set(i, [])
  }
  for (const bond of bonds) {
    adj.get(bond.from).push({ to: bond.to, order: bond.order })
    adj.get(bond.to).push({ to: bond.from, order: bond.order })
  }

  // DFS to build SMILES
  function dfs(atomIndex, parentIndex = null) {
    if (visited.has(atomIndex)) return

    visited.add(atomIndex)
    const atom = atoms[atomIndex]

    // Write atom (with stereo if present)
    if (atom.stereo) {
      smiles.push(`[${atom.stereo}]`)
    } else {
      smiles.push(atom.element)
    }

    // Write ring closures for this atom
    for (const ring of rings) {
      const isFrom = ring.from === atomIndex
      const isTo = ring.to === atomIndex

      if (isFrom && visited.has(ring.to)) {
        // Closing ring: we've visited the other end
        const ringNum = ringNumbers.get(`${atomIndex}-${ring.to}`)
        if (ring.order === 2) smiles.push('=')
        if (ring.order === 3) smiles.push('#')
        smiles.push(ringNum.toString())
      } else if (isTo && visited.has(ring.from)) {
        // Closing ring (other direction)
        const ringNum = ringNumbers.get(`${ring.from}-${atomIndex}`)
        if (ring.order === 2) smiles.push('=')
        if (ring.order === 3) smiles.push('#')
        smiles.push(ringNum.toString())
      } else if ((isFrom && !visited.has(ring.to)) || (isTo && !visited.has(ring.from))) {
        // Opening ring: we haven't visited the other end yet
        const ringNum = isFrom ?
          ringNumbers.get(`${atomIndex}-${ring.to}`) :
          ringNumbers.get(`${ring.from}-${atomIndex}`)
        if (ring.order === 2) smiles.push('=')
        if (ring.order === 3) smiles.push('#')
        smiles.push(ringNum.toString())
      }
    }

    // Visit neighbors
    const neighbors = adj.get(atomIndex) || []
    const unvisited = neighbors.filter(n => !visited.has(n.to) && n.to !== parentIndex)

    for (let i = 0; i < unvisited.length; i++) {
      const neighbor = unvisited[i]

      // Branch notation for multiple neighbors
      // Last branch (continuation) gets no parentheses, earlier branches do
      if (i < unvisited.length - 1) {
        smiles.push('(')
      }

      // Bond order
      if (neighbor.order === 2) smiles.push('=')
      if (neighbor.order === 3) smiles.push('#')

      dfs(neighbor.to, atomIndex)

      if (i < unvisited.length - 1) {
        smiles.push(')')
      }
    }
  }

  dfs(0)

  return smiles.join('')
}
