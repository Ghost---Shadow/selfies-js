# Changelog

All notable changes to the `selfies-js` package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.4] - 2026-01-10

### Changed
- **Improved repeat macro syntax** - Removed quote requirement for cleaner DSL
  - Old syntax: `repeat('[C][=C]', 3)` ❌
  - New syntax: `repeat([C][=C], 3)` ✅
  - Updated all test fixtures to use quote-free syntax
  - Updated README.md with new syntax examples
  - Fixed VSCode syntax highlighter to recognize repeat macro

### Fixed
- **Analyzer dependency tracking** - Fixed `getDependencies()` to handle REPEAT_CALL token objects

## [0.3.3] - 2026-01-10

### Added
- **`repeat()` macro for DSL** - New macro for repeating molecular patterns
  - Syntax: `repeat([C][=C], 3)` - repeats a SELFIES pattern N times
  - Example: `[benzene] = repeat([C][=C], 3)[Ring1][=Branch1]`
  - Supports references to other definitions within patterns
  - Can be combined with regular tokens: `[molecule] = [N]repeat('[C]', 3)[O]`
  - Multiple repeat calls in single definition supported
  - Comprehensive error handling for invalid syntax and arguments
- **12 new tests** for repeat macro functionality in `src/dsl/resolver.test.js`
  - Simple and complex patterns
  - Reference resolution in patterns
  - Polymer chain examples
  - Edge cases and error validation

### Changed
- **Lexer** (`src/dsl/lexer.js`):
  - Added token types: `REPEAT`, `LPAREN`, `RPAREN`, `NUMBER`
  - Added support for single-quoted strings
  - Added support for negative numbers
- **Parser** (`src/dsl/parser.js`):
  - New `parseRepeatCall()` function to parse repeat syntax
  - Added `skipToRParenOrEOL()` helper for error recovery
  - Updated definition parsing to handle repeat calls
- **Resolver** (`src/dsl/resolver.js`):
  - New `expandRepeat()` function to expand repeat calls
  - New `tokenizePattern()` to parse pattern strings
  - Added validation for empty definitions

## [0.2.0] - 2026-01-09

### Fixed
- **Line number preservation in import processing** - Fixed critical bug where import statements and comments at the top of files caused line number misalignment between source files and parsed AST
  - `parseImports()` now replaces import lines with blank lines instead of removing them entirely
  - This ensures line numbers in the parsed definitions match the original source file
  - Fixes VSCode extension issue where cursor position didn't match the displayed molecule

### Added
- **7 new tests for line number preservation** in `test/importer.test.js`
  - Tests for comments at top of file
  - Tests for import statements
  - Tests for multiple imports and comments
  - Edge cases (file starting with import, consecutive imports)
  - VSCode extension-specific use case test

### Changed
- Improved `parseImports()` implementation in `src/dsl/importer.js` to preserve line numbers

## [0.1.3] - 2026-01-08

### Added
- Initial release with SELFIES encoding/decoding
- DSL parser for molecular composition
- Import system for reusable fragments
- Chemistry validation with RDKit.js
- Molecular properties (weight, formula)
- SVG rendering support
- CLI tool
- 552 tests

[0.3.3]: https://github.com/Ghost---Shadow/selfies-js/compare/v0.2.0...v0.3.3
[0.2.0]: https://github.com/Ghost---Shadow/selfies-js/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/Ghost---Shadow/selfies-js/releases/tag/v0.1.3
