<div align="center">
  <img src="toluene-logo.svg" alt="Toluene molecule" width="200"/>
  <h1>selfies-js</h1>
  <p>A pure JavaScript implementation of the SELFIES molecular string representation</p>
</div>

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

// SVG Rendering (using RDKit.js)
import { renderSelfies, initRDKit } from 'selfies-js'

await initRDKit() // Initialize once
const svg = await renderSelfies('[C][C][O]', {
  width: 300,
  height: 300
})
```

## Installation

```bash
npm install selfies-js
```

## Features

- **Core:** Decode SELFIES to SMILES
- **Core:** Encode SMILES to SELFIES
- **Validation:** Syntax and semantic validation
- **Properties:** Molecular weight and formula calculation
- **Constraints:** Customizable semantic constraints (bonding rules)
- **Utilities:** Symbol counting, alphabet extraction
- **DSL:** Define and resolve molecule libraries with named definitions
- **Rendering:** SVG visualization of molecular structures

## Visualization

The library uses **RDKit.js** for professional molecule rendering:

```javascript
import { renderSelfies, initRDKit } from 'selfies-js'

// Initialize RDKit (async, only needed once)
await initRDKit()

// Render toluene
const svg = await renderSelfies('[C][C][=C][C][=C][C][=C][Ring1][=N]', {
  width: 300,
  height: 300
})
```

Features:
- Professional 2D coordinate generation via RDKit
- Proper skeletal formulas (carbons hidden)
- Correct benzene ring geometry
- Support for all bond types
- Stereochemistry notation
- Industry-standard rendering

## Status

🚧 **Work in Progress** - This library is currently under development.

See the design document for full API documentation and implementation details.

## License

MIT
