const hre = require("hardhat");
const crypto = require("crypto");

async function main() {
  // 1. Tạo object sản phẩm giả
  const product = {
    name: "Rau cải Đà Lạt",
    harvestDate: "2026-05-14",
  };

  // 2. Chuyển thành JSON string
  const productJson = JSON.stringify(product);

  // 3. Tạo SHA-256 hash bằng Node.js crypto
  const originalHash = crypto
    .createHash("sha256")
    .update(productJson)
    .digest("hex");

  // 4. Deploy HashStorage contract
  const HashStorage = await hre.ethers.getContractFactory("HashStorage");
  const hashStorage = await HashStorage.deploy();
  await hashStorage.waitForDeployment();
  const contractAddress = await hashStorage.getAddress();

  const batchId = "BATCH-88902";

  // 5. Gọi storeHash(batchId, hash) — ghi hash lên blockchain
  const tx = await hashStorage.storeHash(batchId, originalHash);

  // 6. Chờ transaction được confirm
  const receipt = await tx.wait();

  // 7. Đọc hash bằng getHash(batchId)
  const storedHash = await hashStorage.getHash(batchId);

  // 8. Xác minh bằng verifyHash(batchId, hash)
  const isVerified = await hashStorage.verifyHash(batchId, originalHash);

  // 9. In kết quả
  console.log("=".repeat(60));
  console.log("  BLOCKCHAIN DEMO — HashStorage v2");
  console.log("=".repeat(60));

  console.log("\n[1] Du lieu goc:");
  console.log(JSON.stringify(product, null, 2));

  console.log("\n[2] Batch ID:");
  console.log(batchId);

  console.log("\n[3] SHA-256 Hash (goc):");
  console.log(originalHash);

  console.log("\n[4] Contract address:");
  console.log(contractAddress);

  console.log("\n[5] Transaction hash (txHash):");
  console.log(receipt.hash);

  console.log("\n[6] Hash doc tu blockchain (getHash(batchId)):");
  console.log(storedHash);

  console.log("\n[7] Ket qua verifyHash():");
  console.log(" =>", isVerified ? "THANH CONG: Hash khop chinh xac!" : "THAT BAI: Hash khong khop!");

  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
