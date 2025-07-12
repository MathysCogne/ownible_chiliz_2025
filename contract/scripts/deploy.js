const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying RWAManager...");

  // Get the contract factory
  const RWAManager = await ethers.getContractFactory("RWAManager");
  
  // Deploy with base URI
  const baseURI = "https://gateway.pinata.cloud/ipfs/";
  const rwaManager = await RWAManager.deploy(baseURI);
  
  // Wait for deployment to complete
  await rwaManager.waitForDeployment();
  
  const contractAddress = await rwaManager.getAddress();
  
  console.log("✅ RWAManager deployed to:", contractAddress);
  console.log("📝 Base URI:", baseURI);
  
  // Get deployer address
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployed by:", deployer.address);
  
  // Verify the contract is working
  try {
    const admin = await rwaManager.admin();
    console.log("🔐 Admin address:", admin);
    
    const assetCount = await rwaManager.getAssetCount();
    console.log("📊 Initial asset count:", assetCount.toString());
    
    console.log("🎉 Deployment successful!");
    console.log("📋 Update CONTRACT_ADDRESS in front/lib/contract.ts to:", contractAddress);
    
  } catch (error) {
    console.error("❌ Error verifying deployment:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
