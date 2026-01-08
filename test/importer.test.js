/**
 * Import functionality tests
 */

import { describe, test, expect, beforeAll } from 'bun:test'
import { parseImports, loadWithImports, loadFile, getImports } from '../src/dsl/importer.js'
import { resolve } from '../src/dsl/resolver.js'
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync, existsSync } from 'fs'
import { join } from 'path'

const TEST_DIR = join(import.meta.dir, 'fixtures', 'import-tests')

describe('Import functionality', () => {
  // Create test directory and files
  beforeAll(() => {
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true })
    }

    // Base file with definitions
    writeFileSync(join(TEST_DIR, 'base.selfies'), `
# Base definitions
[methyl] = [C]
[ethyl] = [C][C]
[hydroxyl] = [O]
`)

    // File that imports from base
    writeFileSync(join(TEST_DIR, 'main.selfies'), `
import "./base.selfies"

[ethanol] = [ethyl][hydroxyl]
`)

    // File with selective imports
    writeFileSync(join(TEST_DIR, 'selective.selfies'), `
import [methyl, hydroxyl] from "./base.selfies"

[methanol] = [methyl][hydroxyl]
`)

    // File with import * from syntax
    writeFileSync(join(TEST_DIR, 'star-import.selfies'), `
import * from "./base.selfies"

[propanol] = [C][C][C][hydroxyl]
`)

    // Intermediate file for chain testing
    writeFileSync(join(TEST_DIR, 'intermediate.selfies'), `
import "./base.selfies"

[propyl] = [C][C][C]
`)

    // File that imports from intermediate
    writeFileSync(join(TEST_DIR, 'chained.selfies'), `
import "./intermediate.selfies"

[propanol] = [propyl][hydroxyl]
`)

    // Circular import files
    writeFileSync(join(TEST_DIR, 'circular-a.selfies'), `
import "./circular-b.selfies"

[a] = [C]
`)

    writeFileSync(join(TEST_DIR, 'circular-b.selfies'), `
import "./circular-a.selfies"

[b] = [N]
`)
  })

  describe('parseImports', () => {
    test('parses simple import syntax', () => {
      const source = `import "./file.selfies"\n[methyl] = [C]`
      const result = parseImports(source, '/test/main.selfies')

      expect(result.imports.length).toBe(1)
      expect(result.imports[0].names).toBe('*')
      expect(result.imports[0].originalPath).toBe('./file.selfies')
    })

    test('parses import * from syntax', () => {
      const source = `import * from "./file.selfies"\n[methyl] = [C]`
      const result = parseImports(source, '/test/main.selfies')

      expect(result.imports.length).toBe(1)
      expect(result.imports[0].names).toBe('*')
    })

    test('parses selective import syntax', () => {
      const source = `import [methyl, ethyl] from "./file.selfies"\n[test] = [C]`
      const result = parseImports(source, '/test/main.selfies')

      expect(result.imports.length).toBe(1)
      expect(result.imports[0].names).toEqual(['methyl', 'ethyl'])
    })

    test('removes import lines from source', () => {
      const source = `import "./file.selfies"\n[methyl] = [C]`
      const result = parseImports(source, '/test/main.selfies')

      expect(result.sourceWithoutImports).not.toContain('import')
      expect(result.sourceWithoutImports).toContain('[methyl] = [C]')
    })

    test('handles multiple imports', () => {
      const source = `
import "./file1.selfies"
import [foo] from "./file2.selfies"
import * from "./file3.selfies"

[test] = [C]
`
      const result = parseImports(source, '/test/main.selfies')

      expect(result.imports.length).toBe(3)
    })
  })

  describe('loadFile', () => {
    test('loads file with simple import', () => {
      const program = loadFile(join(TEST_DIR, 'main.selfies'))

      expect(program.errors.length).toBe(0)
      expect(program.definitions.has('ethanol')).toBe(true)
      expect(program.definitions.has('ethyl')).toBe(true)
      expect(program.definitions.has('hydroxyl')).toBe(true)
    })

    test('loads file with selective import', () => {
      const program = loadFile(join(TEST_DIR, 'selective.selfies'))

      expect(program.errors.length).toBe(0)
      expect(program.definitions.has('methanol')).toBe(true)
      expect(program.definitions.has('methyl')).toBe(true)
      expect(program.definitions.has('hydroxyl')).toBe(true)
      // ethyl was not imported
      expect(program.definitions.has('ethyl')).toBe(false)
    })

    test('loads file with import * from syntax', () => {
      const program = loadFile(join(TEST_DIR, 'star-import.selfies'))

      expect(program.errors.length).toBe(0)
      expect(program.definitions.has('propanol')).toBe(true)
      expect(program.definitions.has('methyl')).toBe(true)
      expect(program.definitions.has('ethyl')).toBe(true)
      expect(program.definitions.has('hydroxyl')).toBe(true)
    })

    test('handles chained imports', () => {
      const program = loadFile(join(TEST_DIR, 'chained.selfies'))

      expect(program.errors.length).toBe(0)
      // From chained.selfies
      expect(program.definitions.has('propanol')).toBe(true)
      // From intermediate.selfies
      expect(program.definitions.has('propyl')).toBe(true)
      // From base.selfies (through intermediate)
      expect(program.definitions.has('methyl')).toBe(true)
      expect(program.definitions.has('ethyl')).toBe(true)
      expect(program.definitions.has('hydroxyl')).toBe(true)
    })

    test('detects circular imports', () => {
      const program = loadFile(join(TEST_DIR, 'circular-a.selfies'))

      expect(program.errors.length).toBeGreaterThan(0)
      expect(program.errors.some(e => e.message.includes('Circular'))).toBe(true)
    })

    test('reports error for non-existent import', () => {
      const source = `import "./nonexistent.selfies"\n[test] = [C]`
      const program = loadWithImports(source, join(TEST_DIR, 'temp.selfies'))

      expect(program.errors.length).toBeGreaterThan(0)
      expect(program.errors[0].message).toContain('not found')
    })

    test('reports error for non-existent selective import', () => {
      const source = `import [nonexistent] from "./base.selfies"\n[test] = [C]`
      const program = loadWithImports(source, join(TEST_DIR, 'temp.selfies'))

      expect(program.errors.length).toBeGreaterThan(0)
      expect(program.errors[0].message).toContain("Cannot import 'nonexistent'")
    })
  })

  describe('resolve with imports', () => {
    test('resolves definitions using imported fragments', () => {
      const program = loadFile(join(TEST_DIR, 'main.selfies'))
      const result = resolve(program, 'ethanol', { validateValence: false })

      expect(result).toBe('[C][C][O]')
    })

    test('resolves chained imports', () => {
      const program = loadFile(join(TEST_DIR, 'chained.selfies'))
      const result = resolve(program, 'propanol', { validateValence: false })

      expect(result).toBe('[C][C][C][O]')
    })
  })

  describe('getImports', () => {
    test('returns list of imports without loading them', () => {
      const source = `
import "./file1.selfies"
import [foo, bar] from "./file2.selfies"
[test] = [C]
`
      const imports = getImports(source, '/test/main.selfies')

      expect(imports.length).toBe(2)
      expect(imports[0].originalPath).toBe('./file1.selfies')
      expect(imports[1].names).toEqual(['foo', 'bar'])
    })
  })
})
