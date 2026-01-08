# SELFIES-JS Playground

This is the GitHub Pages site for [selfies-js](https://github.com/Ghost---Shadow/selfies-js) - a pure JavaScript implementation of the SELFIES molecular string representation.

## Features

- **Live Editor** with syntax highlighting
- **Real-time conversion** between SELFIES and SMILES
- **Molecular properties** calculation (formula, molecular weight)
- **Interactive testing** of the minified bundle
- **Comprehensive test suite** with 20+ tests

## Try it live

Visit [https://ghost---shadow.github.io/selfies-js/](https://ghost---shadow.github.io/selfies-js/)

## What is SELFIES?

**SELFIES** (SELF-referencIng Embedded Strings) is a 100% robust molecular string representation. Unlike SMILES, every SELFIES string corresponds to a valid molecule, making it ideal for machine learning and generative models in chemistry.

## Usage

The playground demonstrates:
- SELFIES → SMILES decoding
- SMILES → SELFIES encoding
- Molecular formula generation
- Molecular weight calculation
- Syntax validation

## Bundle

This page uses a self-hosted bundle located at `./dist/selfies.umd.min.js` to avoid CORS issues.

The bundle is also available from GitHub releases (once v0.1.0 is published):
```
https://github.com/Ghost---Shadow/selfies-js/releases/latest/download/selfies.umd.min.js
```

## License

MIT - See [LICENSE](https://github.com/Ghost---Shadow/selfies-js/blob/main/LICENSE)
