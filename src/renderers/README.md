# SELFIES Renderers

This directory contains rendering modules for visualizing molecular structures from SELFIES AST (Abstract Syntax Tree) representations.

## SVG Renderer

The SVG renderer converts molecular AST structures into Scalable Vector Graphics (SVG) format for visualization.

### Usage

```javascript
import { decodeToAST, renderToSVG } from 'selfies-js'

// Decode SELFIES to AST
const ast = decodeToAST('[C][C][O]')

// Render to SVG
const svg = renderToSVG(ast)

// Save or use the SVG string
console.log(svg)
```

### Options

The `renderToSVG` function accepts an optional options object:

```javascript
const svg = renderToSVG(ast, {
  width: 400,              // Canvas width (default: 400)
  height: 300,             // Canvas height (default: 300)
  bondLength: 40,          // Length of bonds in pixels (default: 40)
  atomRadius: 15,          // Radius of atom circles (default: 15)
  fontSize: 14,            // Font size for atom labels (default: 14)
  strokeWidth: 2,          // Bond line thickness (default: 2)
  bondColor: '#333',       // Color of bonds (default: '#333')
  atomColor: '#000',       // Color of atom text (default: '#000')
  backgroundColor: 'transparent',  // Background color (default: 'transparent')
  padding: 40              // Padding around the molecule (default: 40)
})
```

### Features

- **Automatic Layout**: Molecules are automatically positioned using a simple layout algorithm
- **Bond Visualization**: Single, double, and triple bonds are rendered with appropriate styling
- **Element Colors**: Atoms are colored according to chemistry conventions:
  - Carbon (C): Gray
  - Nitrogen (N): Blue
  - Oxygen (O): Red
  - Sulfur (S): Yellow
  - Phosphorus (P): Orange
  - Halogens (F, Cl, Br, I): Various greens and purples
- **Ring Structures**: Properly handles ring closures
- **Stereo Chemistry**: Displays stereochemistry notation (e.g., C@, C@@)
- **Branching**: Correctly visualizes branched molecules

### Examples

```javascript
// Simple molecule
const methane = decodeToAST('[C]')
const svg1 = renderToSVG(methane)

// Molecule with double bond
const ethene = decodeToAST('[C][=C]')
const svg2 = renderToSVG(ethene)

// Branched molecule
const isobutane = decodeToAST('[C][C][Branch1][C][C][C]')
const svg3 = renderToSVG(isobutane)

// Ring structure
const cyclopropane = decodeToAST('[C][C][C][Ring1][C]')
const svg4 = renderToSVG(cyclopropane)

// Complex aromatic ring
const benzene = decodeToAST('[C][=C][C][=C][C][=C][Ring1][=Branch1]')
const svg5 = renderToSVG(benzene)
```

### Saving SVG Files

To save SVG output to files (Node.js):

```javascript
import { writeFileSync } from 'fs'
import { decodeToAST, renderToSVG } from 'selfies-js'

const ast = decodeToAST('[C][C][O]')
const svg = renderToSVG(ast)

writeFileSync('molecule.svg', svg)
```

### Browser Usage

In the browser, you can insert the SVG directly into the DOM:

```javascript
import { decodeToAST, renderToSVG } from 'selfies-js'

const ast = decodeToAST('[C][C][O]')
const svg = renderToSVG(ast)

// Insert into page
document.getElementById('molecule-container').innerHTML = svg
```

## Future Renderers

This directory is designed to accommodate additional renderers in the future:

- **Canvas Renderer**: For rendering to HTML5 Canvas
- **3D Renderer**: For three-dimensional molecular visualization
- **ASCII Renderer**: For text-based terminal visualization
- **WebGL Renderer**: For high-performance 3D rendering

## Architecture

All renderers follow a common pattern:

1. Accept an AST object with `atoms`, `bonds`, and `rings` arrays
2. Accept an optional configuration object
3. Return a string or data structure representing the visualization

This allows for consistent usage across different rendering backends.
