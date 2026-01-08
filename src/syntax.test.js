import { describe, it, expect } from 'bun:test'
import {
  tokenizeSelfies,
  tokenizeDSL,
  SyntaxTokenType,
  TokenModifier,
  getColorScheme,
  getTextMateScopes,
  getMonacoTokenTypes,
  createMonacoLanguage,
  validateTokenization,
  highlightToHtml
} from './syntax.js'

describe('tokenizeSelfies', () => {
  it('should tokenize basic atoms', () => {
    const result = tokenizeSelfies('[C][N][O]')
    expect(result.tokens).toHaveLength(3)
    expect(result.tokens[0].type).toBe(SyntaxTokenType.ATOM)
    expect(result.tokens[0].value).toBe('[C]')
    expect(result.tokens[0].start).toBe(0)
    expect(result.tokens[0].end).toBe(3)
    expect(result.tokens[1].type).toBe(SyntaxTokenType.ATOM)
    expect(result.tokens[2].type).toBe(SyntaxTokenType.ATOM)
  })

  it('should tokenize bond-modified atoms', () => {
    const result = tokenizeSelfies('[C][=C][#N]')
    expect(result.tokens).toHaveLength(3)
    expect(result.tokens[0].type).toBe(SyntaxTokenType.ATOM)
    expect(result.tokens[1].type).toBe(SyntaxTokenType.BOND)
    expect(result.tokens[1].value).toBe('[=C]')
    expect(result.tokens[2].type).toBe(SyntaxTokenType.BOND)
    expect(result.tokens[2].value).toBe('[#N]')
  })

  it('should tokenize branch tokens', () => {
    const result = tokenizeSelfies('[C][Branch1][C][O]')
    expect(result.tokens).toHaveLength(4)
    expect(result.tokens[1].type).toBe(SyntaxTokenType.BRANCH)
    expect(result.tokens[1].value).toBe('[Branch1]')
  })

  it('should tokenize ring tokens', () => {
    const result = tokenizeSelfies('[C][Ring1][C]')
    expect(result.tokens).toHaveLength(3)
    expect(result.tokens[1].type).toBe(SyntaxTokenType.RING)
    expect(result.tokens[1].value).toBe('[Ring1]')
  })

  it('should tokenize bond-modified branches', () => {
    const result = tokenizeSelfies('[C][=Branch1][C][=O]')
    expect(result.tokens).toHaveLength(4)
    expect(result.tokens[1].type).toBe(SyntaxTokenType.BRANCH)
    expect(result.tokens[1].modifiers).toContain('double')
  })

  it('should add organic modifier to organic atoms', () => {
    const result = tokenizeSelfies('[C]')
    expect(result.tokens[0].modifiers).toContain(TokenModifier.ORGANIC)
  })

  it('should add halogen modifier to halogens', () => {
    const result = tokenizeSelfies('[F][Cl][Br][I]')
    for (const token of result.tokens) {
      expect(token.modifiers).toContain(TokenModifier.HALOGEN)
    }
  })

  it('should mark invalid tokens', () => {
    const result = tokenizeSelfies('[InvalidElement]')
    expect(result.tokens[0].type).toBe(SyntaxTokenType.INVALID_TOKEN)
    expect(result.tokens[0].modifiers).toContain(TokenModifier.INVALID)
  })

  it('should handle known DSL names as references', () => {
    const knownNames = new Set(['[methyl]'])
    const result = tokenizeSelfies('[methyl][C]', { knownNames })
    expect(result.tokens[0].type).toBe(SyntaxTokenType.REFERENCE)
    expect(result.tokens[1].type).toBe(SyntaxTokenType.ATOM)
  })

  it('should detect gaps between tokens as errors', () => {
    const result = tokenizeSelfies('[C]invalid[N]')
    expect(result.tokens).toHaveLength(3)
    expect(result.tokens[1].type).toBe(SyntaxTokenType.ERROR)
    expect(result.tokens[1].value).toBe('invalid')
    expect(result.errors).toHaveLength(1)
  })

  it('should detect trailing content as error', () => {
    const result = tokenizeSelfies('[C]trailing')
    expect(result.tokens).toHaveLength(2)
    expect(result.tokens[1].type).toBe(SyntaxTokenType.ERROR)
    expect(result.errors).toHaveLength(1)
  })

  it('should return empty tokens for empty input', () => {
    const result = tokenizeSelfies('')
    expect(result.tokens).toHaveLength(0)
    expect(result.errors).toHaveLength(0)
  })

  it('should skip alphabet validation when disabled', () => {
    const result = tokenizeSelfies('[XYZ]', { validateAgainstAlphabet: false })
    expect(result.tokens[0].type).toBe(SyntaxTokenType.ATOM)
    expect(result.tokens[0].modifiers).not.toContain(TokenModifier.INVALID)
  })
})

