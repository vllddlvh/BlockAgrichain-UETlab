// First deploy on Hardhat local node always lands at this address (nonce 0, signer 0).
// Steps:
//   Terminal 1: npx hardhat node
//   Terminal 2: npx hardhat run scripts/deploy.js --network localhost
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ABI = [
  {
    inputs: [{ internalType: "string", name: "hash", type: "string" }],
    name: "storeHash",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "getHash",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
];

// SHA-256 using Web Crypto API — browser built-in, no library needed
async function sha256hex(message) {
  const encoded = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// DOM refs
const btnConnect  = document.getElementById("btn-connect");
const btnStore    = document.getElementById("btn-store");
const inputData   = document.getElementById("input-data");
const elAddress   = document.getElementById("wallet-address");
const elHash      = document.getElementById("generated-hash");
const elTxHash    = document.getElementById("tx-hash");
const elStatus    = document.getElementById("status");

let signer = null;

function setStatus(msg, type = "info") {
  elStatus.textContent = msg;
  elStatus.className = type; // "info" | "success" | "error"
}

// ─── Step 1: Connect MetaMask ───────────────────────────────────────────────

btnConnect.addEventListener("click", async () => {
  if (!window.ethereum) {
    setStatus("MetaMask not detected. Install MetaMask and refresh.", "error");
    return;
  }

  try {
    setStatus("Requesting accounts...", "info");

    // Request wallet access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Verify chain ID
    const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
    const chainId = parseInt(chainIdHex, 16);

    if (chainId !== 31337) {
      setStatus("Switching to Hardhat Local network...", "info");
      try {
        // Try switching if the network was already added before
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x7A69" }],
        });
      } catch (switchErr) {
        if (switchErr.code === 4902) {
          // Network not in MetaMask yet — add it
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x7A69",
                chainName: "Hardhat Local",
                rpcUrls: ["http://127.0.0.1:8545"],
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              },
            ],
          });
        } else {
          throw switchErr;
        }
      }
    }

    // Create ethers signer from MetaMask provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    elAddress.textContent = accounts[0];
    btnStore.disabled = false;
    btnConnect.textContent = "Connected";
    btnConnect.classList.add("connected");
    btnConnect.disabled = true;
    setStatus("Wallet connected. Enter data and click Hash & Store.", "success");

  } catch (err) {
    if (err.code === 4001) {
      setStatus("Connection rejected by user.", "error");
    } else {
      setStatus(`Connection error: ${err.message}`, "error");
    }
  }
});

// ─── Step 2: Hash & Store ───────────────────────────────────────────────────

btnStore.addEventListener("click", async () => {
  const data = inputData.value.trim();
  if (!data) {
    setStatus("Please enter some data first.", "error");
    return;
  }

  btnStore.disabled = true;
  elHash.textContent = "—";
  elTxHash.textContent = "—";

  try {
    // 1. Generate SHA-256 hash in browser
    setStatus("Generating SHA-256 hash...", "info");
    const hash = await sha256hex(data);
    elHash.textContent = hash;

    // 2. Build contract instance with MetaMask signer
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    // 3. Send transaction — MetaMask popup opens here
    setStatus("Waiting for MetaMask confirmation...", "info");
    const tx = await contract.storeHash(hash);

    // 4. Wait for block confirmation
    setStatus(`Transaction sent (${tx.hash.slice(0, 12)}...). Waiting for block...`, "info");
    const receipt = await tx.wait();

    // 5. Display result
    elTxHash.textContent = receipt.hash;
    setStatus("Hash stored on blockchain successfully!", "success");

  } catch (err) {
    if (err.code === 4001) {
      setStatus("Transaction rejected by user.", "error");
    } else {
      setStatus(`Error: ${err.message}`, "error");
    }
  } finally {
    btnStore.disabled = false;
  }
});
