const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  // Use the deployed contract address
  const contractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS || "0xcAd8bFBDF935084f9247A851cFb57dC8b26e2Fe0";
  
  console.log("🎯 Minting RWA with account:", deployer.address);
  console.log("Contract address:", contractAddress);
  
  const rwa = await hre.ethers.getContractAt("RWA1155", contractAddress);

  // Example RWA types for sports/entertainment
  const rwaExamples = [
    {
      to: deployer.address,
      amount: 100,
      rwaType: "fan_token_revenue",
      percent: 25,
      metadataURI: "https://gateway.pinata.cloud/ipfs/QmYourCID/fan_token.json"
    },
    {
      to: deployer.address,
      amount: 50,
      rwaType: "stadium_naming_rights",
      percent: 10,
      metadataURI: "https://gateway.pinata.cloud/ipfs/QmYourCID/stadium_rights.json"
    },
    {
      to: deployer.address,
      amount: 10,
      rwaType: "player_image_rights",
      percent: 5,
      metadataURI: "https://gateway.pinata.cloud/ipfs/QmYourCID/player_rights.json"
    }
  ];

  console.log("🔄 Minting multiple RWA tokens...");
  
  for (let i = 0; i < rwaExamples.length; i++) {
    const example = rwaExamples[i];
    
    console.log(`\n📝 Minting RWA ${i + 1}: ${example.rwaType}`);
    
    const tx = await rwa.mintRWA(
      example.to,
      example.amount,
      example.rwaType,
      example.percent,
      example.metadataURI
    );

    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log(`✅ Successfully minted ${example.amount} tokens of type: ${example.rwaType}`);
    
    // Check balance
    const tokenId = i + 1;
    const balance = await rwa.balanceOf(deployer.address, tokenId);
    console.log(`Your balance of token ID ${tokenId}:`, balance.toString());
    
    // Get RWA data
    const rwaData = await rwa.getRWA(tokenId);
    console.log(`RWA Data - Type: ${rwaData.rwaType}, Percent: ${rwaData.percent}%`);
  }
  
  console.log("\n🎉 All RWA tokens minted successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
