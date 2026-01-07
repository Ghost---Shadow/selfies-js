/**
 * Tests for SVG renderer (using RDKit)
 */

import { describe, test, expect, beforeAll } from 'bun:test'
import { renderSelfies, initRDKit } from './svg.js'

describe('SVG Renderer (RDKit)', () => {
  beforeAll(async () => {
    // Initialize RDKit once before all tests
    await initRDKit()
  })

  test('renders methane', async () => {
    const svg = await renderSelfies('[C]')
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
  })

  test('renders ethane', async () => {
    const svg = await renderSelfies('[C][C]')
    expect(svg).toContain('<svg')
    expect(svg).toContain('path') // RDKit uses paths for bonds
  })

  test('renders benzene', async () => {
    const svg = await renderSelfies('[C][=C][C][=C][C][=C][Ring1][=Branch1]')
    expect(svg).toContain('<svg')
    expect(svg).toContain('path')
  })

  test('renders toluene', async () => {
    const svg = await renderSelfies('[C][C][=C][C][=C][C][=C][Ring1][=N]')
    expect(svg).toContain('<svg')
    expect(svg).toContain('path')
  })

  test('accepts custom width and height', async () => {
    const svg = await renderSelfies('[C]', { width: 400, height: 400 })
    expect(svg).toContain('400')
  })
})
