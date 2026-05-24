# System Debugging Guide

This project has four runtime surfaces that must point to the same local blockchain deployment:

1. Hardhat node and `HashStorage` contract.
2. React/Vite frontend with MetaMask and ethers v6.
3. Spring Boot backend reading the contract through JSON-RPC.
4. PostgreSQL storing only the blockchain proof metadata, not the canonical hash source.

## Architecture Debugging Map

The supported end-to-end flow is:

```text
Batch status update
  -> backend computes deterministic SHA-256 dataHash
  -> frontend opens MetaMask with batchCode + dataHash
  -> MetaMask signs HashStorage.storeHash(batchCode, dataHash)
  -> Hardhat mines tx and returns txHash
  -> frontend posts txHash + dataHash to backend
  -> backend recomputes dataHash and calls verifyHash(batchCode, dataHash)
  -> backend persists txHash/dataHash/anchoredAt
  -> public traceability reads getHash(batchCode) and verifies against computedHash
```

The database is not the source of truth for verification. It stores proof metadata only:

- `blockchain_tx_hash`
- `blockchain_data_hash`
- `blockchain_anchored_at`

The contract is the source of truth for the stored hash.

## Root Causes Fixed

### 1. ABI mismatch in MetaMask demo

`blockchain/metamask-demo` still used the old contract shape:

- `storeHash(string hash)`
- `getHash(uint256 index)`

The actual contract now uses:

- `storeHash(string batchId, string dataHash)`
- `getHash(string batchId)`
- `verifyHash(string batchId, string dataHash)`

The demo was updated to collect `batchId`, hash the input data, call `storeHash(batchId, dataHash)`, wait for mining, and verify with `verifyHash`.

### 2. Frontend blockchain success was not persisted by backend

The frontend could get a mined transaction, but the backend had no deterministic confirmation step for `txHash + dataHash`.

The batch flow now confirms the anchor by calling:

```text
POST /api/v1/batches/{batchId}/blockchain-anchor
```

Payload:

```json
{
  "txHash": "0x...",
  "dataHash": "0x..."
}
```

### 3. Backend verification cannot trust DB hash fields

Old `onchain_hash` style persistence made verification dependent on DB contents. That is unsafe because changing both business data and DB hash can fake a valid result.

The backend now recomputes the hash and verifies it against the deployed contract with `verifyHash(batchCode, dataHash)`.

### 4. Contract address and network drift

The frontend, backend, MetaMask, and Hardhat node must all use the same deployment. The deploy script writes deployment metadata to:

```text
blockchain/deployments/<network>.json
```

It also prints the values that must be copied into environment variables:

```text
VITE_HASH_STORAGE_ADDRESS=...
HASH_STORAGE_CONTRACT_ADDRESS=...
```

### 5. Hardhat compiler cache instability

One local test run failed with `HH505` because Hardhat could not run the native solc from a stale/locked cache. Running `npx hardhat clean` and then `npx hardhat test` rebuilt the cache and restored deterministic test runs.

## Startup Sequence

Use this order for a clean local run.

1. Start local blockchain:

```bash
cd blockchain
npx hardhat node
```

2. Deploy contract in a second terminal:

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

3. Copy the printed contract address into frontend env:

```text
Blockagridence-Frontend/blockagridence-fe/.env
VITE_HASH_STORAGE_ADDRESS=<deployed address>
VITE_CHAIN_ID=31337
VITE_CHAIN_NAME=Hardhat Local
VITE_RPC_URL=http://127.0.0.1:8545
```

4. Set backend env to the same address before starting Spring Boot:

```bash
set HASH_STORAGE_CONTRACT_ADDRESS=<deployed address>
set BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
```

PowerShell:

```powershell
$env:HASH_STORAGE_CONTRACT_ADDRESS="<deployed address>"
$env:BLOCKCHAIN_RPC_URL="http://127.0.0.1:8545"
```

5. Start backend:

```bash
cd Blockagrichain-Backend
.\mvnw.cmd spring-boot:run
```

6. Start frontend:

```bash
cd Blockagridence-Frontend/blockagridence-fe
npm run dev
```

7. In MetaMask, use Hardhat Local:

```text
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency: ETH
```

Import one Hardhat account private key from the `npx hardhat node` output.

## Deterministic Debugging Workflow

Run these checks after changing integration code:

```bash
cd blockchain
npx hardhat test
```

```bash
cd Blockagrichain-Backend
.\mvnw.cmd test
```

```bash
cd Blockagridence-Frontend/blockagridence-fe
npm run build
```

If Hardhat reports `HH505`, run:

```bash
cd blockchain
npx hardhat clean
npx hardhat test
```

## Common Failure Causes

- MetaMask is connected to a different chain than the frontend expects.
- `VITE_HASH_STORAGE_ADDRESS` differs from `HASH_STORAGE_CONTRACT_ADDRESS`.
- Hardhat node was restarted but the old contract address is still in `.env`.
- The frontend was not restarted after editing `.env`.
- Backend was started without `HASH_STORAGE_CONTRACT_ADDRESS`.
- MetaMask is using stale permissions or an account that does not exist on the current Hardhat node.
- ABI in a demo or component does not match `HashStorage.sol`.
- Backend public traceability reads DB proof fields instead of the contract.

## Expected Stable Result

A valid run should produce:

1. MetaMask prompts for `storeHash(batchCode, dataHash)`.
2. Transaction is mined and `txHash` is returned.
3. Frontend posts `txHash + dataHash` to the backend.
4. Backend verifies `verifyHash(batchCode, dataHash) == true`.
5. Backend persists proof metadata.
6. Public traceability returns `blockchainVerified: true`.
