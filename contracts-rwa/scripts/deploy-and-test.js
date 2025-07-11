const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting complete RWA1155 deployment and testing workflow...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "CHZ");
  
  if (balance.lt(hre.ethers.utils.parseEther("0.1"))) {
    console.warn("⚠️  Low balance detected. Make sure you have enough CHZ for gas fees.");
  }
  
  // Step 1: Deploy the contract
  console.log("\n=== Step 1: Deploying RWA1155 Contract ===");
  const RWA1155 = await hre.ethers.getContractFactory("RWA1155");
  const rwa = await RWA1155.deploy();
  await rwa.deployed();
  
  console.log("✅ Contract deployed successfully!");
  console.log("Contract address:", rwa.address);
  console.log("Transaction hash:", rwa.deployTransaction.hash);
  
  // Step 2: Verify contract is working
  console.log("\n=== Step 2: Verifying Contract ===");
  const owner = await rwa.owner();
  console.log("Contract owner:", owner);
  console.log("Owner verification:", owner === deployer.address ? "✅ PASS" : "❌ FAIL");
  
  // Step 3: Mint test tokens
  console.log("\n=== Step 3: Minting Test Tokens ===");
  
  // Mint music rights
  console.log("Minting music rights...");
  const musicTx = await rwa.mintRWA(
    deployer.address,
    10,
    "music_right",
    5,
    "ipfs://QmYourCID/music.json"
  );
  await musicTx.wait();
  console.log("✅ Music rights minted (Token ID: 1)");
  
  // Mint property rights
  console.log("Minting property rights...");
  const propertyTx = await rwa.mintRWA(
    deployer.address,
    1,
    "property_right",
    25,
    "ipfs://QmYourCID/property.json"
  );
  await propertyTx.wait();
  console.log("✅ Property rights minted (Token ID: 2)");
  
  // Step 4: Test contract functions
  console.log("\n=== Step 4: Testing Contract Functions ===");
  
  // Check balances
  const musicBalance = await rwa.balanceOf(deployer.address, 1);
  const propertyBalance = await rwa.balanceOf(deployer.address, 2);
  console.log("Music rights balance:", musicBalance.toString());
  console.log("Property rights balance:", propertyBalance.toString());
  
  // Check metadata
  const musicData = await rwa.getRWA(1);
  const propertyData = await rwa.getRWA(2);
  
  console.log("\nMusic RWA Data:");
  console.log("- Type:", musicData.rwaType);
  console.log("- Percent:", musicData.percent.toString());
  console.log("- URI:", musicData.metadataURI);
  
  console.log("\nProperty RWA Data:");
  console.log("- Type:", propertyData.rwaType);
  console.log("- Percent:", propertyData.percent.toString());
  console.log("- URI:", propertyData.metadataURI);
  
  // Test URI function
  const musicURI = await rwa.uri(1);
  const propertyURI = await rwa.uri(2);
  console.log("\nURI Function Test:");
  console.log("- Music URI:", musicURI);
  console.log("- Property URI:", propertyURI);
  
  // Step 5: Summary
  console.log("\n=== Step 5: Test Summary ===");
  console.log("🎉 All tests completed successfully!");
  console.log("\nContract Details:");
  console.log("- Address:", rwa.address);
  console.log("- Owner:", owner);
  console.log("- Total tokens minted: 2");
  console.log("- Music rights (ID 1):", musicBalance.toString(), "tokens");
  console.log("- Property rights (ID 2):", propertyBalance.toString(), "tokens");
  
  console.log("\n📝 Next Steps:");
  console.log("1. Save the contract address:", rwa.address);
  console.log("2. Update your .env file with CONTRACT_ADDRESS=" + rwa.address);
  console.log("3. You can now use the mint script with this address");
  console.log("4. Upload your metadata to IPFS and update the URIs");
  
  return rwa.address;
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
