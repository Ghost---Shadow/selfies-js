# Instructions for Claude

## Context

This is **selfies-js**, a pure JavaScript implementation of the SELFIES (SELF-referencIng Embedded Strings) molecular representation format. The project structure and boilerplate are complete with TODO stubs everywhere. Your job is to implement the functionality.

## Getting Started

### 1. Read the Documentation (IMPORTANT!)

**Start by reading these files in order:**

```bash
# 1. High-level overview and design
../selfies-js-design.md        # Original API design specification

# 2. Implementation guides (in ./docs/)
docs/PROJECT_STATUS.md         # Current status, file tree, checklist
docs/IMPLEMENTATION.md         # Phase-by-phase guide, algorithms, patterns
docs/COMPARISON.md             # Comparison with Python implementation
docs/FEATURES_ADDED.md         # Recent additions and why
docs/TEST_ORGANIZATION.md      # How tests are organized
```

**Read them in this order:**
1. `PROJECT_STATUS.md` - Understand what exists
2. `IMPLEMENTATION.md` - Understand how to implement
3. `COMPARISON.md` - Understand differences from Python version
4. `../selfies-js-design.md` - Understand the full API spec

### 2. Understand the Structure

```
selfies-js/
├── src/                     # Source files (all have TODOs)
│   ├── *.js                 # Core modules
│   ├── *.test.js            # Unit tests (alongside source)
│   ├── dsl/                 # DSL parsing modules
│   └── properties/          # Molecular property calculators
├── test/                    # Integration tests and fixtures
├── bench/                   # Performance benchmarks
└── docs/                    # Implementation documentation
```

## Implementation Phases

Follow this order (detailed in `docs/IMPLEMENTATION.md`):

### Phase 1: Foundation ⭐ START HERE
1. `src/properties/atoms.js` - Fill in atomic data (masses, valences)
2. `src/alphabet.js` - Define valid SELFIES tokens
3. `src/constraints.js` - Implement constraint system

### Phase 2: Core SELFIES
4. `src/tokenizer.js` - Implement tokenization
5. `src/parser.js` - Build molecule IR from tokens
6. `src/validator.js` - Syntax validation
7. `src/decoder.js` - SELFIES → SMILES

### Phase 3: Properties
8. `src/properties/molecularWeight.js` - Calculate molecular weight
9. `src/properties/formula.js` - Generate molecular formula

### Phase 4: DSL
10. `src/dsl/lexer.js` - Tokenize DSL
11. `src/dsl/symbolTable.js` - Symbol table operations
12. `src/dsl/parser.js` - Parse DSL to AST
13. `src/dsl/analyzer.js` - Detect cycles, forward refs
14. `src/dsl/resolver.js` - Expand definitions

### Phase 5: Post-MVP
15. `src/encoder.js` - SMILES → SELFIES (complex, defer)

## How to Implement

### For Each Module:

1. **Read the file** - Each has detailed TODO comments with algorithms
2. **Check references** - Many TODOs reference selfies-py (Python implementation)
3. **Write implementation** - Replace `throw new Error('Not implemented')`
4. **Uncomment tests** - Tests are in `*.test.js` files with TODOs
5. **Run tests** - `bun test` to verify
6. **Move to next** - Follow the phase order

### Example Workflow:

```javascript
// Before (in tokenizer.js):
export function tokenize(selfies) {
  // TODO: Implement tokenization
  // Algorithm:
  // 1. Scan through string character by character
  // 2. When '[' is found, start accumulating token
  // 3. When ']' is found, complete the token
  throw new Error('Not implemented')
}

// After:
export function tokenize(selfies) {
  const tokens = []
  let current = ''
  let inToken = false

  for (let i = 0; i < selfies.length; i++) {
    const char = selfies[i]
    if (char === '[') {
      inToken = true
      current = '['
    } else if (char === ']') {
      current += ']'
      tokens.push(current)
      current = ''
      inToken = false
    } else if (inToken) {
      current += char
    }
  }

  return tokens
}
```

Then uncomment and run tests:
```bash
bun test src/tokenizer.test.js
```

## Important Notes

### Testing
- **Unit tests** are alongside source files (e.g., `tokenizer.test.js` next to `tokenizer.js`)
- **Integration tests** are in `test/integration.test.js`
- **Fixtures** are in `test/fixtures/` (molecules.json, DSL programs)
- Run all tests: `bun test`
- Run specific test: `bun test src/tokenizer.test.js`

### Test Files Have TODOs
All test files have test cases outlined but commented with `// TODO:`. Uncomment them as you implement.

### Reference Implementation
The Python implementation (selfies-py) is in `../selfies-py/`. You can reference it for algorithms, but **don't copy directly** - adapt to JavaScript idioms.

Key Python files:
- `selfies-py/selfies/decoder.py` - SELFIES → SMILES
- `selfies-py/selfies/encoder.py` - SMILES → SELFIES
- `selfies-py/selfies/bond_constraints.py` - Constraint system
- `selfies-py/selfies/grammar_rules.py` - Token parsing

### Design Philosophy
- **JavaScript implementation** should be functional, not OOP like Python
- Use plain objects for IR: `{ atoms: [...], bonds: [...] }`
- No classes for MolecularGraph (unlike Python)
- Simple, idiomatic JavaScript

### Performance Targets
From `docs/IMPLEMENTATION.md`:
- Tokenize (50 tokens): < 0.1ms
- Decode (50 tokens): < 1ms
- Total per keystroke: < 16ms (for VS Code extension)

### Constraint System
New addition from Python comparison:
- Three presets: "default", "octet_rule", "hypervalent"
- Validates bonding capacity (e.g., C can have max 4 bonds)
- See `docs/COMPARISON.md` for details

## Quick Commands

```bash
# Run all tests
bun test

# Run specific test file
bun test src/tokenizer.test.js

# Run benchmarks
bun run bench

# Check file structure
find . -name "*.js" | grep -v node_modules
```

## What NOT to Do

❌ Don't implement encoder yet (Phase 5, post-MVP)
❌ Don't add features not in design document
❌ Don't create new files (everything needed exists)
❌ Don't change the public API in src/index.js
❌ Don't remove TODO comments until implemented
❌ Don't skip the documentation in docs/

## When You're Done

After implementing all phases:
1. All tests pass: `bun test`
2. Benchmarks meet targets: `bun run bench`
3. No more TODO comments in implementation code
4. Delete the `docs/` folder: `rm -rf docs/`
5. Delete this file: `rm claude.md`

---

## Start Here

1. ✅ Read `docs/PROJECT_STATUS.md`
2. ✅ Read `docs/IMPLEMENTATION.md`
3. ✅ Understand Phase 1 requirements
4. 🎯 Start implementing `src/properties/atoms.js`

Good luck! The boilerplate is complete, all algorithms are documented, tests are outlined, and references are provided. You have everything you need to implement this library.

---

## Questions?

If unclear about anything:
- Check `docs/IMPLEMENTATION.md` for detailed algorithms
- Check `docs/COMPARISON.md` for Python comparison
- Check `../selfies-js-design.md` for API spec
- Look at Python code in `../selfies-py/selfies/`
- Read the TODO comments in the file you're working on
