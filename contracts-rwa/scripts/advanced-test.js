const hre = require("hardhat");

async function main() {
  const [deployer, user1, user2] = await hre.ethers.getSigners();
  
  // Use the deployed contract address
  const contractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS || "0xcAd8bFBDF935084f9247A851cFb57dC8b26e2Fe0";
  
  console.log("🚀 Advanced RWA1155 testing on Chiliz...");
  console.log("Contract address:", contractAddress);
  console.log("Owner account:", deployer.address);
  console.log("User1 account:", user1.address);
  console.log("User2 account:", user2.address);
  
  const rwa = await hre.ethers.getContractAt("RWA1155", contractAddress);

  try {
    // Test 1: Mint different types of sports RWAs
    console.log("\n🏟️ Test 1: Minting Sports RWAs");
    
    const sportsRWAs = [
      {
        type: "fan_token_revenue",
        percent: 20,
        amount: 1000,
        recipient: user1.address,
        description: "FC Barcelona Fan Token Revenue Share"
      },
      {
        type: "stadium_naming_rights",
        percent: 5,
        amount: 1,
        recipient: user1.address,
        description: "Camp Nou Stadium Naming Rights"
      },
      {
        type: "player_image_rights",
        percent: 10,
        amount: 100,
        recipient: user2.address,
        description: "Messi Image Rights"
      },
      {
        type: "merchandise_sales",
        percent: 15,
        amount: 500,
        recipient: user2.address,
        description: "Official Merchandise Sales Share"
      }
    ];

    for (let i = 0; i < sportsRWAs.length; i++) {
      const rwaData = sportsRWAs[i];
      const metadataURI = `https://gateway.pinata.cloud/ipfs/QmSportsCID/${rwaData.type}.json`;
      
      console.log(`\n📝 Minting: ${rwaData.description}`);
      const tx = await rwa.mintRWA(
        rwaData.recipient,
        rwaData.amount,
        rwaData.type,
        rwaData.percent,
        metadataURI
      );
      
      await tx.wait();
      console.log(`✅ Minted ${rwaData.amount} tokens of ${rwaData.type} to ${rwaData.recipient}`);
    }

    // Test 2: Check balances
    console.log("\n📊 Test 2: Check All Balances");
    for (let tokenId = 1; tokenId <= sportsRWAs.length; tokenId++) {
      const rwaData = await rwa.getRWA(tokenId);
      const user1Balance = await rwa.balanceOf(user1.address, tokenId);
      const user2Balance = await rwa.balanceOf(user2.address, tokenId);
      
      console.log(`Token ID ${tokenId} (${rwaData.rwaType}):`);
      console.log(`  - User1 balance: ${user1Balance.toString()}`);
      console.log(`  - User2 balance: ${user2Balance.toString()}`);
      console.log(`  - Revenue share: ${rwaData.percent}%`);
    }

    // Test 3: Transfer tokens
    console.log("\n🔄 Test 3: Transfer Tokens");
    const transferAmount = 50;
    
    console.log(`Transferring ${transferAmount} fan tokens from user1 to user2...`);
    const transferTx = await rwa.connect(user1).safeTransferFrom(
      user1.address,
      user2.address,
      1, // fan_token_revenue token ID
      transferAmount,
      "0x"
    );
    
    await transferTx.wait();
    console.log("✅ Transfer completed");
    
    // Check balances after transfer
    const user1BalanceAfter = await rwa.balanceOf(user1.address, 1);
    const user2BalanceAfter = await rwa.balanceOf(user2.address, 1);
    
    console.log(`User1 balance after transfer: ${user1BalanceAfter.toString()}`);
    console.log(`User2 balance after transfer: ${user2BalanceAfter.toString()}`);

    // Test 4: Batch operations
    console.log("\n📦 Test 4: Batch Operations");
    const batchAccounts = [user1.address, user2.address, user1.address, user2.address];
    const batchTokenIds = [1, 1, 2, 3];
    
    const batchBalances = await rwa.balanceOfBatch(batchAccounts, batchTokenIds);
    console.log("Batch balance results:");
    for (let i = 0; i < batchBalances.length; i++) {
      console.log(`  - Account ${batchAccounts[i]}, Token ${batchTokenIds[i]}: ${batchBalances[i].toString()}`);
    }

    // Test 5: URI and metadata
    console.log("\n🔗 Test 5: URI and Metadata");
    for (let tokenId = 1; tokenId <= sportsRWAs.length; tokenId++) {
      const uri = await rwa.uri(tokenId);
      const rwaData = await rwa.getRWA(tokenId);
      console.log(`Token ${tokenId} URI: ${uri}`);
      console.log(`Token ${tokenId} type: ${rwaData.rwaType}`);
    }

    // Test 6: Calculate potential earnings
    console.log("\n💰 Test 6: Calculate Potential Earnings");
    const monthlyRevenue = hre.ethers.utils.parseEther("100000"); // 100k CHZ monthly
    
    for (let tokenId = 1; tokenId <= sportsRWAs.length; tokenId++) {
      const rwaData = await rwa.getRWA(tokenId);
      const user1Balance = await rwa.balanceOf(user1.address, tokenId);
      const user2Balance = await rwa.balanceOf(user2.address, tokenId);
      
      if (user1Balance.gt(0) || user2Balance.gt(0)) {
        const revenueShare = monthlyRevenue.mul(rwaData.percent).div(100);
        console.log(`\n${rwaData.rwaType} (${rwaData.percent}% share):`);
        console.log(`  - Monthly revenue share: ${hre.ethers.utils.formatEther(revenueShare)} CHZ`);
        
        if (user1Balance.gt(0)) {
          console.log(`  - User1 has ${user1Balance.toString()} tokens`);
        }
        if (user2Balance.gt(0)) {
          console.log(`  - User2 has ${user2Balance.toString()} tokens`);
        }
      }
    }

    console.log("\n🏆 All advanced tests completed successfully!");
    console.log("Your RWA1155 contract is ready for the Chiliz hackathon!");

  } catch (error) {
    console.error("❌ Advanced test failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
