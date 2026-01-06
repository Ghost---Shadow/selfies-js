/**
 * Tests for error classes
 */

import { describe, test, expect } from 'bun:test'
import {
  SelfiesError,
  DecodeError,
  EncodeError,
  ResolveError,
  ValidationError,
  ParseError
} from './errors.js'

describe('SelfiesError', () => {
  test('creates base error', () => {
    const error = new SelfiesError('test message')
    expect(error.message).toBe('test message')
    expect(error.name).toBe('SelfiesError')
    expect(error instanceof Error).toBe(true)
  })
})

describe('DecodeError', () => {
  test('creates decode error with message', () => {
    const error = new DecodeError('decode failed')
    expect(error.message).toBe('decode failed')
    expect(error.name).toBe('DecodeError')
    expect(error instanceof SelfiesError).toBe(true)
  })

  test('includes token and position', () => {
    const error = new DecodeError('invalid token', '[Xyz]', 5)
    expect(error.token).toBe('[Xyz]')
    expect(error.position).toBe(5)
  })
})

describe('EncodeError', () => {
  test('creates encode error with message', () => {
    const error = new EncodeError('encode failed')
    expect(error.message).toBe('encode failed')
    expect(error.name).toBe('EncodeError')
  })

  test('includes smiles string', () => {
    const error = new EncodeError('invalid smiles', 'invalid')
    expect(error.smiles).toBe('invalid')
  })
})

describe('ResolveError', () => {
  test('creates resolve error with message', () => {
    const error = new ResolveError('resolve failed')
    expect(error.message).toBe('resolve failed')
    expect(error.name).toBe('ResolveError')
  })

  test('includes definition name', () => {
    const error = new ResolveError('undefined reference', 'methyl')
    expect(error.definitionName).toBe('methyl')
  })
})

describe('ValidationError', () => {
  test('creates validation error', () => {
    const error = new ValidationError('validation failed')
    expect(error.message).toBe('validation failed')
    expect(error.name).toBe('ValidationError')
  })

  test('includes token and position', () => {
    const error = new ValidationError('invalid', '[Bad]', 10)
    expect(error.token).toBe('[Bad]')
    expect(error.position).toBe(10)
  })
})

describe('ParseError', () => {
  test('creates parse error', () => {
    const error = new ParseError('parse failed')
    expect(error.message).toBe('parse failed')
    expect(error.name).toBe('ParseError')
  })

  test('includes line and column', () => {
    const error = new ParseError('syntax error', 5, 10)
    expect(error.line).toBe(5)
    expect(error.column).toBe(10)
  })
})
