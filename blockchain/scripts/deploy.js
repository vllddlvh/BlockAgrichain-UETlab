import hre from "hardhat";

async function main() {
  const HashStorage = await hre.ethers.getContractFactory("HashStorage");
  const hashStorage = await HashStorage.deploy();

  await hashStorage.waitForDeployment();

  console.log(`HashStorage deployed to: ${await hashStorage.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
