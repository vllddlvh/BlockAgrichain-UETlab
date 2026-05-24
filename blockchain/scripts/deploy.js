const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const HashStorage = await hre.ethers.getContractFactory("HashStorage");
  const hashStorage = await HashStorage.deploy();

  await hashStorage.waitForDeployment();
  const address = await hashStorage.getAddress();
  const network = await hre.ethers.provider.getNetwork();
  const artifact = await hre.artifacts.readArtifact("HashStorage");

  const deployment = {
    contract: "HashStorage",
    address,
    chainId: Number(network.chainId),
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    abi: artifact.abi,
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deployment, null, 2)
  );

  console.log(`HashStorage deployed to: ${address}`);
  console.log(`Deployment saved to: deployments/${hre.network.name}.json`);
  console.log(`VITE_HASH_STORAGE_ADDRESS=${address}`);
  console.log(`HASH_STORAGE_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