describe('tokenizeDSL', () => {
  it('should tokenize definition', () => {
    const result = tokenizeDSL('[methyl] = [C]')
    expect(result.tokens).toHaveLength(3)
    expect(result.tokens[0].type).toBe(SyntaxTokenType.IDENTIFIER)
    expect(result.tokens[0].modifiers).toContain(TokenModifier.DEFINITION)
    expect(result.tokens[1].type).toBe(SyntaxTokenType.OPERATOR)
    expect(result.tokens[2].type).toBe(SyntaxTokenType.ATOM)
  })

  it('should tokenize reference', () => {
    const result = tokenizeDSL('[methyl] = [C]\n[ethyl] = [methyl][C]')
    const ethylDef = result.tokens.find(t => t.value === '[ethyl]')
    const methylRef = result.tokens.filter(t => t.value === '[methyl]')[1]
    expect(ethylDef.type).toBe(SyntaxTokenType.IDENTIFIER)
    expect(methylRef.type).toBe(SyntaxTokenType.REFERENCE)
    expect(methylRef.modifiers).toContain(TokenModifier.REFERENCE)
  })

  it('should tokenize comments', () => {
    const result = tokenizeDSL('# this is a comment\n[methyl] = [C]')
    expect(result.tokens[0].type).toBe(SyntaxTokenType.COMMENT)
    expect(result.tokens[0].value).toBe('# this is a comment')
  })

  it('should tokenize import keyword', () => {
    const result = tokenizeDSL('import "./base.selfies"')
    expect(result.tokens[0].type).toBe(SyntaxTokenType.KEYWORD)
    expect(result.tokens[0].value).toBe('import')
    expect(result.tokens[1].type).toBe(SyntaxTokenType.STRING)
    expect(result.tokens[1].value).toBe('"./base.selfies"')
  })

  it('should tokenize import * from syntax', () => {
    const result = tokenizeDSL('import * from "./base.selfies"')
    expect(result.tokens[0].type).toBe(SyntaxTokenType.KEYWORD) // import
    expect(result.tokens[1].type).toBe(SyntaxTokenType.PUNCTUATION) // *
    expect(result.tokens[2].type).toBe(SyntaxTokenType.KEYWORD) // from
    expect(result.tokens[3].type).toBe(SyntaxTokenType.STRING) // path
  })

  it('should tokenize selective import syntax', () => {
    const result = tokenizeDSL('import [methyl, ethyl] from "./base.selfies"')
    expect(result.tokens[0].type).toBe(SyntaxTokenType.KEYWORD) // import
    // The bracketed names get tokenized as SELFIES_TOKEN
    // which is then classified
  })

  it('should track defined names in metadata', () => {
    const result = tokenizeDSL('[a] = [C]\n[b] = [N]')
    expect(result.metadata.definedNames.has('[a]')).toBe(true)
    expect(result.metadata.definedNames.has('[b]')).toBe(true)
  })

  it('should handle lexer errors gracefully', () => {
    const result = tokenizeDSL('[unclosed')
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should classify SELFIES tokens in definition body', () => {
    const result = tokenizeDSL('[ketone] = [C][=O]')
    const oxygenToken = result.tokens.find(t => t.value === '[=O]')
    expect(oxygenToken.type).toBe(SyntaxTokenType.BOND)
  })

  it('should mark newlines', () => {
    const result = tokenizeDSL('[a] = [C]\n[b] = [N]')
    const newlines = result.tokens.filter(t => t.type === SyntaxTokenType.NEWLINE)
    expect(newlines.length).toBeGreaterThan(0)
  })
})

describe('getColorScheme', () => {
  it('should return dark theme colors by default', () => {
    const colors = getColorScheme()
    expect(colors[SyntaxTokenType.ATOM]).toBe('#61afef')
    expect(colors[SyntaxTokenType.BOND]).toBe('#c678dd')
    expect(colors[SyntaxTokenType.COMMENT]).toBe('#5c6370')
  })

  it('should return light theme colors', () => {
    const colors = getColorScheme('light')
    expect(colors[SyntaxTokenType.ATOM]).toBe('#0184bc')
    expect(colors[SyntaxTokenType.STRING]).toBe('#50a14f')
  })

  it('should have all token types', () => {
    const colors = getColorScheme()
    for (const type of Object.values(SyntaxTokenType)) {
      expect(colors[type]).toBeDefined()
    }
  })
})

describe('getTextMateScopes', () => {
  it('should return TextMate scopes for all types', () => {
    const scopes = getTextMateScopes()
    expect(scopes[SyntaxTokenType.ATOM]).toBe('entity.name.tag.atom.selfies')
    expect(scopes[SyntaxTokenType.COMMENT]).toBe('comment.line.number-sign.selfies')
    expect(scopes[SyntaxTokenType.KEYWORD]).toBe('keyword.control.import.selfies')
  })

  it('should have all token types', () => {
    const scopes = getTextMateScopes()
    for (const type of Object.values(SyntaxTokenType)) {
      expect(scopes[type]).toBeDefined()
    }
  })
})

describe('getMonacoTokenTypes', () => {
  it('should return Monaco token types', () => {
    const types = getMonacoTokenTypes()
    expect(types[SyntaxTokenType.ATOM]).toBe('type.identifier')
    expect(types[SyntaxTokenType.COMMENT]).toBe('comment')
    expect(types[SyntaxTokenType.STRING]).toBe('string')
  })
})

