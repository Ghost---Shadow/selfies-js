# selfies-py vs selfies-js Comparison

This document compares the Python implementation (selfies-py v2.2.0) with the planned JavaScript implementation (selfies-js).

## Summary

**selfies-py scope:** Full-featured molecular representation library with ML utilities
**selfies-js scope (designed):** Core SELFIES + DSL for VS Code extension

---

## Feature Comparison Matrix

| Feature | selfies-py | selfies-js (designed) | Status | Priority |
|---------|------------|----------------------|--------|----------|
| **Core Features** |
| SELFIES → SMILES decode | ✓ | ✓ Planned | **CRITICAL** | P0 |
| SMILES → SELFIES encode | ✓ | ✓ Post-MVP | **IMPORTANT** | P1 |
| Tokenization (split_selfies) | ✓ | ✓ Planned | **CRITICAL** | P0 |
| Length counting (len_selfies) | ✓ | ✗ Missing | **NICE-TO-HAVE** | P2 |
| Validation (syntax only) | ✗ | ✓ Planned | **CRITICAL** | P0 |
| **Alphabet & Constraints** |
| Get alphabet | ✓ | ✓ Planned | **CRITICAL** | P0 |
| Semantic robust alphabet | ✓ | ✓ Planned | **IMPORTANT** | P1 |
| Semantic constraints (get) | ✓ | ✗ Missing | **IMPORTANT** | P1 |
| Semantic constraints (set) | ✓ | ✗ Missing | **IMPORTANT** | P1 |
| Preset constraints (3 types) | ✓ | ✗ Missing | **NICE-TO-HAVE** | P2 |
| **Properties** |
| Molecular weight | ✗ | ✓ Planned | **JS-SPECIFIC** | P0 |
| Molecular formula | ✗ | ✓ Planned | **JS-SPECIFIC** | P0 |
| **Advanced Chemistry** |
| Chirality support | ✓ | ✗ Missing | **POST-MVP** | P3 |
| Aromatic SMILES | ✓ | ✗ Missing | **POST-MVP** | P3 |
| Kekulization | ✓ | ✗ Missing | **POST-MVP** | P3 |
| Ring stereochemistry | ✓ | ✗ Missing | **POST-MVP** | P3 |
| Charged atoms | ✓ | ✗ Missing | **POST-MVP** | P3 |
| Isotopes | ✓ | ✗ Missing | **POST-MVP** | P3 |
| Attribution tracking | ✓ | ✗ Missing | **POST-MVP** | P3 |
| **ML Utilities** |
| selfies_to_encoding | ✓ | ✗ Missing | **NOT-NEEDED** | - |
| encoding_to_selfies | ✓ | ✗ Missing | **NOT-NEEDED** | - |
| batch_selfies_to_flat_hot | ✓ | ✗ Missing | **NOT-NEEDED** | - |
| batch_flat_hot_to_selfies | ✓ | ✗ Missing | **NOT-NEEDED** | - |
| get_alphabet_from_selfies | ✓ | ✗ Missing | **NICE-TO-HAVE** | P2 |
| **DSL (JS-specific)** |
| DSL parsing | ✗ | ✓ Planned | **JS-SPECIFIC** | P0 |
| DSL resolution | ✗ | ✓ Planned | **JS-SPECIFIC** | P0 |
| Dependency analysis | ✗ | ✓ Planned | **JS-SPECIFIC** | P0 |
| Cycle detection | ✗ | ✓ Planned | **JS-SPECIFIC** | P0 |
| **Internal Architecture** |
| Molecular graph class | ✓ | ✗ Missing | **DIFFERENT** | - |
| State machine decoder | ✓ | ✓ Planned | **CRITICAL** | P0 |
| Grammar rules module | ✓ | ✗ Missing | **DIFFERENT** | - |
| Compatibility layer | ✓ | ✗ Missing | **NOT-NEEDED** | - |

---

## Missing Features (Need to Add)

### High Priority (P1) - Should Add

1. **Semantic Constraints System**
   - `getSemanticConstraints()` - Get current constraints
   - `setSemanticConstraints(constraints)` - Set custom constraints
   - `getPresetConstraints(name)` - "default", "octet_rule", "hypervalent"
   - **Impact:** Allows users to control what's chemically valid
   - **Effort:** Medium (need constraint validation in parser)
   - **Location:** New file `src/constraints.js`

