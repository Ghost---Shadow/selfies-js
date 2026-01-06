/**
 * Integration tests - testing full workflows across multiple modules
 */

import { describe, test, expect } from 'bun:test'
import { decode, encode, isValid, getMolecularWeight, getFormula } from '../src/index.js'
import { parse, resolve, resolveAll } from '../src/index.js'
import moleculesFixture from './fixtures/molecules.json'

describe('SELFIES decode workflow', () => {
  // TODO: Test full decode pipeline using fixtures
  test('decodes all fixture molecules', () => {
    // TODO: for (const molecule of moleculesFixture.molecules) {
    // TODO:   const smiles = decode(molecule.selfies)
    // TODO:   expect(smiles).toBe(molecule.smiles)
    // TODO: }
  })

  test('validates before decoding', () => {
    // TODO: for (const molecule of moleculesFixture.molecules) {
    // TODO:   expect(isValid(molecule.selfies)).toBe(true)
    // TODO:   const smiles = decode(molecule.selfies)
    // TODO:   expect(smiles).toBe(molecule.smiles)
    // TODO: }
  })
})

describe('SELFIES properties workflow', () => {
  // TODO: Test property calculations using fixtures
  test('calculates molecular weight for all fixtures', () => {
    // TODO: for (const molecule of moleculesFixture.molecules) {
    // TODO:   const mw = getMolecularWeight(molecule.selfies)
    // TODO:   expect(mw).toBeCloseTo(molecule.molecularWeight, 2)
    // TODO: }
  })

  test('generates formula for all fixtures', () => {
    // TODO: for (const molecule of moleculesFixture.molecules) {
    // TODO:   const formula = getFormula(molecule.selfies)
    // TODO:   expect(formula).toBe(molecule.formula)
    // TODO: }
  })
})

describe('DSL workflow', () => {
  // TODO: Test full DSL pipeline
  test('parses and resolves simple definitions', () => {
    // TODO: const source = '[methyl] = [C]\n[ethanol] = [methyl][C][O]'
    // TODO: const program = parse(source)
    // TODO: expect(program.errors).toEqual([])
    // TODO:
    // TODO: const resolved = resolve(program, 'ethanol')
    // TODO: expect(resolved).toBe('[C][C][O]')
  })

  test('resolves and decodes in one step', () => {
    // TODO: const source = '[ethanol] = [C][C][O]'
    // TODO: const program = parse(source)
    // TODO:
    // TODO: const smiles = resolve(program, 'ethanol', { decode: true })
    // TODO: expect(smiles).toBe('CCO')
  })

  test('calculates properties from DSL definitions', () => {
    // TODO: const source = '[ethanol] = [C][C][O]'
    // TODO: const program = parse(source)
    // TODO:
    // TODO: const selfies = resolve(program, 'ethanol')
    // TODO: const mw = getMolecularWeight(selfies)
    // TODO: const formula = getFormula(selfies)
    // TODO:
    // TODO: expect(mw).toBeCloseTo(46.068, 2)
    // TODO: expect(formula).toBe('C2H6O')
  })
})

describe('Round-trip workflows', () => {
  test('round-trips through encode and decode', () => {
    const original = 'CCO'
    const selfies = encode(original)
    const decoded = decode(selfies)
    expect(decoded).toBe(original)

    expect(decode(encode('C=C'))).toBe('C=C')
    expect(decode(encode('C#C'))).toBe('C#C')
    expect(decode(encode('CC(C)C'))).toBe('CC(C)C')
    expect(decode(encode('C1CC1'))).toBe('C1CC1')
  })
})

describe('Error handling workflows', () => {
  // TODO: Test error propagation across modules
  test('validates invalid SELFIES before decode', () => {
    // TODO: const invalid = '[Xyz][C]'
    // TODO: expect(isValid(invalid)).toBe(false)
    // TODO: expect(() => decode(invalid)).toThrow()
  })

  test('handles DSL resolution errors', () => {
    // TODO: const source = '[a] = [b]\n[b] = [a]'  // circular
    // TODO: const program = parse(source)
    // TODO: expect(() => resolve(program, 'a')).toThrow()
  })
})
