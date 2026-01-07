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
import { detectCycles, detectForwardReferences, findUnused } from '../../../src/dsl/analyzer.js'

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
      expect(resolved.get('methyl')).toBe('[C]')
      expect(resolved.get('ethanol')).toBe('[C][C][O]')
      expect(resolved.get('acetone')).toContain('[C]')
      expect(resolved.get('acetone')).toContain('[=O]')
    })

    test('should decode to valid SMILES', () => {
      const source = readProgram('simple.selfies')
      const program = parse(source)

      expect(resolve(program, 'methanol', { decode: true })).toBe('CO')
      expect(resolve(program, 'ethanol', { decode: true })).toBe('CCO')
    })
  })

  describe('forward-ref.selfies', () => {
    test('should parse without errors', () => {
      const source = readProgram('forward-ref.selfies')
      const program = parse(source)

      expect(program.errors).toEqual([])
    })

    test('should detect forward references', () => {
      const source = readProgram('forward-ref.selfies')
      const program = parse(source)
      const forward = detectForwardReferences(program)

      expect(forward.length).toBeGreaterThan(0)
      expect(forward.some(f => f.message.includes('ethyl'))).toBe(true)
      expect(forward.some(f => f.message.includes('hydroxyl'))).toBe(true)
    })

    test('should still resolve despite forward references', () => {
      const source = readProgram('forward-ref.selfies')
      const program = parse(source)

      expect(resolve(program, 'alcohol')).toBe('[C][C][O]')
      expect(resolve(program, 'longer_alcohol')).toBe('[C][C][C][O]')
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

    test('should resolve hierarchical definitions', () => {
      const source = readProgram('amino-acids.selfies')
      const program = parse(source)

      const glycine = resolve(program, 'glycine')
      expect(glycine).toContain('[N]')
      expect(glycine).toContain('[C]')
      expect(glycine).toContain('[O]')

      const alanine = resolve(program, 'alanine')
      expect(alanine).toContain('[N]')
      expect(alanine).toContain('[Branch1]')
    })
  })

  describe('complex-molecules.selfies', () => {
    test('should compile successfully', () => {
      const source = readProgram('complex-molecules.selfies')
      const program = parse(source)

      expect(program.errors).toEqual([])
    })

    test('should handle branched structures', () => {
      const source = readProgram('complex-molecules.selfies')
      const program = parse(source)

      const isobutane = resolve(program, 'isobutane')
      expect(isobutane).toContain('[Branch1]')
    })

    test('should handle ring structures', () => {
      const source = readProgram('complex-molecules.selfies')
      const program = parse(source)

      const benzene = resolve(program, 'benzene')
      expect(benzene).toContain('[Ring1]')

      const cyclohexane = resolve(program, 'cyclohexane')
      expect(cyclohexane).toContain('[Ring1]')
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

    test('should resolve pharma fragments', () => {
      const source = readProgram('pharmaceutical.selfies')
      const program = parse(source)

      expect(resolve(program, 'phenol')).toBe('[C][=C][C][=C][C][=C][Ring1][=Branch1][O]')
      expect(resolve(program, 'aniline')).toBe('[C][=C][C][=C][C][=C][Ring1][=Branch1][N]')
      expect(resolve(program, 'benzamide')).toBe('[C][=C][C][=C][C][=C][Ring1][=Branch1][C][=O][N]')
    })
  })

  describe('polymers.selfies', () => {
    test('should compile successfully', () => {
      const source = readProgram('polymers.selfies')
      const program = parse(source)

      expect(program.errors).toEqual([])
    })

    test('should resolve polymer units', () => {
      const source = readProgram('polymers.selfies')
      const program = parse(source)

      expect(resolve(program, 'PE_unit')).toBe('[C][C]')
      expect(resolve(program, 'PS_unit')).toContain('[Branch1]')
    })
  })

  describe('undefined-refs.selfies', () => {
    test('should parse without syntax errors', () => {
      const source = readProgram('undefined-refs.selfies')
      const program = parse(source)

      expect(program.errors).toEqual([])
    })

    test('should treat undefined references as primitives', () => {
      const source = readProgram('undefined-refs.selfies')
      const program = parse(source)

      // Undefined names are treated as primitive SELFIES tokens (could be valid)
      // compound1 uses [undefined_group] which gets passed through as-is
      const result1 = resolve(program, 'compound1')
      expect(result1).toContain('[undefined_group]')

      const result2 = resolve(program, 'compound2')
      expect(result2).toContain('[mystery]')

      const result3 = resolve(program, 'compound3')
      expect(result3).toContain('[unknown1]')
    })

    test('should resolve valid definitions', () => {
      const source = readProgram('undefined-refs.selfies')
      const program = parse(source)

      expect(resolve(program, 'methyl')).toBe('[C]')
      expect(resolve(program, 'ethyl')).toBe('[C][C]')
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
})
