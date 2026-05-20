# BlockAgrichain — Blockchain Integration Guide

## Overview

This layer demonstrates a minimal blockchain proof-of-concept:

```
Product data  →  SHA-256 hash  →  storeHash()  →  blockchain transaction
                                                          ↓
                                               txHash (permanent receipt)
                                                          ↓
                                               getHash(index)  →  verify
```

---

## 1. Contract Info

| Property        | Value                                                              |
|-----------------|--------------------------------------------------------------------|
| Contract name   | `HashStorage`                                                      |
| Solidity version| `0.8.19`                                                           |
| Network (local) | Hardhat in-memory (chain ID: 31337)                                |
| ABI location    | `./artifacts/contracts/HashStorage.sol/HashStorage.json`           |

> **Note:** The local Hardhat network resets on every `npx hardhat run` call.
> For persistent deployment, use a testnet (Sepolia, etc.) and save the address.

---

## 2. ABI

```json
[
  {
    "inputs": [{ "internalType": "string", "name": "hash", "type": "string" }],
    "name": "storeHash",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }],
    "name": "getHash",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
]
```

Full ABI with metadata: `./artifacts/contracts/HashStorage.sol/HashStorage.json`

---

## 3. Contract Functions

### `storeHash(string hash)`

Appends a hash string to the on-chain array.

| Property        | Detail                          |
|-----------------|---------------------------------|
| Mutability      | `nonpayable` (writes state)     |
| Gas cost        | ~45,000 gas (first write)       |
| Returns         | nothing                         |
| Emits           | no events                       |

### `getHash(uint256 index)`

Reads a stored hash by its position index.

| Property        | Detail                          |
|-----------------|---------------------------------|
| Mutability      | `view` (read-only, free)        |
| Gas cost        | 0 (view call)                   |
| Returns         | `string` — the stored hash      |
| Reverts if      | index out of bounds             |

---

## 4. Full Blockchain Flow

### Step-by-step

```
[1] Raw product data (JS object)
        { name: "Rau cải Đà Lạt", harvestDate: "2026-05-14" }

[2] Serialize to JSON string
        '{"name":"Rau cải Đà Lạt","harvestDate":"2026-05-14"}'

[3] Generate SHA-256 hash (Node.js crypto / Web Crypto API)
        "45e7964fd105955d98a2eaad9a39c98fa6dc8e0a9bad5338c1b0c42136d969f6"

[4] Call storeHash(hash) — sends blockchain transaction
        tx = await contract.storeHash(hash)

[5] Wait for transaction confirmation
        receipt = await tx.wait()

[6] Save txHash as permanent proof receipt
        txHash = receipt.hash
        "0xaa3ab1eb5e0c40288ff7da242ff07291190b5ca990074d852ba57f60c164f602"

[7] Later: read back the stored hash
        storedHash = await contract.getHash(0)

[8] Verify integrity
        isValid = (originalHash === storedHash)  // true
```

---

## 5. Example ethers.js Integration (v6)

### Setup

```js
const { ethers } = require("ethers");
const artifact   = require("./artifacts/contracts/HashStorage.sol/HashStorage.json");

// Connect to provider (local Hardhat node)
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const signer   = await provider.getSigner();

// Instantiate contract
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // local example
const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, signer);
```

### Store a hash

```js
const crypto = require("crypto");

const product     = { name: "Rau cải Đà Lạt", harvestDate: "2026-05-14" };
const json        = JSON.stringify(product);
const hash        = crypto.createHash("sha256").update(json).digest("hex");

const tx          = await contract.storeHash(hash);
const receipt     = await tx.wait();

console.log("txHash:", receipt.hash);
// 0xaa3ab1eb5e0c40288ff7da242ff07291190b5ca990074d852ba57f60c164f602
```

### Read and verify

```js
const storedHash = await contract.getHash(0);
const isValid    = hash === storedHash;

console.log("storedHash:", storedHash);
console.log("verified:",   isValid);   // true
```

### In a browser (frontend with MetaMask)

```js
const provider = new ethers.BrowserProvider(window.ethereum);
const signer   = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
```

---

## 6. Example Response Objects

### Transaction receipt (`tx.wait()`)

```json
{
  "hash":        "0xaa3ab1eb5e0c40288ff7da242ff07291190b5ca990074d852ba57f60c164f602",
  "blockNumber": 2,
  "gasUsed":     "46910",
  "status":      1
}
```

`status: 1` = success, `status: 0` = reverted.

### Full demo output

```
============================================================
  BLOCKCHAIN DEMO — HashStorage
============================================================

[1] Du lieu goc:
{ "name": "Rau cải Đà Lạt", "harvestDate": "2026-05-14" }

[3] SHA-256 Hash (goc):
45e7964fd105955d98a2eaad9a39c98fa6dc8e0a9bad5338c1b0c42136d969f6

[4] Contract address:
0x5FbDB2315678afecb367f032d93F642f64180aa3

[5] Transaction hash (txHash):
0xaa3ab1eb5e0c40288ff7da242ff07291190b5ca990074d852ba57f60c164f602

[6] Hash doc tu blockchain (getHash(0)):
45e7964fd105955d98a2eaad9a39c98fa6dc8e0a9bad5338c1b0c42136d969f6

[7] Ket qua xac minh:
  => THANH CONG: Hash khop chinh xac!
============================================================
```

---

## 7. Commands Reference

```bash
# Compile contracts
npx hardhat compile

# Run all tests
npx hardhat test

# Run demo flow
npx hardhat run scripts/deploy.js
npx hardhat run scripts/demo.js

# Start local node (persistent, for frontend dev)
npx hardhat node

# Deploy to running local node
npx hardhat run scripts/deploy.js --network localhost
```

---

## 8. Files Reference

```
blockchain/
├── contracts/
│   └── HashStorage.sol                   # Smart contract source
├── scripts/
│   ├── deploy.js                         # Deploy only
│   └── demo.js                           # Full demo flow
├── test/
│   └── HashStorage.test.js               # Mocha/Chai test suite
├── artifacts/
│   └── contracts/HashStorage.sol/
│       └── HashStorage.json              # Compiled ABI + bytecode
├── hardhat.config.js                     # Hardhat config
└── INTEGRATION.md                        # This file
```