2. **len_selfies() Function**
   - Python: `len_selfies('[C][C][O]')` → 3 (not 9!)
   - Counts symbols, not characters
   - **Impact:** Useful utility for users
   - **Effort:** Low (count `[` characters)
   - **Location:** Add to `src/tokenizer.js`

3. **get_alphabet_from_selfies() Function**
   - Extract unique symbols from collection of SELFIES
   - Python: `get_alphabet_from_selfies(['[C][O]', '[N][C]'])` → `{'[C]', '[O]', '[N]'}`
   - **Impact:** Useful for ML applications
   - **Effort:** Low
   - **Location:** Add to `src/alphabet.js`

### Medium Priority (P2) - Nice to Have

4. **Join Function Enhancement**
   - Current: `join(tokens)` - simple concatenation
   - Could add validation or optimization

5. **Better Error Messages**
   - Python has detailed error messages with positions
   - Add line/column info to all errors

### Low Priority (P3) - Post-MVP

6. **Advanced Chemistry Features** (all post-MVP in design):
   - Chirality: `[C@]`, `[C@@]`
   - Charged atoms: `[C+1]`, `[O-1]`
   - Isotopes: `[13C]`, `[2H]`
   - Aromatic SMILES support
   - Ring stereochemistry: `[/-Ring1]`, `[\-Ring1]`
   - Attribution tracking

---

## Extra Features in selfies-js (Not in Python)

### Core Additions

1. **DSL for Named Molecules** ⭐
   - Entire DSL system for `.selfies` files
   - Parser, resolver, analyzer
   - Forward reference detection
   - Circular dependency detection
   - **Reason:** VS Code extension requirement

2. **Molecular Properties** ⭐
   - `getMolecularWeight()`
   - `getFormula()` (Hill notation)
   - **Reason:** Useful for chemistry users, not in Python version

3. **Syntax-only Validation**
   - `isValid()` function
   - Fast validation without full decoding
   - **Reason:** Real-time editor feedback

### Architecture Differences

4. **No Molecular Graph Class**
   - Python: Full `MolecularGraph`, `Atom`, `DirectedBond` classes
   - JavaScript: Lightweight IR (plain objects)
   - **Reason:** Different design philosophy (simpler, functional)

5. **No ML Utilities**
   - Python has full encoding/decoding for ML models
   - JavaScript doesn't need this (different use case)
   - **Reason:** Target audience difference

---

## Architecture Differences

### Python (selfies-py)
```
Object-Oriented:
- MolecularGraph class with methods
- Atom/DirectedBond dataclasses
- Global state for constraints
- Extensive caching (LRU decorators)
- Attribution system with metadata
```

### JavaScript (selfies-js - designed)
```
Functional:
- Plain object IR: { atoms: [...], bonds: [...] }
- Functions operating on data
- Constraints as parameters (no global state)
- Simpler caching strategy
- No attribution (post-MVP if needed)
```

### Key Differences

1. **Graph Representation:**
   - Python: Rich OOP with methods on graph/atom/bond objects
   - JS: Simple data structures with utility functions

2. **State Management:**
   - Python: Global constraint state via `set_semantic_constraints()`
   - JS: Pass constraints as parameters (more functional)

3. **Caching:**
   - Python: Extensive LRU caching on functions
   - JS: Simple memoization where needed

4. **Error Handling:**
   - Python: Custom exceptions with position tracking
   - JS: Custom error classes (similar, but lighter)

---

## Implementation Recommendations

### Phase 1: Core Parity (MVP)
Implement these to match basic Python functionality:

1. ✓ **Already planned:**
   - `decode()` - SELFIES → SMILES
   - `tokenize()` / `split_selfies()` equivalent
   - `getAlphabet()` / `get_semantic_robust_alphabet()`
   - Basic validation

2. **Add to MVP:**
   - `lenSelfies()` - symbol count (low effort, high value)
   - `getSemanticConstraints()` - expose constraint system
   - `setSemanticConstraints()` - allow custom constraints
   - `getPresetConstraints()` - "default", "octet_rule", "hypervalent"

### Phase 2: Encoder (Post-MVP)
Match Python's encoding capability:

1. `encode()` - SMILES → SELFIES
2. Basic aromatic handling (kekulization)
3. Preserve atom order like Python

### Phase 3: Advanced Chemistry (Future)
Add if users need it:

1. Chirality support
2. Charged atoms
3. Isotopes
4. Ring stereochemistry
5. Attribution tracking

---

## Files to Add

Based on Python structure, these files should be added:

### Immediate (P1)
```
src/
├── constraints.js          # NEW: Semantic constraints management
│   ├── getSemanticConstraints()
│   ├── setSemanticConstraints()
│   ├── getPresetConstraints()
│   └── validateConstraints()
└── tokenizer.js
    └── lenSelfies()        # ADD: Symbol counting function
```

### Near-term (P2)
```
src/
├── alphabet.js
│   └── getAlphabetFromSelfies()  # ADD: Extract alphabet from collection
└── utils.js                # NEW: Utility functions
    ├── join()              # MOVE from tokenizer
    └── other helpers
```

### Future (P3)
```
src/
├── attribution.js          # NEW: Attribution tracking (if needed)
└── advanced/               # NEW: Advanced chemistry features
    ├── chirality.js
    ├── aromatic.js
    ├── kekulize.js
    └── stereochemistry.js
```

---

## API Mapping

Python → JavaScript naming conventions:

| Python | JavaScript | Notes |
|--------|------------|-------|
| `encoder()` | `encode()` | ✓ Matches design |
| `decoder()` | `decode()` | ✓ Matches design |
| `split_selfies()` | `tokenize()` | ✓ Better JS convention |
| `len_selfies()` | `lenSelfies()` | **ADD THIS** |
| `get_alphabet_from_selfies()` | `getAlphabetFromSelfies()` | **ADD THIS** |
| `get_semantic_robust_alphabet()` | `getSemanticAlphabet()` | ✓ Matches design |
| `get_semantic_constraints()` | `getSemanticConstraints()` | **ADD THIS** |
| `set_semantic_constraints()` | `setSemanticConstraints()` | **ADD THIS** |
| `get_preset_constraints()` | `getPresetConstraints()` | **ADD THIS** |
| `selfies_to_encoding()` | N/A | Not needed for JS use case |
| `encoding_to_selfies()` | N/A | Not needed for JS use case |

---

## Token/Symbol Coverage

### Supported in Both
- Basic atoms: `[C]`, `[N]`, `[O]`, `[S]`, `[P]`, `[F]`, `[Cl]`, `[Br]`, `[I]`, `[B]`
- Bond modifiers: `[=C]`, `[#N]`, etc.
- Branches: `[Branch1]`, `[Branch2]`, `[Branch3]`
- Rings: `[Ring1]`, `[Ring2]`, `[Ring3]`

### Python Only (Post-MVP for JS)
- Charged: `[C+1]`, `[O-1]`, `[N+1]`
- Isotopes: `[13C]`, `[2H]`
- Chirality: `[C@]`, `[C@@]`
- Stereo bonds: `[/C]`, `[\C]`
- Ring stereo: `[/-Ring1]`, `[\-Ring1]`
- Fragment separator: `.`
- Special: `[nop]`, `[epsilon]`

### JavaScript Extensions
- DSL references: `[methyl]`, `[ethyl]` (in `.selfies` files)

---

## Recommendations Summary

### Must Add (P1):
1. **Constraints system** - Critical for semantic validation
   - Files: `src/constraints.js`
   - Functions: `getSemanticConstraints()`, `setSemanticConstraints()`, `getPresetConstraints()`
   - Presets: "default", "octet_rule", "hypervalent"

2. **Symbol counting** - Simple utility, high value
   - Add to: `src/tokenizer.js`
   - Function: `lenSelfies(selfies)` → count symbols, not characters

3. **Alphabet extraction** - Useful utility
   - Add to: `src/alphabet.js`
   - Function: `getAlphabetFromSelfies(selfiesArray)` → Set of unique symbols

### Should Add (P2):
4. Better error messages with position info
5. More comprehensive validation messages

### Can Defer (P3):
6. All advanced chemistry features (chirality, charges, isotopes)
7. Attribution tracking
8. Aromatic SMILES support

### Don't Add:
- ML encoding utilities (not relevant for JS use case)
- Compatibility layer (new implementation, no legacy)
- Python-specific implementation details

---

## Next Steps

1. **Update design document** to include constraints system
2. **Create `src/constraints.js`** with constraint management
3. **Add `lenSelfies()`** to tokenizer
4. **Add `getAlphabetFromSelfies()`** to alphabet
5. **Update index.js** to export new functions
6. **Add tests** for constraint functionality
7. **Update IMPLEMENTATION.md** with constraints phase

