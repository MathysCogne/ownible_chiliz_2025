const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying RWAManager...");

  const [deployer] = await ethers.getSigners();
  const balance = await deployer.provider.getBalance(deployer.address);

  console.log("🧑 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "CHZ");

  const RWAManager = await ethers.getContractFactory("RWAManager");

  const baseURI = "https://api.ownible.com/metadata/";
  const gasPrice = ethers.parseUnits("2501", "gwei");

  const rwa = await RWAManager.deploy(baseURI, {
    gasLimit: 3_000_000,
    gasPrice,
  });

  console.log("📦 Transaction hash:", rwa.deploymentTransaction().hash);
  console.log("⏳ Waiting for deployment confirmation...");

  await rwa.waitForDeployment();

  const contractAddress = await rwa.getAddress();
  console.log("✅ RWAManager deployed at:", contractAddress);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
