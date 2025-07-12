const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("RWAManager - Testnet Tests", function () {
  let rwaManager;
  let admin;
  let buyer;
  let other;
  
  // Adresse du contrat déployé sur testnet (à remplacer par votre adresse)
  const CONTRACT_ADDRESS = "0x6F8B7f23B72FAb6a30251bcD531A26800C038B89"; // Remplacer par l'adresse déployée
  
  const SAMPLE_ASSET = {
    name: "Testnet Property",
    category: "Real Estate",
    valuation: ethers.parseEther("100"),
    totalFragments: 1000,
    isNFT: false,
    isTransferable: true
  };

  before(async function () {
    console.log("🌐 Connecting to Chiliz Testnet...");
    
    [admin, buyer, other] = await ethers.getSigners();
    
    console.log("🧑 Admin:", admin.address);
    console.log("👤 Buyer:", buyer.address);
    console.log("👤 Other:", other.address);
    
    // Vérifier les balances
    const adminBalance = await ethers.provider.getBalance(admin.address);
    const buyerBalance = await ethers.provider.getBalance(buyer.address);
    
    console.log("💰 Admin Balance:", ethers.formatEther(adminBalance), "CHZ");
    console.log("💰 Buyer Balance:", ethers.formatEther(buyerBalance), "CHZ");
    
    // Connecter au contrat déployé
    const RWAManager = await ethers.getContractFactory("RWAManager");
    rwaManager = RWAManager.attach(CONTRACT_ADDRESS);
    
    console.log("📄 Contract connected:", await rwaManager.getAddress());
    
    // Vérifier la connexion
    const contractAdmin = await rwaManager.admin();
    console.log("🔍 Contract admin:", contractAdmin);
    console.log("✅ Connection successful!");
  });

  describe("Testnet Deployment Verification", function () {
    it("Should have correct admin", async function () {
      const contractAdmin = await rwaManager.admin();
      expect(contractAdmin).to.equal(admin.address);
    });

    it("Should have correct base URI", async function () {
      const baseURI = await rwaManager.baseURI();
      expect(baseURI).to.equal("https://api.ownible.com/metadata/");
    });

    it("Should have admin as authorized issuer", async function () {
      const isAuthorized = await rwaManager.authorizedIssuers(admin.address);
      expect(isAuthorized).to.be.true;
    });

    it("Should have zero assets initially", async function () {
      const assetCount = await rwaManager.getAssetCount();
      expect(assetCount).to.equal(0);
    });
  });

  describe("Testnet Asset Creation", function () {
    it("Should create asset on testnet", async function () {
      console.log("🚀 Creating asset on testnet...");
      
      const gasPrice = ethers.parseUnits("2501", "gwei");
      
      const tx = await rwaManager.connect(admin).createAsset(
        SAMPLE_ASSET.name,
        SAMPLE_ASSET.category,
        SAMPLE_ASSET.valuation,
        SAMPLE_ASSET.totalFragments,
        SAMPLE_ASSET.isNFT,
        SAMPLE_ASSET.isTransferable,
        {
          gasPrice: gasPrice,
          gasLimit: 500000
        }
      );
      
      console.log("📦 Transaction hash:", tx.hash);
      console.log("⏳ Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("✅ Asset created! Block:", receipt.blockNumber);
      
      expect(receipt.status).to.equal(1);
      
      // Vérifier l'asset créé
      const assetCount = await rwaManager.getAssetCount();
      expect(assetCount).to.equal(1);
      
      const asset = await rwaManager.assets(1);
      expect(asset.name).to.equal(SAMPLE_ASSET.name);
      expect(asset.valuation).to.equal(SAMPLE_ASSET.valuation);
    });

    it("Should emit AssetCreated event", async function () {
      // Créer un deuxième asset pour tester les events
      const gasPrice = ethers.parseUnits("2501", "gwei");
      
      await expect(
        rwaManager.connect(admin).createAsset(
          "Second Asset",
          "Test Category",
          ethers.parseEther("50"),
          500,
          false,
          true,
          {
            gasPrice: gasPrice,
            gasLimit: 500000
          }
        )
      ).to.emit(rwaManager, "AssetCreated");
    });
  });

  describe("Testnet Fragment Purchase", function () {
    it("Should buy fragments on testnet", async function () {
      console.log("💸 Buying fragments on testnet...");
      
      const fragmentAmount = 100;
      const expectedCost = (SAMPLE_ASSET.valuation * BigInt(fragmentAmount)) / BigInt(SAMPLE_ASSET.totalFragments);
      const gasPrice = ethers.parseUnits("2501", "gwei");
      
      console.log("💰 Expected cost:", ethers.formatEther(expectedCost), "CHZ");
      
      const tx = await rwaManager.connect(buyer).buyFragments(1, fragmentAmount, {
        value: expectedCost,
        gasPrice: gasPrice,
        gasLimit: 300000
      });
      
      console.log("📦 Transaction hash:", tx.hash);
      console.log("⏳ Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("✅ Fragments purchased! Block:", receipt.blockNumber);
      
      expect(receipt.status).to.equal(1);
      
      // Vérifier les balances
      const balance = await rwaManager.getFragmentBalance(1, buyer.address);
      expect(balance).to.equal(fragmentAmount);
      
      const erc1155Balance = await rwaManager.balanceOf(buyer.address, 1);
      expect(erc1155Balance).to.equal(fragmentAmount);
    });

    it("Should handle overpayment correctly", async function () {
      const fragmentAmount = 50;
      const expectedCost = (SAMPLE_ASSET.valuation * BigInt(fragmentAmount)) / BigInt(SAMPLE_ASSET.totalFragments);
      const overpayment = ethers.parseEther("1");
      const gasPrice = ethers.parseUnits("2501", "gwei");
      
      const initialBalance = await ethers.provider.getBalance(other.address);
      
      const tx = await rwaManager.connect(other).buyFragments(1, fragmentAmount, {
        value: expectedCost + overpayment,
        gasPrice: gasPrice,
        gasLimit: 300000
      });
      
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * gasPrice;
      const finalBalance = await ethers.provider.getBalance(other.address);
      
      // Vérifier que l'overpayment a été remboursé
      const expectedFinalBalance = initialBalance - expectedCost - gasUsed;
      expect(finalBalance).to.be.closeTo(expectedFinalBalance, ethers.parseEther("0.001"));
    });
  });

  describe("Testnet Full Ownership", function () {
    it("Should buy full ownership on testnet", async function () {
      console.log("🏠 Buying full ownership on testnet...");
      
      // Créer un nouvel asset pour l'ownership complet
      const gasPrice = ethers.parseUnits("2501", "gwei");
      
      await rwaManager.connect(admin).createAsset(
        "Full Ownership Asset",
        "Premium",
        ethers.parseEther("200"),
        2000,
        false,
        true,
        {
          gasPrice: gasPrice,
          gasLimit: 500000
        }
      );
      
      const assetId = await rwaManager.getAssetCount();
      const asset = await rwaManager.assets(assetId);
      
      console.log("💰 Asset valuation:", ethers.formatEther(asset.valuation), "CHZ");
      
      const tx = await rwaManager.connect(buyer).buyFullOwnership(assetId, {
        value: asset.valuation,
        gasPrice: gasPrice,
        gasLimit: 400000
      });
      
      console.log("📦 Transaction hash:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Full ownership purchased! Block:", receipt.blockNumber);
      
      // Vérifier l'ownership
      const updatedAsset = await rwaManager.assets(assetId);
      expect(updatedAsset.owner).to.equal(buyer.address);
      expect(updatedAsset.remainingFragments).to.equal(0);
      
      const balance = await rwaManager.balanceOf(buyer.address, assetId);
      expect(balance).to.equal(asset.totalFragments);
    });
  });

  describe("Testnet Gas Analysis", function () {
    it("Should analyze gas consumption", async function () {
      console.log("\n📊 Gas Analysis:");
      
      const gasPrice = ethers.parseUnits("2501", "gwei");
      
      // Asset creation
      const createTx = await rwaManager.connect(admin).createAsset(
        "Gas Test Asset",
        "Test",
        ethers.parseEther("10"),
        100,
        false,
        true,
        {
          gasPrice: gasPrice,
          gasLimit: 500000
        }
      );
      
      const createReceipt = await createTx.wait();
      console.log("- Asset Creation Gas:", createReceipt.gasUsed.toString());
      console.log("- Asset Creation Cost:", ethers.formatEther(createReceipt.gasUsed * gasPrice), "CHZ");
      
      // Fragment purchase
      const assetId = await rwaManager.getAssetCount();
      const buyTx = await rwaManager.connect(buyer).buyFragments(assetId, 10, {
        value: ethers.parseEther("1"),
        gasPrice: gasPrice,
        gasLimit: 300000
      });
      
      const buyReceipt = await buyTx.wait();
      console.log("- Fragment Purchase Gas:", buyReceipt.gasUsed.toString());
      console.log("- Fragment Purchase Cost:", ethers.formatEther(buyReceipt.gasUsed * gasPrice), "CHZ");
    });
  });

  describe("Testnet Network Conditions", function () {
    it("Should handle network latency", async function () {
      console.log("🌐 Testing network conditions...");
      
      const startTime = Date.now();
      
      const assetCount = await rwaManager.getAssetCount();
      console.log("📊 Current asset count:", assetCount.toString());
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      console.log("⏱️ Network latency:", latency, "ms");
      expect(latency).to.be.lessThan(10000); // Max 10 seconds
    });

    it("Should verify block time", async function () {
      const block1 = await ethers.provider.getBlock("latest");
      
      // Attendre le prochain block
      console.log("⏳ Waiting for next block...");
      await new Promise(resolve => setTimeout(resolve, 6000)); // 6 secondes
      
      const block2 = await ethers.provider.getBlock("latest");
      const blockTime = block2.timestamp - block1.timestamp;
      
      console.log("⏰ Block time:", blockTime, "seconds");
      expect(blockTime).to.be.greaterThan(0);
      expect(blockTime).to.be.lessThan(30); // Max 30 seconds entre blocks
    });
  });
});