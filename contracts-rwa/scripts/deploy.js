const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying RWA1155 contract...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const RWA1155 = await hre.ethers.getContractFactory("RWA1155");
  const rwa = await RWA1155.deploy();
  await rwa.deployed();

  console.log("✅ RWA1155 contract deployed to:", rwa.address);
  console.log("Owner:", await rwa.owner());
  
  // Verify the contract supports ERC1155
  const supportsERC1155 = await rwa.supportsInterface("0xd9b67a26");
  console.log("Supports ERC1155:", supportsERC1155);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
