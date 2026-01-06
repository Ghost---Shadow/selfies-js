/**
 * Tests for DSL lexer
 */

import { describe, test, expect } from 'bun:test'
import { lex, TokenType } from './lexer.js'

describe('lex', () => {
  // TODO: Basic lexing
  test('lexes simple definition', () => {
    // TODO: const tokens = lex('[methyl] = [C]')
    // TODO: expect(tokens).toHaveLength(4)  // NAME EQUALS SELFIES_TOKEN EOF
    // TODO: expect(tokens[0].type).toBe(TokenType.NAME)
    // TODO: expect(tokens[1].type).toBe(TokenType.EQUALS)
    // TODO: expect(tokens[2].type).toBe(TokenType.SELFIES_TOKEN)
  })

  test('lexes multiple tokens', () => {
    // TODO: const tokens = lex('[ethanol] = [C][C][O]')
    // TODO: const selfiesTokens = tokens.filter(t => t.type === TokenType.SELFIES_TOKEN)
    // TODO: expect(selfiesTokens).toHaveLength(3)
  })

  test('handles comments', () => {
    // TODO: const tokens = lex('# This is a comment\n[methyl] = [C]')
    // TODO: const comment = tokens.find(t => t.type === TokenType.COMMENT)
    // TODO: expect(comment).toBeDefined()
  })

  test('handles newlines', () => {
    // TODO: const tokens = lex('[a] = [C]\n[b] = [N]')
    // TODO: const newlines = tokens.filter(t => t.type === TokenType.NEWLINE)
    // TODO: expect(newlines.length).toBeGreaterThan(0)
  })

  // TODO: Token properties
  test('includes line and column info', () => {
    // TODO: const tokens = lex('[methyl] = [C]')
    // TODO: expect(tokens[0]).toHaveProperty('line')
    // TODO: expect(tokens[0]).toHaveProperty('column')
  })

  test('includes character range', () => {
    // TODO: const tokens = lex('[methyl] = [C]')
    // TODO: expect(tokens[0]).toHaveProperty('range')
    // TODO: expect(Array.isArray(tokens[0].range)).toBe(true)
  })

  // TODO: Edge cases
  test('handles empty string', () => {
    // TODO: const tokens = lex('')
    // TODO: expect(tokens).toHaveLength(1)  // just EOF
    // TODO: expect(tokens[0].type).toBe(TokenType.EOF)
  })

  test('handles whitespace', () => {
    // TODO: const tokens = lex('[a]  =  [C]')  // extra spaces
    // TODO: Should parse correctly despite extra whitespace
  })
})

describe('TokenType', () => {
  test('exports all token types', () => {
    expect(TokenType.NAME).toBeDefined()
    expect(TokenType.EQUALS).toBeDefined()
    expect(TokenType.SELFIES_TOKEN).toBeDefined()
    expect(TokenType.COMMENT).toBeDefined()
    expect(TokenType.NEWLINE).toBeDefined()
    expect(TokenType.EOF).toBeDefined()
  })
})
