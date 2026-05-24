# HashStorage Testing

## Test Architecture

The blockchain test suite is scoped to `contracts/HashStorage.sol` and runs on the in-memory Hardhat Network. Tests use:

- Hardhat `2.28.6`
- `@nomicfoundation/hardhat-toolbox` `5.0.0`
- `@nomicfoundation/hardhat-ethers` `3.1.3`
- ethers `6.16.0`
- chai `4.5.0` through Hardhat Toolbox

Each test loads a deterministic fixture with `loadFixture()`. The fixture deploys a fresh `HashStorage` contract once, snapshots the network, and resets to that snapshot before each test that uses it.

## How Tests Run

From the `blockchain` directory:

```bash
npm test
```

or directly:

```bash
npx hardhat test
```

Expected successful output:

```text
HashStorage
  ...

10 passing
```

## Why Previous Failures Happened

The app worked manually, but the automated environment had avoidable instability risks:

- Transactions were sometimes awaited only for submission, not mined confirmation.
- The contract was redeployed in `beforeEach`, which is correct but slower and easier to mutate accidentally than a snapshot fixture.
- Dynamic event values were asserted with loose predicates instead of exact deterministic values.
- Dependency versions were declared with caret ranges, so a fresh `npm install` could resolve a different Hardhat, ethers, or plugin combination.
- Tests did not explicitly cover signer-specific event actor behavior.

These issues can produce intermittent failures when automine behavior, dependency resolution, or shared mutable state changes.

## Fixes Applied

- Replaced ad hoc deployment with a `loadFixture()` deployment fixture.
- Standardized all state-changing calls through `storeHashAndWait()`, which waits for transaction mining.
- Added exact event assertions for actor and block timestamp.
- Added signer-specific event coverage.
- Added update coverage to ensure storing the same `batchId` updates the hash without incrementing `getBatchCount()`.
- Pinned Hardhat, ethers, and plugin versions in `package.json` and `package-lock.json`.
- Added `npm test` as the canonical test command.

## Deterministic Testing Rules

1. Use `loadFixture()` for contract deployment and state setup.
2. Always `await tx.wait()` before reading state changed by a transaction.
3. Do not share mutable contract instances between tests outside fixtures.
4. Assert exact event values when they are knowable from the receipt and block.
5. Use ethers v6 APIs consistently:
   - `waitForDeployment()`
   - `getAddress()`
   - native `bigint` values such as `0n`, `1n`, `2n`
6. Keep dependency versions pinned and commit `package-lock.json`.
7. Do not use arbitrary sleeps or timeouts to make tests pass.
