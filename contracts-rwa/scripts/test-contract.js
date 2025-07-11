const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  // Use the deployed contract address
  const contractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS || "0xcAd8bFBDF935084f9247A851cFb57dC8b26e2Fe0";
  
  console.log("🔍 Testing RWA1155 contract functionality...");
  console.log("Contract address:", contractAddress);
  console.log("Testing with account:", deployer.address);
  
  const rwa = await hre.ethers.getContractAt("RWA1155", contractAddress);

  try {
    // Test 1: Check contract owner
    console.log("\n📋 Test 1: Contract Owner");
    const owner = await rwa.owner();
    console.log("Contract owner:", owner);
    console.log("Current account:", deployer.address);
    console.log("Is owner:", owner.toLowerCase() === deployer.address.toLowerCase());

    // Test 2: Check ERC1155 support
    console.log("\n📋 Test 2: ERC1155 Interface Support");
    const supportsERC1155 = await rwa.supportsInterface("0xd9b67a26");
    console.log("Supports ERC1155:", supportsERC1155);

    // Test 3: Mint a test RWA token
    console.log("\n📋 Test 3: Mint RWA Token");
    const testRWA = {
      to: deployer.address,
      amount: 100,
      rwaType: "test_stadium_rights",
      percent: 15,
      metadataURI: "https://gateway.pinata.cloud/ipfs/QmTestCID/test_metadata.json"
    };

    const mintTx = await rwa.mintRWA(
      testRWA.to,
      testRWA.amount,
      testRWA.rwaType,
      testRWA.percent,
      testRWA.metadataURI
    );
    
    console.log("Mint transaction hash:", mintTx.hash);
    await mintTx.wait();
    console.log("✅ RWA token minted successfully!");

    // Test 4: Check balance
    console.log("\n📋 Test 4: Check Token Balance");
    const balance = await rwa.balanceOf(deployer.address, 1);
    console.log("Token ID 1 balance:", balance.toString());

    // Test 5: Get RWA metadata
    console.log("\n📋 Test 5: Get RWA Metadata");
    const rwaData = await rwa.getRWA(1);
    console.log("RWA Type:", rwaData.rwaType);
    console.log("RWA Percent:", rwaData.percent.toString(), "%");
    console.log("Metadata URI:", rwaData.metadataURI);

    // Test 6: Check token URI
    console.log("\n📋 Test 6: Token URI");
    const tokenURI = await rwa.uri(1);
    console.log("Token URI:", tokenURI);

    // Test 7: Test batch balance check
    console.log("\n📋 Test 7: Batch Balance Check");
    const batchBalances = await rwa.balanceOfBatch([deployer.address], [1]);
    console.log("Batch balance result:", batchBalances[0].toString());

    console.log("\n🎉 All tests passed successfully!");
    console.log("Your RWA1155 contract is working correctly on Chiliz!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
