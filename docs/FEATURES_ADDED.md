# Features Added from selfies-py Analysis

This document tracks features added to selfies-js based on comparison with selfies-py.

## Summary of Changes

After analyzing selfies-py v2.2.0, the following features were identified as missing and have been added to the boilerplate:

---

## New Files Created

### 1. `src/constraints.js` ⭐ NEW
**Purpose:** Semantic constraint management system (based on selfies-py's bond_constraints.py)

**Functions:**
- `getPresetConstraints(name)` - Get preset constraint sets
- `getSemanticConstraints()` - Get current constraints
- `setSemanticConstraints(constraints)` - Set custom constraints
- `getBondingCapacity(element, charge)` - Get max bonds for element
- `validateConstraints(constraints)` - Validate constraint object
- `wouldViolateConstraints(...)` - Check if bond would violate constraints
- `resetConstraints()` - Reset to default

**Presets:**
- `"default"` - Balanced constraints (C:4, N:3, O:2, etc.)
- `"octet_rule"` - Stricter constraints (TODO: fill in)
- `"hypervalent"` - More permissive (TODO: fill in)

**Reference:** selfies-py/selfies/bond_constraints.py

---

### 2. `src/constraints.test.js` ⭐ NEW
Unit tests for constraint system with TODOs for implementation.

---

### 3. `COMPARISON.md` ⭐ NEW
Comprehensive comparison document analyzing:
- Feature parity matrix
- Missing features with priorities
- Extra features in selfies-js
- Architecture differences
- Implementation recommendations
- API mapping between Python and JavaScript

---

## Functions Added to Existing Files

### `src/tokenizer.js`

#### `lenSelfies(selfies)` ⭐ NEW
**Purpose:** Count SELFIES symbols (not string length)

```javascript
lenSelfies('[C][C][O]')  // 3 (not 9!)
```

**Implementation:** Count '[' characters (much faster than full tokenization)

**Reference:** selfies-py/selfies/utils/selfies_utils.py::len_selfies()

---

### `src/alphabet.js`

#### `getAlphabetFromSelfies(selfiesIterable)` ⭐ NEW
**Purpose:** Extract unique symbols from a collection of SELFIES strings

```javascript
const alphabet = getAlphabetFromSelfies(['[C][C][O]', '[N][C][=O]'])
// Set { '[C]', '[O]', '[N]', '[=O]' }
```

**Use case:** ML applications needing to build vocabularies

**Reference:** selfies-py/selfies/utils/selfies_utils.py::get_alphabet_from_selfies()

---

## Updated Files

### `src/index.js`
**Added exports:**
- `lenSelfies` from tokenizer
- `getAlphabetFromSelfies` from alphabet
- `getPresetConstraints`, `getSemanticConstraints`, `setSemanticConstraints`, `getBondingCapacity`, `resetConstraints` from constraints

---

### `README.md`
**Updated to show:**
- New constraint API in overview example
- Updated features list with constraints and utilities
- Better categorization of features

---

## Priority Classification

### P0 (Critical - Already in Design)
- ✓ Core decode/encode
- ✓ Tokenization
- ✓ Validation
- ✓ Alphabet functions
- ✓ DSL system

### P1 (Important - Now Added)
- ✅ **Constraints system** - Semantic validation rules
- ✅ **lenSelfies()** - Symbol counting utility
- ✅ **getAlphabetFromSelfies()** - Alphabet extraction

### P2 (Nice to Have - Not Added Yet)
- [ ] Better error messages with positions
- [ ] Join function enhancement

### P3 (Post-MVP - Deferred)
- [ ] Chirality support
- [ ] Charged atoms
- [ ] Isotopes
- [ ] Aromatic SMILES
- [ ] Attribution tracking

---

## Implementation Status

### Completed ✅
- [x] Created constraints.js with full API surface
- [x] Created constraints.test.js with test cases
- [x] Added lenSelfies() to tokenizer.js
- [x] Added getAlphabetFromSelfies() to alphabet.js
- [x] Updated index.js exports
- [x] Updated README.md
- [x] Created COMPARISON.md documentation

### TODO (Implementation Needed) 🚧
All functions have TODO stubs with detailed algorithms. Need to implement:
- [ ] Constraint preset data (octet_rule, hypervalent)
- [ ] Constraint validation logic
- [ ] Constraint checking in parser (when parsing is implemented)
- [ ] lenSelfies() counting logic
- [ ] getAlphabetFromSelfies() extraction logic

---

## Key Insights from Python Analysis

### What Python Has That We Don't Need
1. **ML Utilities** - encoding_to_selfies, selfies_to_encoding, batch processing
   - Not relevant for VS Code extension use case
2. **Attribution Tracking** - Maps tokens to source positions
   - Post-MVP if needed
3. **Compatibility Layer** - For old SELFIES v1 symbols
   - New implementation, no legacy support needed

### What Python Has That We Added
1. **Constraints System** - Critical for semantic validation
2. **Symbol Counting** - Useful utility, easy to add
3. **Alphabet Extraction** - Helpful for users building vocabularies

### What We Have That Python Doesn't
1. **DSL System** - Named molecule definitions with resolution
2. **Molecular Properties** - Weight and formula calculation
3. **Syntax-only Validation** - Fast validation without full decode

---

## Design Differences

### Python: Object-Oriented
```python
class MolecularGraph:
    def add_atom(self, atom): ...
    def add_bond(self, bond): ...
    def kekulize(self): ...

graph = MolecularGraph()
graph.add_atom(Atom('C'))
```

### JavaScript: Functional
```javascript
const ir = {
  atoms: [{ element: 'C', ... }],
  bonds: [{ from: 0, to: 1, order: 1 }]
}

const updated = addAtom(ir, { element: 'C' })
```

**Rationale:** Simpler, more idiomatic JavaScript, easier to test

---

## Reference Links

All new code includes reference comments pointing back to selfies-py:

- `constraints.js` → `selfies-py/selfies/bond_constraints.py`
- `lenSelfies()` → `selfies-py/selfies/utils/selfies_utils.py::len_selfies()`
- `getAlphabetFromSelfies()` → `selfies-py/selfies/utils/selfies_utils.py::get_alphabet_from_selfies()`

---

## Next Steps

1. **Implement constraint presets** (octet_rule, hypervalent)
2. **Integrate constraints into parser** - Check bonds during parsing
3. **Implement lenSelfies()** - Simple character counting
4. **Implement getAlphabetFromSelfies()** - Set building from collection
5. **Add integration tests** - Test constraint system with decoder
6. **Document constraint system** - Add to design document

---

## Files Added Summary

```
New files (3):
├── src/constraints.js              # Semantic constraints
├── src/constraints.test.js         # Tests for constraints
└── COMPARISON.md                   # Python vs JS analysis

Modified files (4):
├── src/tokenizer.js               # + lenSelfies()
├── src/alphabet.js                # + getAlphabetFromSelfies()
├── src/index.js                   # + constraint exports
└── README.md                      # + constraint examples
```

Total new functions: **8** (1 constraint system + 2 utilities)
Total new files: **3**
Lines of boilerplate added: ~400
