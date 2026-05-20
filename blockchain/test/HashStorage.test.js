const { expect } = require("chai");
const { ethers } = require("hardhat");
const crypto = require("crypto");

describe("HashStorage", function () {
  let hashStorage;

  beforeEach(async function () {
    const HashStorage = await ethers.getContractFactory("HashStorage");
    hashStorage = await HashStorage.deploy();
    await hashStorage.waitForDeployment();
  });

  // Test 1: lưu và đọc theo batchId
  it("should store and retrieve hash by batchId", async function () {
    await hashStorage.storeHash("BATCH-001", "abc123");
    expect(await hashStorage.getHash("BATCH-001")).to.equal("abc123");
  });

  // Test 2: batchId chưa tồn tại trả về chuỗi rỗng
  it("should return empty string for unknown batchId", async function () {
    expect(await hashStorage.getHash("BATCH-UNKNOWN")).to.equal("");
  });

  // Test 3: nhiều batchId độc lập nhau
  it("should store multiple batchIds independently", async function () {
    await hashStorage.storeHash("BATCH-A", "hash_alpha");
    await hashStorage.storeHash("BATCH-B", "hash_beta");
    await hashStorage.storeHash("BATCH-C", "hash_gamma");

    expect(await hashStorage.getHash("BATCH-A")).to.equal("hash_alpha");
    expect(await hashStorage.getHash("BATCH-B")).to.equal("hash_beta");
    expect(await hashStorage.getHash("BATCH-C")).to.equal("hash_gamma");
  });

  // Test 4: verifyHash() trả về true khi hash khớp
  it("should return true from verifyHash() when hash matches", async function () {
    await hashStorage.storeHash("BATCH-001", "myhash");
    expect(await hashStorage.verifyHash("BATCH-001", "myhash")).to.equal(true);
  });

  // Test 5: verifyHash() trả về false khi hash sai
  it("should return false from verifyHash() when hash does not match", async function () {
    await hashStorage.storeHash("BATCH-001", "myhash");
    expect(await hashStorage.verifyHash("BATCH-001", "wronghash")).to.equal(false);
  });

  // Test 6: getBatchCount() tăng đúng số lượng
  it("should track batch count correctly", async function () {
    expect(await hashStorage.getBatchCount()).to.equal(0n);
    await hashStorage.storeHash("BATCH-001", "h1");
    expect(await hashStorage.getBatchCount()).to.equal(1n);
    await hashStorage.storeHash("BATCH-002", "h2");
    expect(await hashStorage.getBatchCount()).to.equal(2n);
  });

  // Test 7: emit event HashStored đúng tham số
  it("should emit HashStored event with correct batchId and hash", async function () {
    await expect(hashStorage.storeHash("BATCH-001", "hashvalue"))
      .to.emit(hashStorage, "HashStored")
      .withArgs(
        "BATCH-001",
        "hashvalue",
        (v) => ethers.isAddress(v),   // actor address — dynamic
        (v) => v > 0n                  // timestamp — dynamic
      );
  });

  // Test 8: luồng đầy đủ SHA-256 → storeHash → verifyHash
  it("should verify SHA-256 hash end-to-end", async function () {
    const product = { name: "Rau cải Đà Lạt", harvestDate: "2026-05-14" };
    const hash = crypto.createHash("sha256").update(JSON.stringify(product)).digest("hex");

    await hashStorage.storeHash("BATCH-88902", hash);

    expect(await hashStorage.verifyHash("BATCH-88902", hash)).to.equal(true);
    expect(await hashStorage.getHash("BATCH-88902")).to.equal(hash);
  });
});
