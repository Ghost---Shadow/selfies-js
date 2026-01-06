# Implementation Guide

This document provides guidance for implementing the selfies-js library.

## Project Status

**Current State:** Boilerplate complete with TODO stubs everywhere
**Next Steps:** Implement functionality module by module

## Implementation Order

Recommended order for implementing modules (dependencies flow bottom-up):

### Phase 1: Foundation
1. **errors.js** - Already has basic structure, expand as needed
2. **properties/atoms.js** - Fill in atomic data (masses, valences)
3. **alphabet.js** - Define valid SELFIES token sets

### Phase 2: Core SELFIES
4. **tokenizer.js** - Implement bracket-based tokenization
5. **parser.js** - Parse tokens into molecule IR
6. **validator.js** - Syntax validation (uses alphabet.js)
7. **decoder.js** - Convert SELFIES to SMILES (uses tokenizer, parser)

### Phase 3: Properties
8. **properties/molecularWeight.js** - Calculate MW from IR
9. **properties/formula.js** - Generate molecular formula from IR

### Phase 4: DSL
10. **dsl/lexer.js** - Tokenize DSL source
11. **dsl/symbolTable.js** - Manage name-to-definition mapping
12. **dsl/parser.js** - Parse DSL into Program AST
13. **dsl/analyzer.js** - Detect cycles, forward refs, etc.
14. **dsl/resolver.js** - Expand definitions to primitive SELFIES

### Phase 5: Encoder (Post-MVP)
15. **encoder.js** - Convert SMILES to SELFIES (complex, defer to post-MVP)

## Key Implementation Notes

### Tokenizer (tokenizer.js)
- Scan for `[` and `]` brackets
- Extract content between brackets
- Handle unclosed brackets as errors
- Return array of tokens

### Parser (parser.js)
- Build molecule IR: `{ atoms: [...], bonds: [...] }`
- State machine approach:
  - Track current atom index
  - Track branch stack
  - Track ring closures
- Handle bond order prefixes (`=`, `#`)
- Handle Branch/Ring tokens with length specifiers

### Decoder (decoder.js)
- Use parser to get IR
- Convert IR to SMILES string
- DFS traversal of molecule graph
- Handle branches with parentheses
- Handle rings with numbers

### Alphabet (alphabet.js)
**Supported Elements:**
- C, N, O, S, P, F, Cl, Br, I, B

**Token Types:**
- Atoms: `[C]`, `[N]`, `[O]`, etc.
- Bond modifiers: `[=C]`, `[#N]`, etc.
- Branches: `[Branch1]`, `[Branch2]`, `[Branch3]`
- Rings: `[Ring1]`, `[Ring2]`, `[Ring3]`

### Atomic Data (properties/atoms.js)
Fill in for each element:
```javascript
'C': { mass: 12.011, valence: 4, name: 'Carbon' }
'N': { mass: 14.007, valence: 3, name: 'Nitrogen' }
'O': { mass: 15.999, valence: 2, name: 'Oxygen' }
// etc.
```

### DSL Lexer (dsl/lexer.js)
**Token Types:**
- `NAME`: `[identifier]` at start of line
- `EQUALS`: `=`
- `SELFIES_TOKEN`: `[token]` after equals
- `COMMENT`: `# ...`
- `NEWLINE`: `\n`

### DSL Parser (dsl/parser.js)
**Grammar:**
```
program := definition*
definition := NAME EQUALS SELFIES_TOKEN+ NEWLINE
```

**Output:**
```javascript
{
  definitions: Map<string, Definition>,
  errors: Diagnostic[],
  warnings: Diagnostic[]
}
```

### DSL Resolver (dsl/resolver.js)
- Recursive expansion of references
- Cycle detection with visiting set
- Cache resolved values for performance

## Testing Strategy

1. Start with tokenizer tests - these are simplest
2. Add parser tests with IR validation
3. Add decoder tests using molecules.json fixtures
4. Add property calculation tests
5. Add DSL tests with fixture programs
6. Add integration tests

Run tests with: `bun test`

## Performance Targets

From design document:
- Tokenize (50 tokens): < 0.1ms
- Decode (50 tokens): < 1ms
- Total per keystroke: < 16ms (for 60fps editor feedback)

Use `bun run bench/decode.bench.js` to verify performance.

## File Organization

```
src/
├── index.js              # Public API (exports)
├── tokenizer.js          # SELFIES → tokens
├── parser.js             # tokens → IR
├── decoder.js            # IR → SMILES
├── encoder.js            # SMILES → SELFIES (post-MVP)
├── validator.js          # Syntax validation
├── alphabet.js           # Valid token sets
├── errors.js             # Error types
├── dsl/
│   ├── lexer.js         # DSL → tokens
│   ├── parser.js        # tokens → AST
│   ├── symbolTable.js   # name → definition
│   ├── resolver.js      # expand references
│   └── analyzer.js      # static analysis
└── properties/
    ├── atoms.js         # atomic data
    ├── molecularWeight.js
    └── formula.js
```

## Common Patterns

### Error Handling
```javascript
import { DecodeError } from './errors.js'

if (invalid) {
  throw new DecodeError('Invalid token', token, position)
}
```

### Token Validation
```javascript
import { getAlphabet } from './alphabet.js'

const alphabet = getAlphabet()
if (!alphabet.has(token)) {
  throw new ValidationError(`Unknown token: ${token}`)
}
```

### IR Structure
```javascript
{
  atoms: [
    { element: 'C', index: 0, valence: 4, usedValence: 2 },
    { element: 'O', index: 1, valence: 2, usedValence: 1 }
  ],
  bonds: [
    { from: 0, to: 1, order: 1 }
  ]
}
```

## Next Steps

1. Review the design document (selfies-js-design.md)
2. Start with Phase 1 (Foundation)
3. Implement one module at a time
4. Write tests as you go
5. Use TODO comments to track progress
6. Run `bun test` frequently

Good luck!
