/**
 * Tests for DSL lexer
 */

import { describe, test, expect } from 'bun:test'
import { lex, TokenType } from './lexer.js'

describe('lex', () => {
  // Basic lexing
  test('lexes simple definition', () => {
    const tokens = lex('[methyl] = [C]')
    expect(tokens).toHaveLength(4)  // SELFIES_TOKEN EQUALS SELFIES_TOKEN EOF
    expect(tokens[0].type).toBe(TokenType.SELFIES_TOKEN)
    expect(tokens[0].value).toBe('[methyl]')
    expect(tokens[1].type).toBe(TokenType.EQUALS)
    expect(tokens[2].type).toBe(TokenType.SELFIES_TOKEN)
    expect(tokens[2].value).toBe('[C]')
    expect(tokens[3].type).toBe(TokenType.EOF)
  })

  test('lexes multiple tokens', () => {
    const tokens = lex('[ethanol] = [C][C][O]')
    const selfiesTokens = tokens.filter(t => t.type === TokenType.SELFIES_TOKEN)
    expect(selfiesTokens).toHaveLength(4)  // [ethanol], [C], [C], [O]
    expect(selfiesTokens[1].value).toBe('[C]')
    expect(selfiesTokens[2].value).toBe('[C]')
    expect(selfiesTokens[3].value).toBe('[O]')
  })

  test('handles comments', () => {
    const tokens = lex('# This is a comment\n[methyl] = [C]')
    const comment = tokens.find(t => t.type === TokenType.COMMENT)
    expect(comment).toBeDefined()
    expect(comment.value).toBe('# This is a comment')
  })

  test('handles newlines', () => {
    const tokens = lex('[a] = [C]\n[b] = [N]')
    const newlines = tokens.filter(t => t.type === TokenType.NEWLINE)
    expect(newlines.length).toBe(1)  // Only the explicit \n, not at EOF
  })

  // Token properties
  test('includes line and column info', () => {
    const tokens = lex('[methyl] = [C]')
    expect(tokens[0]).toHaveProperty('line')
    expect(tokens[0]).toHaveProperty('column')
    expect(tokens[0].line).toBe(1)
    expect(tokens[0].column).toBe(1)
  })

  test('includes character range', () => {
    const tokens = lex('[methyl] = [C]')
    expect(tokens[0]).toHaveProperty('range')
    expect(Array.isArray(tokens[0].range)).toBe(true)
    expect(tokens[0].range).toEqual([0, 8])  // '[methyl]'
  })

  // Edge cases
  test('handles empty string', () => {
    const tokens = lex('')
    expect(tokens).toHaveLength(1)  // just EOF
    expect(tokens[0].type).toBe(TokenType.EOF)
  })

  test('handles whitespace', () => {
    const tokens = lex('[a]  =  [C]')  // extra spaces
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof).toHaveLength(3)  // [a], =, [C]
    expect(nonEof[0].value).toBe('[a]')
    expect(nonEof[1].value).toBe('=')
    expect(nonEof[2].value).toBe('[C]')
  })

  test('tracks line numbers correctly', () => {
    const tokens = lex('[a] = [C]\n[b] = [N]\n[c] = [O]')
    const selfiesTokens = tokens.filter(t => t.type === TokenType.SELFIES_TOKEN)
    expect(selfiesTokens[0].line).toBe(1)  // [a]
    expect(selfiesTokens[2].line).toBe(2)  // [b]
    expect(selfiesTokens[4].line).toBe(3)  // [c]
  })

  test('throws on unclosed bracket', () => {
    expect(() => lex('[methyl')).toThrow(/Unclosed bracket/)
  })

  test('throws on unexpected character', () => {
    expect(() => lex('[a] = [C] @')).toThrow(/Unexpected character/)
  })

  test('handles bond modifiers in tokens', () => {
    const tokens = lex('[alcohol] = [C][=O]')
    const selfiesTokens = tokens.filter(t => t.type === TokenType.SELFIES_TOKEN)
    expect(selfiesTokens[1].value).toBe('[C]')
    expect(selfiesTokens[2].value).toBe('[=O]')
  })

  test('handles inline comments', () => {
    const tokens = lex('[methyl] = [C]  # carbon atom')
    const comment = tokens.find(t => t.type === TokenType.COMMENT)
    expect(comment).toBeDefined()
    expect(comment.value).toContain('carbon atom')
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
