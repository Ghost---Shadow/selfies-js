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

  describe('Line number preservation', () => {
    test('preserves line numbers when comments are at the top', () => {
      const source = `# Comment line 1
# Comment line 2

[methyl] = [C]
[ethyl] = [C][C]`

      const program = loadWithImports(source, '/test/temp.selfies')

      expect(program.errors.length).toBe(0)

      const methyl = program.definitions.get('methyl')
      const ethyl = program.definitions.get('ethyl')

      // Line numbers should match source (1-based)
      expect(methyl.line).toBe(4)
      expect(ethyl.line).toBe(5)
    })

    test('preserves line numbers when imports are present', () => {
      // Create temp file with base definitions
      const basePath = join(TEST_DIR, 'line-test-base.selfies')
      writeFileSync(basePath, `[base1] = [C]\n[base2] = [N]`)

      const source = `# Comment at top
import "./line-test-base.selfies"

[test1] = [C]
[test2] = [O]`

      const program = loadWithImports(source, join(TEST_DIR, 'line-test.selfies'))

      expect(program.errors.length).toBe(0)

      const test1 = program.definitions.get('test1')
      const test2 = program.definitions.get('test2')

      // Line numbers should be preserved (import doesn't shift lines)
      expect(test1.line).toBe(4)
      expect(test2.line).toBe(5)

      // Clean up
      unlinkSync(basePath)
    })

    test('preserves line numbers with multiple imports and comments', () => {
      // Create temp files
      const base1Path = join(TEST_DIR, 'multi-base1.selfies')
      const base2Path = join(TEST_DIR, 'multi-base2.selfies')
      writeFileSync(base1Path, `[frag1] = [C]`)
      writeFileSync(base2Path, `[frag2] = [N]`)

      const source = `# File header comment
# Another comment
import "./multi-base1.selfies"
# Comment between imports
import "./multi-base2.selfies"

# Comment before definitions
[molecule1] = [frag1]
# Inline comment
[molecule2] = [frag2]`

      const program = loadWithImports(source, join(TEST_DIR, 'multi-test.selfies'))

      expect(program.errors.length).toBe(0)

      const mol1 = program.definitions.get('molecule1')
      const mol2 = program.definitions.get('molecule2')

      // Verify exact line numbers
      expect(mol1.line).toBe(8)  // Line 8 in original source
      expect(mol2.line).toBe(10) // Line 10 in original source

      // Clean up
      unlinkSync(base1Path)
      unlinkSync(base2Path)
    })

    test('parseImports replaces import lines with blank lines', () => {
      const source = `# Comment
import "./file.selfies"
[methyl] = [C]`

      const result = parseImports(source, '/test/main.selfies')

      // Split result to check line count
      const lines = result.sourceWithoutImports.split('\n')
      const originalLines = source.split('\n')

      // Should have same number of lines
      expect(lines.length).toBe(originalLines.length)

      // Line 2 (0-indexed line 1) should be empty where import was
      expect(lines[1].trim()).toBe('')

      // Other lines should be preserved
      expect(lines[0]).toBe('# Comment')
      expect(lines[2]).toBe('[methyl] = [C]')
    })

    test('handles edge case: file starting with import', () => {
      const basePath = join(TEST_DIR, 'edge-base.selfies')
      writeFileSync(basePath, `[base] = [C]`)

      const source = `import "./edge-base.selfies"
[test] = [base]`

      const program = loadWithImports(source, join(TEST_DIR, 'edge-test.selfies'))

      expect(program.errors.length).toBe(0)

      const test = program.definitions.get('test')

      // Should be on line 2
      expect(test.line).toBe(2)

      // Clean up
      unlinkSync(basePath)
    })

    test('handles edge case: multiple consecutive imports', () => {
      const base1Path = join(TEST_DIR, 'consec-base1.selfies')
      const base2Path = join(TEST_DIR, 'consec-base2.selfies')
      const base3Path = join(TEST_DIR, 'consec-base3.selfies')
      writeFileSync(base1Path, `[a] = [C]`)
      writeFileSync(base2Path, `[b] = [N]`)
      writeFileSync(base3Path, `[c] = [O]`)

      const source = `import "./consec-base1.selfies"
import "./consec-base2.selfies"
import "./consec-base3.selfies"
[result] = [a][b][c]`

      const program = loadWithImports(source, join(TEST_DIR, 'consec-test.selfies'))

      expect(program.errors.length).toBe(0)

      const result = program.definitions.get('result')

      // Should be on line 4 (after 3 import lines)
      expect(result.line).toBe(4)

      // Clean up
      unlinkSync(base1Path)
      unlinkSync(base2Path)
      unlinkSync(base3Path)
    })

    test('VSCode extension use case: cursor position matches definition line', () => {
      // This test documents the fix for the VSCode extension issue where
      // comments at the top of the file and imports caused line number misalignment
      // between the editor cursor position and the parsed AST

      const basePath = join(TEST_DIR, 'vscode-base.selfies')
      writeFileSync(basePath, `[fragment] = [C][C]`)

      const source = `# SELFIES Language Example
# This file demonstrates the SELFIES DSL syntax

import "./vscode-base.selfies"

# Basic definitions
[molecule1] = [C]
[molecule2] = [fragment][O]
# Another comment
[molecule3] = [N]`

      const program = loadWithImports(source, join(TEST_DIR, 'vscode-test.selfies'))

      expect(program.errors.length).toBe(0)

      const mol1 = program.definitions.get('molecule1')
      const mol2 = program.definitions.get('molecule2')
      const mol3 = program.definitions.get('molecule3')

      // In VSCode, if cursor is on line 7 (0-based: line 6), it should find molecule1
      // Parser uses 1-based line numbers, so molecule1 should be at line 7
      expect(mol1.line).toBe(7)

      // VSCode line 8 (0-based: 7) should find molecule2 at parser line 8
      expect(mol2.line).toBe(8)

      // VSCode line 10 (0-based: 9) should find molecule3 at parser line 10
      expect(mol3.line).toBe(10)

      // VSCode lineTracker converts: vscode_line_0based + 1 = parser_line_1based
      // So for VSCode line 6 (0-based), we look for parser line 7
      // This should correctly find mol1 with the fix
      const vscodeLine6 = 6
      const parserLine = vscodeLine6 + 1
      expect(parserLine).toBe(mol1.line)

      // Clean up
      unlinkSync(basePath)
    })
  })
})
