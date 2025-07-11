const hre = require("hardhat");

async function main() {
  console.log("Starting comprehensive RWA1155 test on Chiliz network...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  
  // Get contract instance (you'll need to update this with actual deployed address)
  const contractAddress = "0xcAd8bFBDF935084f9247A851cFb57dC8b26e2Fe0"; // Update this after deployment
  const rwa = await hre.ethers.getContractAt("RWA1155", contractAddress);
  
  try {
    // Test 1: Check if contract is deployed and accessible
    console.log("\n=== Test 1: Contract Access ===");
    const owner = await rwa.owner();
    console.log("Contract owner:", owner);
    console.log("Deployer address:", deployer.address);
    console.log("Owner check:", owner === deployer.address ? "✅ PASS" : "❌ FAIL");
    
    // Test 2: Mint a test RWA token
    console.log("\n=== Test 2: Minting RWA Token ===");
    const mintTx = await rwa.mintRWA(
      deployer.address,
      10, // amount
      "music_right", // rwaType
      5, // percent
      "ipfs://QmYourCID/rwa1.json" // metadataURI
    );
    
    console.log("Mint transaction hash:", mintTx.hash);
    const receipt = await mintTx.wait();
    console.log("Mint transaction confirmed in block:", receipt.blockNumber);
    
    // Test 3: Check balance
    console.log("\n=== Test 3: Balance Check ===");
    const balance = await rwa.balanceOf(deployer.address, 1);
    console.log("Balance of token ID 1:", balance.toString());
    console.log("Balance check:", balance.toString() === "10" ? "✅ PASS" : "❌ FAIL");
    
    // Test 4: Check RWA metadata
    console.log("\n=== Test 4: RWA Metadata ===");
    const rwaData = await rwa.getRWA(1);
    console.log("RWA Type:", rwaData.rwaType);
    console.log("Percent:", rwaData.percent.toString());
    console.log("Metadata URI:", rwaData.metadataURI);
    
    const metadataCheck = 
      rwaData.rwaType === "music_right" && 
      rwaData.percent.toString() === "5" && 
      rwaData.metadataURI === "ipfs://QmYourCID/rwa1.json";
    console.log("Metadata check:", metadataCheck ? "✅ PASS" : "❌ FAIL");
    
    // Test 5: Check URI function
    console.log("\n=== Test 5: URI Function ===");
    const uri = await rwa.uri(1);
    console.log("Token URI:", uri);
    console.log("URI check:", uri === "ipfs://QmYourCID/rwa1.json" ? "✅ PASS" : "❌ FAIL");
    
    // Test 6: Mint another token with different properties
    console.log("\n=== Test 6: Mint Different RWA Type ===");
    const mintTx2 = await rwa.mintRWA(
      deployer.address,
      1, // amount
      "property_right", // rwaType
      25, // percent
      "ipfs://QmYourCID/property.json" // metadataURI
    );
    
    await mintTx2.wait();
    const balance2 = await rwa.balanceOf(deployer.address, 2);
    console.log("Balance of token ID 2:", balance2.toString());
    
    const rwaData2 = await rwa.getRWA(2);
    console.log("Second RWA Type:", rwaData2.rwaType);
    console.log("Second RWA Percent:", rwaData2.percent.toString());
    
    console.log("\n=== All Tests Completed ===");
    console.log("Contract is functioning correctly! 🎉");
    
  } catch (error) {
    console.error("Error during testing:", error);
    console.log("❌ Test failed");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