describe('createMonacoLanguage', () => {
  it('should create valid Monaco language definition', () => {
    const lang = createMonacoLanguage()
    expect(lang.id).toBe('selfies')
    expect(lang.extensions).toContain('.selfies')
    expect(lang.tokenizer).toBeDefined()
    expect(lang.tokenizer.root).toBeDefined()
    expect(Array.isArray(lang.tokenizer.root)).toBe(true)
  })
})

describe('validateTokenization', () => {
  it('should validate complete tokenization', () => {
    const result = tokenizeSelfies('[C][N][O]')
    const validation = validateTokenization(result.tokens, '[C][N][O]')
    expect(validation.valid).toBe(true)
    expect(validation.gaps).toHaveLength(0)
  })

  it('should detect gaps in tokenization', () => {
    const tokens = [
      { type: 'atom', value: '[C]', start: 0, end: 3 },
      { type: 'atom', value: '[N]', start: 6, end: 9 }
    ]
    const validation = validateTokenization(tokens, '[C]...[N]')
    expect(validation.valid).toBe(false)
    expect(validation.gaps).toHaveLength(1)
    expect(validation.gaps[0]).toEqual({ start: 3, end: 6 })
  })

  it('should detect trailing content', () => {
    const tokens = [
      { type: 'atom', value: '[C]', start: 0, end: 3 }
    ]
    const validation = validateTokenization(tokens, '[C]extra')
    expect(validation.valid).toBe(false)
    expect(validation.gaps).toHaveLength(1)
    expect(validation.gaps[0]).toEqual({ start: 3, end: 8 })
  })
})

describe('highlightToHtml', () => {
  it('should generate HTML with spans', () => {
    const html = highlightToHtml('[C][N]', { language: 'selfies' })
    expect(html).toContain('<span')
    expect(html).toContain('selfies-atom')
    expect(html).toContain('[C]')
    expect(html).toContain('[N]')
  })

  it('should use provided theme colors', () => {
    const htmlDark = highlightToHtml('[C]', { language: 'selfies', theme: 'dark' })
    const htmlLight = highlightToHtml('[C]', { language: 'selfies', theme: 'light' })
    expect(htmlDark).toContain('#61afef')
    expect(htmlLight).toContain('#0184bc')
  })

  it('should use custom class prefix', () => {
    const html = highlightToHtml('[C]', {
      language: 'selfies',
      classPrefix: 'my-'
    })
    expect(html).toContain('my-atom')
  })

  it('should escape HTML characters', () => {
    // Note: This tests the escapeHtml helper via highlightToHtml
    // DSL with a comment that has special chars
    const html = highlightToHtml('# <script>alert("xss")</script>', { language: 'dsl' })
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })

  it('should handle DSL language', () => {
    const html = highlightToHtml('[methyl] = [C]', { language: 'dsl' })
    expect(html).toContain('selfies-identifier')
    expect(html).toContain('selfies-operator')
    expect(html).toContain('selfies-atom')
  })

  it('should include modifier classes', () => {
    const html = highlightToHtml('[C]', { language: 'selfies' })
    expect(html).toContain('selfies-organic')
  })
})

describe('integration', () => {
  it('should handle complex SELFIES string', () => {
    // Ethanol: C-C-O
    const selfies = '[C][C][O]'
    const result = tokenizeSelfies(selfies)
    expect(result.errors).toHaveLength(0)
    expect(result.tokens).toHaveLength(3)
    result.tokens.forEach(t => {
      expect(t.type).toBe(SyntaxTokenType.ATOM)
    })
  })

  it('should handle complex DSL program', () => {
    const dsl = `
# Common functional groups
[hydroxyl] = [O]
[carboxyl] = [C][=O][hydroxyl]
[amino] = [N]

# Glycine (simplest amino acid)
[glycine] = [amino][C][carboxyl]
`
    const result = tokenizeDSL(dsl)
    expect(result.errors).toHaveLength(0)
    expect(result.metadata.definedNames.has('[hydroxyl]')).toBe(true)
    expect(result.metadata.definedNames.has('[carboxyl]')).toBe(true)
    expect(result.metadata.definedNames.has('[glycine]')).toBe(true)

    // Check that carboxyl definition has a reference to hydroxyl
    const hydroxylRef = result.tokens.find(
      t => t.value === '[hydroxyl]' && t.type === SyntaxTokenType.REFERENCE
    )
    expect(hydroxylRef).toBeDefined()
  })

  it('should handle import statements in DSL', () => {
    const dsl = `import * from "./fragments.selfies"
import "./base.selfies"
[molecule] = [C][N]`

    const result = tokenizeDSL(dsl)
    const keywords = result.tokens.filter(t => t.type === SyntaxTokenType.KEYWORD)
    expect(keywords.length).toBe(3) // import, from, import

    const strings = result.tokens.filter(t => t.type === SyntaxTokenType.STRING)
    expect(strings.length).toBe(2)
  })
})
