/**
 * Benchmarks for SELFIES decoding performance
 */

import { decode } from '../src/decoder.js'
import { tokenize } from '../src/tokenizer.js'

// TODO: Implement benchmarks
// Target performance (from design doc):
// - Tokenize (50 tokens): < 0.1ms
// - Decode (50 tokens): < 1ms
// - Overall: < 16ms for real-time editor feedback (60fps)

function benchmark(name, fn, iterations = 1000) {
  console.log(`\nBenchmarking: ${name}`)

  // Warmup
  for (let i = 0; i < 10; i++) {
    fn()
  }

  // Measure
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  const end = performance.now()

  const totalTime = end - start
  const avgTime = totalTime / iterations

  console.log(`  Total: ${totalTime.toFixed(2)}ms`)
  console.log(`  Average: ${avgTime.toFixed(4)}ms`)
  console.log(`  Ops/sec: ${(1000 / avgTime).toFixed(0)}`)

  return avgTime
}

// TODO: Benchmark tokenization
function benchmarkTokenize() {
  // Small molecule (ethanol)
  // benchmark('Tokenize small (3 tokens)', () => {
  //   tokenize('[C][C][O]')
  // })

  // Medium molecule (~10 tokens)
  // benchmark('Tokenize medium (10 tokens)', () => {
  //   tokenize('[C][C][Branch1][C][C][C][O]')
  // })

  // Large molecule (~50 tokens - target benchmark)
  // TODO: Create 50-token test case
}

// TODO: Benchmark decoding
function benchmarkDecode() {
  // Small molecule
  // benchmark('Decode small (3 tokens)', () => {
  //   decode('[C][C][O]')
  // })

  // Medium molecule
  // benchmark('Decode medium (10 tokens)', () => {
  //   decode('[C][C][Branch1][C][C][C][O]')
  // })

  // Large molecule
  // TODO: Create and benchmark 50-token decode
}

// TODO: Run benchmarks
function main() {
  console.log('=== SELFIES Performance Benchmarks ===')
  console.log('\nNOTE: Benchmarks not yet implemented')
  console.log('Implementation needed in:')
  console.log('  - tokenizer.js')
  console.log('  - decoder.js')
  console.log('\nTarget performance:')
  console.log('  - Tokenize (50 tokens): < 0.1ms')
  console.log('  - Decode (50 tokens): < 1ms')
  console.log('  - Total per keystroke: < 16ms (for 60fps)')

  // TODO: Uncomment when implementation is ready
  // benchmarkTokenize()
  // benchmarkDecode()
}

main()
