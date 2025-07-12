const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Testing connection to Chiliz testnet...");
  
  const [deployer] = await ethers.getSigners();
  console.log("👤 Address:", deployer.address);
  
  // Test balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "CHZ");
  
  // Test network
  const network = await deployer.provider.getNetwork();
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId);
  
  // Test block number
  const blockNumber = await deployer.provider.getBlockNumber();
  console.log("📦 Current block:", blockNumber);
  
  // Test simple transaction (transfer 0 CHZ to self)
  console.log("\n🧪 Testing simple transaction...");
  const tx = await deployer.sendTransaction({
    to: deployer.address,
    value: 0,
    gasLimit: 21000,
    gasPrice: ethers.parseUnits("2501", "gwei")
  });
  
  console.log("📝 Transaction hash:", tx.hash);
  console.log("🔗 View on ChiliScan:", `https://testnet.chiliscan.com/tx/${tx.hash}`);
  
  await tx.wait();
  console.log("✅ Transaction confirmed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Connection test failed:", error);
    process.exit(1);
  });