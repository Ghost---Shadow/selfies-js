#!/usr/bin/env node
/**
 * CLI - Command-line interface for executing .selfies files
 *
 * Usage:
 *   selfies-js run <file.selfies> [options]
 *   selfies-js validate <file.selfies>
 *   selfies-js list <file.selfies>
 */

import { loadFile } from './dsl/importer.js'
import { resolve, resolveAll } from './dsl/resolver.js'
import { decode } from './decoder.js'
import { readFileSync } from 'fs'

const COMMANDS = {
  run: runCommand,
  validate: validateCommand,
  list: listCommand,
  help: helpCommand
}

/**
 * Main CLI entry point
 */
function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    helpCommand()
    process.exit(0)
  }

  const command = args[0]
  const commandFn = COMMANDS[command]

  if (!commandFn) {
    console.error(`Unknown command: ${command}`)
    console.error('Run "selfies-js help" for usage information')
    process.exit(1)
  }

  try {
    commandFn(args.slice(1))
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

/**
 * Run command - executes a .selfies file and outputs resolved molecules
 */
function runCommand(args) {
  if (args.length === 0) {
    console.error('Usage: selfies-js run <file.selfies> [options]')
    process.exit(1)
  }

  const filePath = args[0]
  const options = parseOptions(args.slice(1))

  // Load the file with imports
  const program = loadFile(filePath)

  // Check for errors
  if (program.errors.length > 0) {
    console.error('Compilation errors:')
    for (const error of program.errors) {
      console.error(`  ${error.message}`)
    }
    process.exit(1)
  }

  // Resolve all definitions
  const resolved = resolveAll(program, { validateValence: !options.noValidate })

  // Output results
  if (options.format === 'smiles') {
    for (const [name, selfies] of Object.entries(resolved)) {
      try {
        const smiles = decode(selfies)
        console.log(`${name}: ${smiles}`)
      } catch (error) {
        console.error(`${name}: Error - ${error.message}`)
      }
    }
  } else {
    for (const [name, selfies] of Object.entries(resolved)) {
      console.log(`${name}: ${selfies}`)
    }
  }
}

/**
 * Validate command - checks a .selfies file for errors
 */
function validateCommand(args) {
  if (args.length === 0) {
    console.error('Usage: selfies-js validate <file.selfies>')
    process.exit(1)
  }

  const filePath = args[0]
  const program = loadFile(filePath)

  // Check for parse errors
  if (program.errors.length > 0) {
    console.log('Validation failed with errors:')
    for (const error of program.errors) {
      console.log(`  Line ${error.line}: ${error.message}`)
    }
    process.exit(1)
  }

  // Check for warnings
  if (program.warnings && program.warnings.length > 0) {
    console.log('Warnings:')
    for (const warning of program.warnings) {
      console.log(`  Line ${warning.line}: ${warning.message}`)
    }
  }

  // Try to resolve all definitions
  try {
    resolveAll(program)
    console.log(`✓ File is valid (${program.definitions.size} definitions)`)
  } catch (error) {
    console.log(`Validation failed: ${error.message}`)
    process.exit(1)
  }
}

/**
 * List command - lists all definitions in a .selfies file
 */
function listCommand(args) {
  if (args.length === 0) {
    console.error('Usage: selfies-js list <file.selfies>')
    process.exit(1)
  }

  const filePath = args[0]
  const program = loadFile(filePath)

  console.log(`Definitions in ${filePath}:`)
  for (const [name, definition] of program.definitions) {
    const tokens = definition.tokens.join('')
    console.log(`  [${name}] = ${tokens}`)
  }
}

/**
 * Help command - displays usage information
 */
function helpCommand() {
  console.log(`
selfies-js - CLI for SELFIES DSL

Usage:
  selfies-js run <file.selfies> [options]       Execute a .selfies file
  selfies-js validate <file.selfies>            Validate a .selfies file
  selfies-js list <file.selfies>                List definitions in a file
  selfies-js help                               Show this help message

Run command options:
  --format=smiles                               Output as SMILES instead of SELFIES
  --no-validate                                 Skip valence validation

Examples:
  selfies-js run molecules.selfies
  selfies-js run molecules.selfies --format=smiles
  selfies-js validate molecules.selfies
  selfies-js list molecules.selfies
`)
}

/**
 * Parses command-line options
 */
function parseOptions(args) {
  const options = {
    format: 'selfies',
    noValidate: false
  }

  for (const arg of args) {
    if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1]
    } else if (arg === '--no-validate') {
      options.noValidate = true
    }
  }

  return options
}

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main }
