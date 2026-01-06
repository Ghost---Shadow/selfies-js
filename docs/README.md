# Project Documentation

This directory contains documentation used during project setup and development. **You can safely delete this entire `docs/` folder once implementation is complete.**

## Files in This Directory

### Implementation Guides

- **IMPLEMENTATION.md** - Detailed implementation guide
  - Recommended implementation order (Phase 1-5)
  - Key implementation notes for each module
  - Testing strategy and workflow
  - Performance targets
  - Common patterns and examples

- **PROJECT_STATUS.md** - Current project status and structure
  - Complete file tree with status markers
  - Implementation checklist by phase
  - Quick start commands
  - Test organization details

### Analysis & Comparison

- **COMPARISON.md** - selfies-py vs selfies-js comparison
  - Feature parity matrix with priorities
  - Missing features analysis
  - Extra features in selfies-js
  - Architecture differences
  - API mapping between Python and JavaScript
  - Recommendations for what to add/skip

- **FEATURES_ADDED.md** - Change tracking document
  - Features added from Python analysis
  - New files created
  - Functions added to existing files
  - Priority classification
  - Implementation status

### Testing

- **TEST_ORGANIZATION.md** - Test suite organization
  - Unit test structure (alongside source)
  - Integration test structure (test/ directory)
  - Fixtures explanation
  - Running tests guide

## When to Delete This Folder

Delete `docs/` when:
- ✅ All TODO stubs are implemented
- ✅ Tests are passing
- ✅ Project is ready for production use
- ✅ You no longer need the implementation guides

## What to Keep

Keep these files in the project root:
- `README.md` - User-facing documentation
- `LICENSE` - MIT license
- `package.json` - NPM configuration
- `bunfig.toml` - Bun configuration

## Relationship to Design Document

The original design document is at:
```
../selfies-js-design.md
```

This is the canonical API specification. The documents in this folder are implementation aids based on that design.

---

**Note:** This folder exists solely for development/setup convenience. It is not part of the published NPM package.
