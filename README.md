# selfies-js

A pure JavaScript implementation of the SELFIES molecular string representation.

## Overview

```javascript
import {
  decode, encode, isValid,
  getMolecularWeight, getFormula,
  lenSelfies, getSemanticConstraints
} from 'selfies-js'

// SELFIES → SMILES
decode('[C][C][O]')  // 'CCO'

// SMILES → SELFIES
encode('CCO')  // '[C][C][O]'

// Validation
isValid('[C][C][O]')  // true

// Properties
getMolecularWeight('[C][C][O]')  // 46.07
getFormula('[C][C][O]')  // 'C2H6O'

// Utilities
lenSelfies('[C][C][O]')  // 3 (symbol count, not string length)

// Semantic constraints
const constraints = getSemanticConstraints()
console.log(constraints['C'])  // 4 (max bonds for carbon)
```

## Installation

```bash
npm install selfies-js
```

## Features

- **Core:** Decode SELFIES to SMILES
- **Core:** Encode SMILES to SELFIES (coming soon)
- **Validation:** Syntax and semantic validation
- **Properties:** Molecular weight and formula calculation
- **Constraints:** Customizable semantic constraints (bonding rules)
- **Utilities:** Symbol counting, alphabet extraction
- **DSL:** Define and resolve molecule libraries with named definitions

## Status

🚧 **Work in Progress** - This library is currently under development.

See the design document for full API documentation and implementation details.

## License

MIT
