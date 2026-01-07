# Chemistry Validation in selfies-js

## Overview

selfies-js now includes comprehensive **chemistry validation** using RDKit to verify that decoded SELFIES strings produce chemically valid molecules. This addresses a critical gap identified in the audit - the library was algorithmically correct but never validated chemistry correctness.

## New Features

### 1. Chemistry Validation API

Five new functions exposed in the public API:

```javascript
import {
  isChemicallyValid,
  getCanonicalSmiles,
  validateRoundtrip,
  getValidationDetails,
  batchValidate
} from 'selfies-js'
```

### API Reference

#### `isChemicallyValid(selfies)`

Checks if a SELFIES string decodes to a chemically valid molecule.

```javascript
await isChemicallyValid('[C][C][O]') // => true (ethanol)
await isChemicallyValid('[C][=C][=C][=C]') // => true (state machine limits bonds)
await isChemicallyValid('') // => false (empty)
```

**Returns**: `Promise<boolean>`

Uses RDKit's `is_valid()` to check:
- Proper valence satisfaction
- Valid bonding patterns
- Chemically feasible structures

---

#### `getCanonicalSmiles(selfies)`

Gets the canonical SMILES representation for proper molecular comparison.

```javascript
await getCanonicalSmiles('[C][C][O]') // => 'CCO'
await getCanonicalSmiles('[C][=C][C][=C][C][=C][Ring1][=Branch1]') // => 'c1ccccc1'
```

**Returns**: `Promise<string|null>` - Canonical SMILES or null if invalid

**Why it matters**: Different SELFIES can represent the same molecule. Canonical SMILES allows proper comparison:
- `'c1ccccc1'` and `'C1=CC=CC=C1'` both canonicalize to `'c1ccccc1'` (benzene)

---

####Human: continue