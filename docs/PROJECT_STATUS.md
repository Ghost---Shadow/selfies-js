# Project Status

## Overview

The selfies-js repository has been initialized with complete boilerplate structure. All files contain TODO comments marking where implementation is needed.

## Repository Structure

```
selfies-js/
├── package.json              ✓ Complete
├── bunfig.toml              ✓ Complete
├── README.md                ✓ Complete
├── LICENSE                  ✓ Complete (MIT)
├── .gitignore               ✓ Complete
├── IMPLEMENTATION.md        ✓ Complete (implementation guide)
├── PROJECT_STATUS.md        ✓ This file
│
├── src/
│   ├── index.js             ✓ API exports defined, TODO: verify after implementation
│   ├── tokenizer.js         TODO: Implement tokenization logic
│   ├── tokenizer.test.js    ✓ Unit tests outlined with TODOs
│   ├── parser.js            TODO: Implement SELFIES parsing to IR
│   ├── decoder.js           TODO: Implement SELFIES → SMILES conversion
│   ├── decoder.test.js      ✓ Unit tests outlined with TODOs
│   ├── encoder.js           TODO: POST-MVP (SMILES → SELFIES)
│   ├── encoder.test.js      ✓ Unit tests outlined (skipped for post-MVP)
│   ├── validator.js         TODO: Implement validation logic
│   ├── validator.test.js    ✓ Unit tests outlined with TODOs
│   ├── alphabet.js          TODO: Fill in token sets
│   ├── alphabet.test.js     ✓ Unit tests outlined with TODOs
│   ├── errors.js            ✓ Error classes defined, expand as needed
│   │
│   ├── dsl/
│   │   ├── lexer.js         TODO: Implement DSL tokenization
│   │   ├── parser.js        TODO: Implement DSL parsing
│   │   ├── symbolTable.js   TODO: Implement symbol table operations
│   │   ├── resolver.js      TODO: Implement reference resolution
│   │   ├── analyzer.js      TODO: Implement static analysis
│   │   └── dsl.test.js      ✓ Unit tests outlined with TODOs
│   │
│   └── properties/
│       ├── atoms.js         TODO: Fill in atomic data tables
│       ├── molecularWeight.js TODO: Implement MW calculation
│       ├── formula.js       TODO: Implement formula generation
│       └── properties.test.js ✓ Unit tests outlined with TODOs
│
├── test/
│   ├── integration.test.js  ✓ Integration tests outlined with TODOs
│   ├── known-issues.test.js ✓ Known bugs/edge cases placeholder
│   │
│   └── fixtures/
│       ├── molecules.json   ✓ Test data for 9 molecules
│       └── programs/
│           ├── simple.selfies      ✓ Basic DSL test case
│           ├── forward-ref.selfies ✓ Forward reference test
│           └── cycle.selfies       ✓ Circular dependency test
│
└── bench/
    └── decode.bench.js      ✓ Benchmark skeleton, TODO: implement when decoder ready
```

## Implementation Status

### Complete
- [x] Directory structure
- [x] package.json with scripts
- [x] Bun configuration
- [x] README with overview
- [x] MIT License
- [x] .gitignore
- [x] Error class definitions
- [x] Test file structure with test cases outlined
- [x] Test fixtures (molecules.json, DSL programs)
- [x] Benchmark skeleton
- [x] Public API exports (src/index.js)
- [x] Implementation guide (IMPLEMENTATION.md)

### TODO: Core Implementation

#### Phase 1: Foundation
- [ ] Fill in atomic data (src/properties/atoms.js)
- [ ] Define SELFIES alphabet (src/alphabet.js)

#### Phase 2: Core SELFIES
- [ ] Implement tokenizer (src/tokenizer.js)
- [ ] Implement parser to IR (src/parser.js)
- [ ] Implement validator (src/validator.js)
- [ ] Implement decoder (src/decoder.js)

#### Phase 3: Properties
- [ ] Implement molecular weight calculation (src/properties/molecularWeight.js)
- [ ] Implement formula generation (src/properties/formula.js)

#### Phase 4: DSL
- [ ] Implement DSL lexer (src/dsl/lexer.js)
- [ ] Implement symbol table (src/dsl/symbolTable.js)
- [ ] Implement DSL parser (src/dsl/parser.js)
- [ ] Implement analyzer (src/dsl/analyzer.js)
- [ ] Implement resolver (src/dsl/resolver.js)

#### Phase 5: Post-MVP
- [ ] Implement encoder (src/encoder.js)
- [ ] Add stereochemistry support
- [ ] Add charges, isotopes, radicals

## Quick Start Commands

```bash
# Run tests (will fail until implementation is complete)
bun test

# Run benchmarks (will show "not implemented" message)
bun run bench

# Install dependencies (none yet, but command ready)
bun install
```

## Design Document

See `../selfies-js-design.md` for full API specification and design details.

## Next Steps

1. Read IMPLEMENTATION.md for detailed implementation guidance
2. Start with Phase 1 (Foundation)
3. Implement modules in order listed above
4. Write tests as you implement each module
5. Run `bun test` frequently to verify progress

## Test Organization

The test suite is organized as follows:

- **Unit tests**: Located alongside source files (e.g., `tokenizer.test.js` next to `tokenizer.js`)
- **Integration tests**: Located in `test/integration.test.js` - tests full workflows across modules
- **Known issues**: Located in `test/known-issues.test.js` - edge cases and known bugs
- **Fixtures**: Located in `test/fixtures/` - test data for molecules and DSL programs

Run all tests with `bun test` - Bun will automatically discover all `*.test.js` files.

## Notes

- All source files have comprehensive TODO comments explaining what needs to be implemented
- Test files have test cases outlined but commented out with TODOs
- Follow the implementation order in IMPLEMENTATION.md to handle dependencies correctly
- Encoder (SMILES → SELFIES) is explicitly marked as post-MVP
- Performance targets are documented in IMPLEMENTATION.md
- Unit tests live alongside their source files for easy navigation

## Git Repository

This will be published to: `git@github.com:Ghost---Shadow/selfies-js.git`
