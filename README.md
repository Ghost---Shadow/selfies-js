# selfies-js

A pure JavaScript implementation of the SELFIES molecular string representation.

## Overview

```javascript
import { decode, encode, isValid, getMolecularWeight, getFormula } from 'selfies-js'

// SELFIES → SMILES
decode('[C][C][O]')  // 'CCO'

// SMILES → SELFIES
encode('CCO')  // '[C][C][O]'

// Validation
isValid('[C][C][O]')  // true

// Properties
getMolecularWeight('[C][C][O]')  // 46.07
getFormula('[C][C][O]')  // 'C2H6O'
```

## Installation

```bash
npm install selfies-js
```

## Features

- Decode SELFIES to SMILES
- Encode SMILES to SELFIES (coming soon)
- Validate SELFIES syntax
- Calculate molecular weight
- Generate molecular formula
- DSL for defining molecule libraries

## Status

🚧 **Work in Progress** - This library is currently under development.

See the design document for full API documentation and implementation details.

## License

MIT
