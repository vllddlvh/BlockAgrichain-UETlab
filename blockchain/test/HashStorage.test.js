const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const crypto = require("crypto");

describe("HashStorage", function () {
  async function deployHashStorageFixture() {
    const [deployer, otherAccount] = await ethers.getSigners();
    const HashStorage = await ethers.getContractFactory("HashStorage");
    const hashStorage = await HashStorage.deploy();
    await hashStorage.waitForDeployment();

    return { hashStorage, deployer, otherAccount };
  }

  async function storeHashAndWait(contract, batchId, dataHash) {
    const tx = await contract.storeHash(batchId, dataHash);
    return tx.wait();
  }

  it("stores and retrieves hash by batchId", async function () {
    const { hashStorage } = await loadFixture(deployHashStorageFixture);

    await storeHashAndWait(hashStorage, "BATCH-001", "abc123");

    expect(await hashStorage.getHash("BATCH-001")).to.equal("abc123");
  });

  it("returns empty string for unknown batchId", async function () {
    const { hashStorage } = await loadFixture(deployHashStorageFixture);

    expect(await hashStorage.getHash("BATCH-UNKNOWN")).to.equal("");
  });

  it("stores multiple batchIds independently", async function () {
    const { hashStorage } = await loadFixture(deployHashStorageFixture);

    await storeHashAndWait(hashStorage, "BATCH-A", "hash_alpha");
    await storeHashAndWait(hashStorage, "BATCH-B", "hash_beta");
    await storeHashAndWait(hashStorage, "BATCH-C", "hash_gamma");

    expect(await hashStorage.getHash("BATCH-A")).to.equal("hash_alpha");
    expect(await hashStorage.getHash("BATCH-B")).to.equal("hash_beta");
    expect(await hashStorage.getHash("BATCH-C")).to.equal("hash_gamma");
  });

  it("returns true from verifyHash() when hash matches", async function () {
    const { hashStorage } = await loadFixture(deployHashStorageFixture);

    await storeHashAndWait(hashStorage, "BATCH-001", "myhash");

    expect(await hashStorage.verifyHash("BATCH-001", "myhash")).to.equal(true);
  });

  it("returns false from verifyHash() when hash does not match", async function () {
    const { hashStorage } = await loadFixture(deployHashStorageFixture);

    await storeHashAndWait(hashStorage, "BATCH-001", "myhash");

    expect(await hashStorage.verifyHash("BATCH-001", "wronghash")).to.equal(false);
  });

  it("tracks batch count by unique batchId", async function () {
    const { hashStorage } = await loadFixture(deployHashStorageFixture);

    expect(await hashStorage.getBatchCount()).to.equal(0n);
    await storeHashAndWait(hashStorage, "BATCH-001", "h1");
    expect(await hashStorage.getBatchCount()).to.equal(1n);
    await storeHashAndWait(hashStorage, "BATCH-002", "h2");
    expect(await hashStorage.getBatchCount()).to.equal(2n);
  });

  it("does not increase batch count when updating an existing batchId", async function () {
    const { hashStorage } = await loadFixture(deployHashStorageFixture);

    await storeHashAndWait(hashStorage, "BATCH-001", "old_hash");
    await storeHashAndWait(hashStorage, "BATCH-001", "new_hash");

    expect(await hashStorage.getBatchCount()).to.equal(1n);
    expect(await hashStorage.getHash("BATCH-001")).to.equal("new_hash");
  });

  it("emits HashStored with exact batchId, hash, actor, and timestamp", async function () {
    const { hashStorage, deployer } = await loadFixture(deployHashStorageFixture);

    const tx = await hashStorage.storeHash("BATCH-001", "hashvalue");
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt.blockNumber);

    await expect(tx)
      .to.emit(hashStorage, "HashStored")
      .withArgs("BATCH-001", "hashvalue", deployer.address, block.timestamp);
  });

  it("emits HashStored with the connected signer as actor", async function () {
    const { hashStorage, otherAccount } = await loadFixture(deployHashStorageFixture);
    const hashStorageAsOther = hashStorage.connect(otherAccount);

    const tx = await hashStorageAsOther.storeHash("BATCH-002", "other_hash");
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt.blockNumber);

    await expect(tx)
      .to.emit(hashStorageAsOther, "HashStored")
      .withArgs("BATCH-002", "other_hash", otherAccount.address, block.timestamp);
  });

  it("verifies SHA-256 hash end-to-end", async function () {
    const { hashStorage } = await loadFixture(deployHashStorageFixture);
    const product = { name: "Da Lat cabbage", harvestDate: "2026-05-14" };
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(product))
      .digest("hex");

    await storeHashAndWait(hashStorage, "BATCH-88902", hash);

    expect(await hashStorage.verifyHash("BATCH-88902", hash)).to.equal(true);
    expect(await hashStorage.getHash("BATCH-88902")).to.equal(hash);
  });
});
