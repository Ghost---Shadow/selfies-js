# Changelog

All notable changes to the `selfies-js` package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.2.0]: https://github.com/Ghost---Shadow/selfies-js/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/Ghost---Shadow/selfies-js/releases/tag/v0.1.3
