// Update this address after each fresh Hardhat deployment.
// Terminal 1: npx hardhat node
// Terminal 2: npx hardhat run scripts/deploy.js --network localhost
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CHAIN_ID = 31337;
const CHAIN_ID_HEX = `0x${CHAIN_ID.toString(16)}`;

const ABI = [
  "function storeHash(string calldata batchId, string calldata dataHash) external",
  "function getHash(string calldata batchId) external view returns (string memory)",
  "function verifyHash(string calldata batchId, string calldata dataHash) external view returns (bool)",
];

async function sha256hex(message) {
  const encoded = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const btnConnect = document.getElementById("btn-connect");
const btnStore = document.getElementById("btn-store");
const inputBatchId = document.getElementById("input-batch-id");
const inputData = document.getElementById("input-data");
const elAddress = document.getElementById("wallet-address");
const elHash = document.getElementById("generated-hash");
const elTxHash = document.getElementById("tx-hash");
const elStatus = document.getElementById("status");

let signer = null;

function setStatus(message, type = "info") {
  elStatus.textContent = message;
  elStatus.className = type;
}

async function ensureCorrectNetwork() {
  const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
  if (currentChainId === CHAIN_ID_HEX) {
    return;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }],
    });
  } catch (switchErr) {
    if (switchErr.code !== 4902) {
      throw switchErr;
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: CHAIN_ID_HEX,
          chainName: "Hardhat Local",
          rpcUrls: ["http://127.0.0.1:8545"],
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        },
      ],
    });
  }
}

btnConnect.addEventListener("click", async () => {
  if (!window.ethereum) {
    setStatus("MetaMask not detected. Install MetaMask and refresh.", "error");
    return;
  }

  try {
    setStatus("Requesting wallet access...", "info");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    await ensureCorrectNetwork();

    const provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    elAddress.textContent = accounts[0];
    btnStore.disabled = false;
    btnConnect.textContent = "Connected";
    btnConnect.classList.add("connected");
    btnConnect.disabled = true;
    setStatus("Wallet connected. Enter batch data and store the hash.", "success");
  } catch (err) {
    setStatus(err.code === 4001 ? "Connection rejected by user." : `Connection error: ${err.message}`, "error");
  }
});

btnStore.addEventListener("click", async () => {
  const batchId = inputBatchId.value.trim();
  const data = inputData.value.trim();

  if (!batchId || !data) {
    setStatus("Enter both batch ID and data first.", "error");
    return;
  }

  btnStore.disabled = true;
  elHash.textContent = "-";
  elTxHash.textContent = "-";

  try {
    setStatus("Generating SHA-256 hash...", "info");
    const dataHash = await sha256hex(data);
    elHash.textContent = dataHash;

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    setStatus("Waiting for MetaMask confirmation...", "info");
    const tx = await contract.storeHash(batchId, dataHash);

    setStatus(`Transaction sent (${tx.hash.slice(0, 12)}...). Waiting for block...`, "info");
    const receipt = await tx.wait();

    const verified = await contract.verifyHash(batchId, dataHash);
    elTxHash.textContent = receipt.hash;
    setStatus(verified ? "Hash stored and verified on blockchain." : "Transaction mined, but verification failed.", verified ? "success" : "error");
  } catch (err) {
    setStatus(err.code === 4001 ? "Transaction rejected by user." : `Error: ${err.message}`, "error");
  } finally {
    btnStore.disabled = false;
  }
});
