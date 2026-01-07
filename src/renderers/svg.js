/**
 * SVG Renderer using RDKit.js
 *
 * Uses RDKit's MinimalLib to generate proper 2D coordinates and render molecules
 */

import initRDKitModule from '@rdkit/rdkit'
import { decode } from '../decoder.js'

let RDKitModule = null

/**
 * Initialize RDKit module (async, only done once)
 */
async function initRDKit() {
  if (!RDKitModule) {
    RDKitModule = await initRDKitModule()
  }
  return RDKitModule
}

/**
 * Default rendering options
 */
const DEFAULT_OPTIONS = {
  width: 300,
  height: 300,
  backgroundColor: 'transparent'
}

/**
 * Renders a molecular structure to SVG using RDKit
 * @param {Object} ast - AST object (not used, we use SMILES instead)
 * @param {Object} options - Rendering options (optional)
 * @returns {Promise<string>} SVG string representation
 */
export async function renderToSVG(ast, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // We need SMILES for RDKit, so if we have an AST, we need to convert back
  // For now, we'll need the original SELFIES or generate SMILES from AST
  throw new Error('renderToSVG with AST not yet implemented - use renderSelfies instead')
}

/**
 * Renders a SELFIES string to SVG using RDKit
 * @param {string} selfies - SELFIES string
 * @param {Object} options - Rendering options (optional)
 * @returns {Promise<string>} SVG string representation
 */
export async function renderSelfies(selfies, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Initialize RDKit
  const RDKit = await initRDKit()

  // Convert SELFIES to SMILES
  const smiles = decode(selfies)

  // Create molecule from SMILES
  const mol = RDKit.get_mol(smiles)

  if (!mol || !mol.is_valid()) {
    throw new Error(`Invalid molecule from SMILES: ${smiles}`)
  }

  // Generate SVG with RDKit
  const svg = mol.get_svg_with_highlights(JSON.stringify({
    width: opts.width,
    height: opts.height,
    addStereoAnnotation: true,
    kekulize: false
  }))

  // Clean up
  mol.delete()

  return svg
}

/**
 * Synchronous version that returns SVG directly
 * Note: This will throw if RDKit hasn't been initialized
 * @param {string} selfies - SELFIES string
 * @param {Object} options - Rendering options
 * @returns {string} SVG string
 */
export function renderSelfiesSync(selfies, options = {}) {
  if (!RDKitModule) {
    throw new Error('RDKit not initialized. Call initRDKit() first or use renderSelfies()')
  }

  const opts = { ...DEFAULT_OPTIONS, ...options }
  const smiles = decode(selfies)
  const mol = RDKitModule.get_mol(smiles)

  if (!mol || !mol.is_valid()) {
    throw new Error(`Invalid molecule from SMILES: ${smiles}`)
  }

  const svg = mol.get_svg_with_highlights(JSON.stringify({
    width: opts.width,
    height: opts.height,
    addStereoAnnotation: true,
    kekulize: false
  }))

  mol.delete()
  return svg
}

// Export init function
export { initRDKit }
