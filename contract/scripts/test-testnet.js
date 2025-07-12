const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // Remplacez par l'adresse déployée
  
  const [deployer] = await ethers.getSigners();
  console.log("🧪 Testing contract with account:", deployer.address);
  
  // Connect to deployed contract
  const RWAManager = await ethers.getContractFactory("RWAManager");
  const rwaManager = RWAManager.attach(contractAddress);
  
  console.log("📦 Connected to contract at:", contractAddress);
  
  // Test 1: Get contract stats
  console.log("\n📊 Getting contract stats...");
  const stats = await rwaManager.getContractStats();
  console.log("   Total Assets:", stats.totalAssets.toString());
  console.log("   Active Assets:", stats.activeAssets.toString());
  console.log("   Total Ownerships:", stats.totalOwnerships.toString());
  
  // Test 2: Purchase fragments
  console.log("\n💰 Testing fragment purchase...");
  const fragmentsToBuy = 10;
  const fragmentInfo = await rwaManager.getFragmentInfo(1);
  const totalPrice = fragmentInfo.pricePerUnit * BigInt(fragmentsToBuy);
  
  console.log("   Buying", fragmentsToBuy, "fragments");
  console.log("   Total price:", ethers.formatEther(totalPrice), "CHZ");
  
  const purchaseTx = await rwaManager.purchaseFragments(1, fragmentsToBuy, {
    value: totalPrice
  });
  
  await purchaseTx.wait();
  console.log("✅ Fragment purchase successful!");
  console.log("🔗 Transaction:", `https://testnet.chiliscan.com/tx/${purchaseTx.hash}`);
  
  // Test 3: Check balance
  const balance = await rwaManager.balanceOf(deployer.address, 1);
  console.log("   Your balance:", balance.toString(), "fragments");
  
  // Test 4: Get updated fragment info
  const updatedFragmentInfo = await rwaManager.getFragmentInfo(1);
  console.log("   Available supply:", updatedFragmentInfo.availableSupply.toString());
  
  console.log("\n🎉 All tests completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });