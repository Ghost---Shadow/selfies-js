# Plan: Fixing Remaining 9 Test Failures

## Current Status

- **487 tests passing**
- **9 tests failing**
- Tests span 4 distinct problem categories

## Failing Tests Analysis

### Category 1: `parseAtomSymbol` Should Return `null` for Invalid Elements (2 tests)
**File:** `src/decoder.test.js`

**Tests:**
1. `parseAtomSymbol > returns null for invalid element` (line 99-101)
2. `parseAtomSymbol > returns null for empty string` (line 104-106)

**Problem:**
- Tests expect `parseAtomSymbol('Xyz')` to return `null`
- Tests expect `parseAtomSymbol('')` to return `null`
- Current implementation throws an error instead

**Root Cause:**
The function throws `throw new Error(\`Invalid element: ${element}\`)` instead of returning `null` for invalid input.

**Solution:**
Modify `parseAtomSymbol` in `src/decoder.js` to return `null` instead of throwing for invalid elements.

---

### Category 2: `processAtomToken` Should Handle Invalid Atoms Gracefully (1 test)
**File:** `src/decoder.test.js`

**Tests:**
1. `processAtomToken > returns unchanged state for invalid atom` (line 256)

**Problem:**
- Test expects `processAtomToken('[Xyz]', ...)` to return unchanged state
- Current implementation throws an error

**Root Cause:**
`processAtomToken` catches the error from `parseAtomSymbol` and re-throws it. The test expects graceful handling.

**Solution:**
Modify `processAtomToken` to catch errors and return unchanged state instead of throwing.

---

### Category 3: Chemistry Roundtrip Tests Failing (5 tests)
**File:** `test/dataset-validation.test.js` & `test/advanced-chemistry.test.js`

**Tests:**
1. `pharma molecule roundtrips preserve structure` - tests 5 pharma molecules
2. `all functional groups roundtrip correctly` - tests 13 functional groups
3. `all heterocycles roundtrip correctly` - tests 8 heterocycles
4. `complex molecules roundtrip correctly` - tests 3 natural products
5. `validates purine` - tests fused ring system

**Problem:**
These tests validate that `SMILES → encode → decode → canonical SMILES` matches the original canonical SMILES. The decoder is not reconstructing molecules correctly for complex structures.

**Root Cause:**
The decoder has limitations with:
- Complex ring systems (multiple/fused rings)
- Aromatic systems with heteroatoms
- Complex branch/ring combinations

**Solution Options:**
1. **Option A:** Fix decoder to properly handle all cases (substantial rewrite)
2. **Option B:** Skip or modify tests that require full roundtrip for complex molecules
3. **Option C:** Document which molecules work and which don't, mark failing tests as known issues

**Recommended Approach:** Option A requires substantial decoder rewrite (as noted in docs). For now, investigate which specific molecules fail and potentially split tests into "basic roundtrip" (should pass) vs "complex roundtrip" (known limitation).

---

### Category 4: DSL Undefined References Test (1 test)
**File:** `test/fixtures/programs/runner.test.js`

**Test:**
1. `should treat undefined references as primitives` (line 242-256)

**Problem:**
- Test expects undefined DSL references like `[undefined_group]` to be passed through as-is
- Currently, the resolver throws `ResolveError` with "Invalid SELFIES token"

**Root Cause:**
The resolver validates SELFIES syntax when resolving, and rejects unknown tokens like `[undefined_group]`.

**Solution:**
The test has incorrect expectations. Either:
1. Modify resolver to skip validation for undefined references (allow pass-through)
2. Update test to expect validation errors for undefined references

---

## Execution Plan

### Step 1: Fix `parseAtomSymbol` Return Behavior (Easy - 2 tests)
1. Modify `parseAtomSymbol` in `src/decoder.js` to return `null` for invalid elements
2. Verify tests pass

### Step 2: Fix `processAtomToken` Error Handling (Easy - 1 test)
1. Modify `processAtomToken` to return unchanged state for invalid atoms
2. Verify test passes

### Step 3: Investigate Roundtrip Failures (Medium - 5 tests)
1. Add debugging to identify which specific molecules fail
2. Determine if failures are encoder issues or decoder issues
3. Either fix the specific bugs or mark as known limitations

### Step 4: Fix DSL Undefined References (Easy - 1 test)
1. Review test expectations vs current behavior
2. Either fix resolver or fix test expectations

---

## Order of Execution

1. **Step 1 & 2** - Quick wins, fix error handling (3 tests)
2. **Step 4** - DSL test, likely quick fix (1 test)
3. **Step 3** - Roundtrip tests, may require deeper investigation (5 tests)

## Success Criteria

All 496 tests passing (9 current failures resolved).
