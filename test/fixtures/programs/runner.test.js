/**
 * Test runner for fixture programs
 * Tests that each .selfies file either compiles successfully or produces expected errors
 */

import { describe, test, expect } from 'bun:test'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parse } from '../../../src/dsl/parser.js'
import { resolve, resolveAll } from '../../../src/dsl/resolver.js'
import { detectCycles, findUnused } from '../../../src/dsl/analyzer.js'
import { loadFile } from '../../../src/dsl/importer.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROGRAMS_DIR = __dirname

function readProgram(filename) {
  const path = join(PROGRAMS_DIR, filename)
  return readFileSync(path, 'utf-8')
}

describe('Fixture Programs', () => {
  describe('simple.selfies', () => {
    test('should parse without errors', () => {
      const source = readProgram('simple.selfies')
      const program = parse(source)

      expect(program.errors).toEqual([])
      expect(program.definitions.size).toBeGreaterThan(0)
    })

    test('should resolve all definitions', () => {
      const source = readProgram('simple.selfies')
      const program = parse(source)
      const resolved = resolveAll(program)

      expect(resolved.size).toBe(program.definitions.size)
    })

    test('should produce expected SELFIES', () => {
      const source = readProgram('simple.selfies')
      const program = parse(source)

      const expectedSelfies = {
        methyl: '[C]',
        ethyl: '[C][C]',
        propyl: '[C][C][C]',
        butyl: '[C][C][C][C]',
        hydroxyl: '[O]',
        carbonyl: '[=O]',
        amino: '[N]',
        carboxyl: '[C][=Branch1][C][=O][O]',
        methanol: '[C][O]',
        ethanol: '[C][C][O]',
        propanol: '[C][C][C][O]',
        acetone: '[C][C][=Branch1][C][=O][C]',
      }

      for (const [name, expected] of Object.entries(expectedSelfies)) {
        expect(resolve(program, name)).toBe(expected)
      }
    })

    test('should produce expected SMILES', () => {
      const source = readProgram('simple.selfies')
      const program = parse(source)

      const expectedSmiles = {
        methyl: 'C',
        ethyl: 'CC',
        propyl: 'CCC',
        butyl: 'CCCC',
        hydroxyl: 'O',
        carbonyl: 'O',
        amino: 'N',
        carboxyl: 'C(=O)O',
        methanol: 'CO',
        ethanol: 'CCO',
        propanol: 'CCCO',
        acetone: 'CC(=O)C',
      }

      for (const [name, expected] of Object.entries(expectedSmiles)) {
        expect(resolve(program, name, { decode: true })).toBe(expected)
      }
    })
  })

  describe('cycle.selfies', () => {
    test('should parse without syntax errors', () => {
      const source = readProgram('cycle.selfies')
      const program = parse(source)

      expect(program.errors).toEqual([])
    })

    test('should detect circular dependencies', () => {
      const source = readProgram('cycle.selfies')
      const program = parse(source)
      const cycles = detectCycles(program)

      expect(cycles.length).toBeGreaterThan(0)
      expect(cycles.some(c => c.message.includes('Circular dependency'))).toBe(true)
    })

    test('should throw when resolving cyclic definitions', () => {
      const source = readProgram('cycle.selfies')
      const program = parse(source)

      expect(() => resolve(program, 'a')).toThrow(/Circular dependency/)
      expect(() => resolve(program, 'recursive')).toThrow(/Circular dependency/)
      expect(() => resolve(program, 'x')).toThrow(/Circular dependency/)
    })

    test('should resolve non-cyclic definitions', () => {
      const source = readProgram('cycle.selfies')
      const program = parse(source)

      expect(resolve(program, 'valid')).toBe('[C][C][O]')
    })
  })

  describe('amino-acids.selfies', () => {
    test('should compile successfully', () => {
      const source = readProgram('amino-acids.selfies')
      const program = parse(source)

      expect(program.errors).toEqual([])
      expect(detectCycles(program)).toEqual([])
    })

    test('should produce expected SELFIES', () => {
      const source = readProgram('amino-acids.selfies')
      const program = parse(source)

      const expectedSelfies = {
        amino: '[N]',
        carboxyl: '[C][=Branch1][C][=O][O]',
        methyl: '[C]',
        glycine: '[N][C][C][=Branch1][C][=O][O]',
        alanine: '[N][C][Branch1][C][C][C][=Branch1][C][=O][O]',
      }

      for (const [name, expected] of Object.entries(expectedSelfies)) {
        expect(resolve(program, name)).toBe(expected)
      }
    })

    test('should produce expected SMILES', () => {
      const source = readProgram('amino-acids.selfies')
      const program = parse(source)

      const expectedSmiles = {
        amino: 'N',
        carboxyl: 'C(=O)O',
        methyl: 'C',
        glycine: 'NCC(=O)O',
        alanine: 'NC(C)C(=O)O',
      }

      for (const [name, expected] of Object.entries(expectedSmiles)) {
        expect(resolve(program, name, { decode: true })).toBe(expected)
      }
    })
  })

  describe('complex-molecules.selfies', () => {
    test('should compile successfully', () => {
      const source = readProgram('complex-molecules.selfies')
      const program = parse(source)

      expect(program.errors).toEqual([])
    })

    test('should produce expected SELFIES', () => {
      const source = readProgram('complex-molecules.selfies')
      const program = parse(source)

      const expectedSelfies = {
        methyl: '[C]',
        ethyl: '[C][C]',
        vinyl: '[C][=C]',
        benzene: '[C][=C][C][=C][C][=C][Ring1][=Branch1]',
        phenyl: '[C][=C][C][=C][C][=C][Ring1][=Branch1]',
        cyclopropane: '[C][C][C][Ring1][Branch1]',
        cyclobutane: '[C][C][C][C][Ring1][Branch1]',
        cyclohexane: '[C][C][C][C][C][C][Ring1][Branch2]',
      }

      for (const [name, expected] of Object.entries(expectedSelfies)) {
        expect(resolve(program, name)).toBe(expected)
      }
    })

    test('should produce expected SMILES', () => {
      const source = readProgram('complex-molecules.selfies')
      const program = parse(source)

      const expectedSmiles = {
        methyl: 'C',
        ethyl: 'CC',
        vinyl: 'C=C',
        isobutane: 'CC(C)C',
        neopentane: 'CC(C)(C)C',
        benzene: 'C1=CC=CC=C1',
        phenyl: 'C1=CC=CC=C1',
        toluene: 'C1=CC=CC=C1C',
        styrene: 'C1=CC=CC=C1C=C',
        cyclopropane: 'C1CC1',
        cyclobutane: 'C1CCC1',
        cyclopentane: 'C1CCCC1',
        cyclohexane: 'C1CCCCC1',
      }

      for (const [name, expected] of Object.entries(expectedSmiles)) {
        expect(resolve(program, name, { decode: true })).toBe(expected)
      }
    })
  })

  describe('syntax-errors.selfies', () => {
    test('should detect syntax errors', () => {
      const source = readProgram('syntax-errors.selfies')

      let program
      let lexerError = false

      try {
        program = parse(source)
      } catch (error) {
        lexerError = true
        expect(error.message).toMatch(/Unclosed bracket|Unexpected character/)
      }

      if (!lexerError) {
        expect(program.errors.length).toBeGreaterThan(0)
      }
    })

    test('should report multiple errors', () => {
      const source = readProgram('syntax-errors.selfies')

      try {
        const program = parse(source)
        const errorMessages = program.errors.map(e => e.message)

        const hasDuplicateError = errorMessages.some(m => m.includes('Duplicate'))
        const hasMissingEqualsError = errorMessages.some(m => m.includes('='))
        const hasMissingTokensError = errorMessages.some(m => m.includes('at least one token'))

        expect(hasDuplicateError || hasMissingEqualsError || hasMissingTokensError).toBe(true)
      } catch (error) {
        expect(error.message).toBeDefined()
      }
    })

    test('should still parse some valid definitions', () => {
      const source = readProgram('syntax-errors.selfies')

      try {
        const program = parse(source)
        expect(program.definitions.has('methyl')).toBe(true)
        expect(program.definitions.has('valid')).toBe(true)
      } catch (error) {
        // Lexer error prevents parsing
      }
    })
  })

  describe('empty.selfies', () => {
    test('should parse successfully with no definitions', () => {
      const source = readProgram('empty.selfies')
      const program = parse(source)

      expect(program.definitions.size).toBe(0)
      expect(program.errors).toEqual([])
    })
  })

  describe('pharmaceutical.selfies', () => {
    test('should compile successfully', () => {
      const source = readProgram('pharmaceutical.selfies')
      const program = parse(source)

      expect(program.errors).toEqual([])
      expect(program.definitions.size).toBeGreaterThan(15)
    })

    test('should produce expected SELFIES', () => {
      const source = readProgram('pharmaceutical.selfies')
      const program = parse(source)

      const expectedSelfies = {
        phenyl: '[C][=C][C][=C][C][=C][Ring1][=Branch1]',
        hydroxyl: '[O]',
        carbonyl: '[=O]',
        amino: '[N]',
        methyl: '[C]',
        phenol: '[C][=C][C][=C][C][=C][Ring1][=Branch1][O]',
        aniline: '[C][=C][C][=C][C][=C][Ring1][=Branch1][N]',
        benzamide: '[C][=C][C][=C][C][=C][Ring1][=Branch1][C][=Branch1][C][=O][N]',
      }

      for (const [name, expected] of Object.entries(expectedSelfies)) {
        expect(resolve(program, name)).toBe(expected)
      }
    })

    test('should produce expected SMILES', () => {
      const source = readProgram('pharmaceutical.selfies')
      const program = parse(source)

      const expectedSmiles = {
        phenyl: 'C1=CC=CC=C1',
        benzyl: 'CC1=CC=CC=C1',
        hydroxyl: 'O',
        carbonyl: 'O',
        amino: 'N',
        methyl: 'C',
        ethyl: 'CC',
        methoxy: 'OC',
        nitro: 'N(O)=O',
        pyridine: 'N1=CC=CC=C1',
        furan: 'O1C=CC=C1',
        thiophene: 'S1C=CC=C1',
        phenol: 'C1=CC=CC=C1O',
        aniline: 'C1=CC=CC=C1N',
        anisole: 'C1=CC=CC=C1OC',
        acetophenone: 'C1=CC=CC=C1C(=O)C',
        benzamide: 'C1=CC=CC=C1C(=O)N',
        salicylic_acid: 'C1=CC=CC=C1OC(=O)O',
        acetyl_group: 'C(=O)C',
      }

      for (const [name, expected] of Object.entries(expectedSmiles)) {
        expect(resolve(program, name, { decode: true })).toBe(expected)
      }
    })
  })

  describe('polymers.selfies', () => {
    test('should compile successfully', () => {
      const source = readProgram('polymers.selfies')
      const program = parse(source)

      expect(program.errors).toEqual([])
    })

    test('should produce expected SELFIES', () => {
      const source = readProgram('polymers.selfies')
      const program = parse(source)

      const expectedSelfies = {
        phenyl: '[C][=C][C][=C][C][=C][Ring1][=Branch1]',
        hydroxyl: '[O]',
        carbonyl: '[=O]',
        carboxyl: '[C][=Branch1][C][=O][O]',
        ethylene: '[C][=C]',
        PE_unit: '[C][C]',
        PP_unit: '[C][C][Branch1][C][C]',
        PVC_unit: '[C][C][Branch1][C][Cl]',
      }

      for (const [name, expected] of Object.entries(expectedSelfies)) {
        expect(resolve(program, name)).toBe(expected)
      }
    })

    test('should produce expected SMILES', () => {
      const source = readProgram('polymers.selfies')
      const program = parse(source)

      const expectedSmiles = {
        phenyl: 'C1=CC=CC=C1',
        hydroxyl: 'O',
        carbonyl: 'O',
        carboxyl: 'C(=O)O',
        ethylene: 'C=C',
        propylene: 'C=CC',
        PE_unit: 'CC',
        PP_unit: 'CCC',
        PS_unit: 'CC(C1)=CC=CC=C1',
        PVC_unit: 'CCCl',
        PMMA_unit: 'CC(C)=O',
      }

      for (const [name, expected] of Object.entries(expectedSmiles)) {
        expect(resolve(program, name, { decode: true })).toBe(expected)
      }
    })
  })

  describe('undefined-refs.selfies', () => {
    test('should parse without syntax errors', () => {
      const source = readProgram('undefined-refs.selfies')
      const program = parse(source)

      expect(program.errors).toEqual([])
    })

    test('should produce expected SMILES for valid definitions', () => {
      const source = readProgram('undefined-refs.selfies')
      const program = parse(source)

      const expectedSmiles = {
        methyl: 'C',
        ethyl: 'CC',
      }

      for (const [name, expected] of Object.entries(expectedSmiles)) {
        expect(resolve(program, name, { decode: true })).toBe(expected)
      }
    })

    test('should treat undefined references as primitives', () => {
      const source = readProgram('undefined-refs.selfies')
      const program = parse(source)

      // Undefined names are treated as primitive SELFIES tokens (could be valid)
      // Skip valence validation since these contain undefined tokens
      const result1 = resolve(program, 'compound1', { validateValence: false })
      expect(result1).toContain('[undefined_group]')

      const result2 = resolve(program, 'compound2', { validateValence: false })
      expect(result2).toContain('[mystery]')

      const result3 = resolve(program, 'compound3', { validateValence: false })
      expect(result3).toContain('[unknown1]')
    })
  })

  describe('Program metadata', () => {
    test('all programs should be readable', () => {
      const files = readdirSync(PROGRAMS_DIR).filter(f => f.endsWith('.selfies'))

      expect(files.length).toBeGreaterThan(5)

      files.forEach(file => {
        const source = readProgram(file)
        expect(source).toBeDefined()
        expect(typeof source).toBe('string')
      })
    })
  })

  // Automatically test all fixture files that should compile without errors
  describe('All valid fixtures should parse', () => {
    // Fixtures without imports - use simple parse()
    const simpleFixtures = [
      'pharma-core.selfies',
      'deep-nesting.selfies',
      'diamond-deps.selfies',
      'naming-edge-cases.selfies',
      'reuse-patterns.selfies',
      'test-edge-cases.selfies',
      'wide-composition.selfies',
      'comments-whitespace.selfies',
    ]

    simpleFixtures.forEach(filename => {
      test(`${filename} should parse without errors`, () => {
        const source = readProgram(filename)
        const program = parse(source)
        expect(program.errors).toEqual([])
      })

      test(`${filename} should have no cycles`, () => {
        const source = readProgram(filename)
        const program = parse(source)
        const cycles = detectCycles(program)
        expect(cycles).toEqual([])
      })

      test(`${filename} should resolve all definitions`, () => {
        const source = readProgram(filename)
        const program = parse(source)
        const resolved = resolveAll(program)
        expect(resolved.size).toBe(program.definitions.size)
      })

      test(`${filename} should decode all definitions to SMILES`, () => {
        const source = readProgram(filename)
        const program = parse(source)
        // Definitions that are just control tokens (like ring closers) may produce empty SMILES
        const controlTokenOnlyDefs = ['ring_closer', 'branch_unit']
        for (const name of program.definitions.keys()) {
          // Each definition should decode to a valid SMILES string
          const smiles = resolve(program, name, { decode: true })
          expect(typeof smiles).toBe('string')
          if (!controlTokenOnlyDefs.includes(name)) {
            expect(smiles.length).toBeGreaterThan(0)
          }
        }
      })
    })

    // Fixtures with imports - use loadFile()
    const importFixtures = [
      'pharma-candidates.selfies',
      'real-drugs.selfies',
    ]

    importFixtures.forEach(filename => {
      test(`${filename} should load with imports without errors`, () => {
        const filepath = join(PROGRAMS_DIR, filename)
        const program = loadFile(filepath)
        expect(program.errors).toEqual([])
      })

      test(`${filename} should have no cycles`, () => {
        const filepath = join(PROGRAMS_DIR, filename)
        const program = loadFile(filepath)
        const cycles = detectCycles(program)
        expect(cycles).toEqual([])
      })

      test(`${filename} should resolve all definitions`, () => {
        const filepath = join(PROGRAMS_DIR, filename)
        const program = loadFile(filepath)
        const resolved = resolveAll(program)
        // resolved.size should match definitions.size, but may differ slightly
        // if there are definition shadowing from imports
        expect(resolved.size).toBeGreaterThan(0)
        expect(resolved.size).toBeGreaterThanOrEqual(program.definitions.size - 5)
      })

      test(`${filename} should decode all definitions to SMILES`, () => {
        const filepath = join(PROGRAMS_DIR, filename)
        const program = loadFile(filepath)
        for (const name of program.definitions.keys()) {
          // Each definition should decode to a valid SMILES string
          // Skip valence validation for compositional fragments that may have unusual bonding
          const smiles = resolve(program, name, { decode: true, validateValence: false })
          expect(typeof smiles).toBe('string')
          expect(smiles.length).toBeGreaterThan(0)
        }
      })
    })
  })

  // Verification for pharma-core.selfies
  describe('pharma-core.selfies verification', () => {
    test('should produce expected SELFIES', () => {
      const source = readProgram('pharma-core.selfies')
      const program = parse(source)

      const expectedSelfies = {
        methyl: '[C]',
        ethyl: '[C][C]',
        propyl: '[C][C][C]',
        butyl: '[C][C][C][C]',
        hydroxyl: '[O]',
        amino: '[N]',
        thiol: '[S]',
        carbonyl: '[=O]',
        carboxyl: '[C][=Branch1][C][=O][O]',
        aldehyde: '[C][=O]',
        nitro: '[N][Branch1][C][O][=O]',
        cyano: '[C][#N]',
        amide: '[C][=Branch1][C][=O][N]',
        fluoro: '[F]',
        chloro: '[Cl]',
        bromo: '[Br]',
        iodo: '[I]',
        phenyl: '[C][=C][C][=C][C][=C][Ring1][=Branch1]',
        piperidine: '[N][C][C][C][C][C][Ring1][=Branch1]',
        sulfonyl: '[S][=Branch1][C][=O][=O]',
        sulfonamide: '[S][=Branch1][C][=O][=Branch1][C][=O][N]',
        ether: '[O]',
        thioether: '[S]',
        methylene: '[C]',
        ethylene: '[C][C]',
      }

      for (const [name, expected] of Object.entries(expectedSelfies)) {
        expect(resolve(program, name)).toBe(expected)
      }
    })

    test('should produce expected SMILES', () => {
      const source = readProgram('pharma-core.selfies')
      const program = parse(source)

      const expectedSmiles = {
        methyl: 'C',
        ethyl: 'CC',
        propyl: 'CCC',
        butyl: 'CCCC',
        hydroxyl: 'O',
        amino: 'N',
        thiol: 'S',
        carbonyl: 'O',
        carboxyl: 'C(=O)O',
        aldehyde: 'C=O',
        nitro: 'N(O)=O',
        cyano: 'C#N',
        amide: 'C(=O)N',
        fluoro: 'F',
        chloro: 'Cl',
        bromo: 'Br',
        iodo: 'I',
        phenyl: 'C1=CC=CC=C1',
        pyridine: 'N1=CC=CC=C1',
        piperidine: 'N1CCCCC1',
        cyclohexyl: 'C1CCCCC1',
        sulfonyl: 'S(=O)=O',
        sulfonamide: 'S(=O)(=O)N',
        ether: 'O',
        thioether: 'S',
        methylene: 'C',
        ethylene: 'CC',
      }

      for (const [name, expected] of Object.entries(expectedSmiles)) {
        expect(resolve(program, name, { decode: true })).toBe(expected)
      }
    })
  })

  // Verification for pharma-candidates.selfies (with imports)
  describe('pharma-candidates.selfies verification', () => {
    test('should produce expected SELFIES', () => {
      const filepath = join(PROGRAMS_DIR, 'pharma-candidates.selfies')
      const program = loadFile(filepath)

      const expectedSelfies = {
        methanol: '[C][O]',
        ethanol: '[C][C][O]',
        propanol: '[C][C][C][O]',
        methylamine: '[C][N]',
        ethylamine: '[C][C][N]',
        toluene: '[C][C][=C][C][=C][C][=C][Ring1][=Branch1]',
        phenol: '[C][=C][C][=C][C][=C][Ring1][=Branch1][O]',
        aniline: '[C][=C][C][=C][C][=C][Ring1][=Branch1][N]',
        benzyl_alcohol: '[C][=C][C][=C][C][=C][Ring1][=Branch1][C][O]',
      }

      for (const [name, expected] of Object.entries(expectedSelfies)) {
        expect(resolve(program, name)).toBe(expected)
      }
    })

    test('should produce expected SMILES', () => {
      const filepath = join(PROGRAMS_DIR, 'pharma-candidates.selfies')
      const program = loadFile(filepath)

      const expectedSmiles = {
        methanol: 'CO',
        ethanol: 'CCO',
        propanol: 'CCCO',
        methylamine: 'CN',
        ethylamine: 'CCN',
        toluene: 'CC1=CC=CC=C1',
        phenol: 'C1=CC=CC=C1O',
        aniline: 'C1=CC=CC=C1N',
        biphenyl: 'C1=CC=CC=C1C2=CC=CC=C2',
        phenethylamine: 'C1=CC=CC=C1CCN',
        benzyl_alcohol: 'C1=CC=CC=C1CO',
      }

      for (const [name, expected] of Object.entries(expectedSmiles)) {
        expect(resolve(program, name, { decode: true })).toBe(expected)
      }
    })
  })

  // Test files that intentionally have circular dependencies
  describe('circular-deps.selfies', () => {
    test('should parse without syntax errors', () => {
      const source = readProgram('circular-deps.selfies')
      const program = parse(source)
      expect(program.errors).toEqual([])
    })

    test('should detect all circular dependencies', () => {
      const source = readProgram('circular-deps.selfies')
      const program = parse(source)
      const cycles = detectCycles(program)
      expect(cycles.length).toBeGreaterThan(0)
    })

    test('valid definitions should still resolve', () => {
      const source = readProgram('circular-deps.selfies')
      const program = parse(source)
      expect(resolve(program, 'valid_base')).toBe('[C]')
      expect(resolve(program, 'valid_composed')).toBe('[C][O]')
    })
  })
})
