# Test Directory

This directory contains integration tests, known issues, and test fixtures.

## Directory Structure

```
test/
├── integration.test.js      # Integration tests across modules
├── known-issues.test.js     # Known bugs and edge cases
└── fixtures/
    ├── molecules.json       # Test data for common molecules
    └── programs/            # DSL test programs
        ├── simple.selfies
        ├── forward-ref.selfies
        └── cycle.selfies
```

## Test Organization

### Unit Tests
Unit tests are located **alongside their source files**:
- `src/tokenizer.test.js` - Tests for tokenizer
- `src/decoder.test.js` - Tests for decoder
- `src/validator.test.js` - Tests for validator
- `src/alphabet.test.js` - Tests for alphabet
- `src/properties/properties.test.js` - Tests for property calculations
- `src/dsl/dsl.test.js` - Tests for DSL parsing and resolution

### Integration Tests (This Directory)
- **integration.test.js** - Tests that span multiple modules
  - Full decode workflows
  - Property calculation workflows
  - DSL parsing → resolution → decode chains
  - Round-trip tests (encode → decode)

### Known Issues (This Directory)
- **known-issues.test.js** - Edge cases and known bugs
  - Performance regression tests
  - Valence edge cases
  - Very long/complex molecules
  - Known bugs marked with `.skip` until fixed

## Fixtures

### molecules.json
Contains test data for 9 common molecules with:
- SELFIES representation
- SMILES representation
- Molecular formula
- Molecular weight

Used by integration tests and can be imported by unit tests.

### programs/
Contains DSL test programs:
- **simple.selfies** - Basic definitions with no dependencies
- **forward-ref.selfies** - Forward reference (should warn/error)
- **cycle.selfies** - Circular dependencies (should error)

## Running Tests

```bash
# Run all tests (unit + integration)
bun test

# Run only integration tests
bun test test/integration.test.js

# Run only a specific unit test
bun test src/tokenizer.test.js

# Watch mode
bun test --watch
```

## Adding New Tests

- **Unit tests**: Add alongside the source file you're testing
- **Integration tests**: Add to `integration.test.js`
- **Known issues**: Add to `known-issues.test.js` (mark with `.skip` if unfixed)
- **Test data**: Add to `fixtures/molecules.json` or create new fixture files
