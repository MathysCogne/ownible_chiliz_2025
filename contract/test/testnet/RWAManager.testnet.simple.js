const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("RWAManager - Testnet Tests (Single Signer)", function () {
  let rwaManager;
  let deployer;
  
  // ⚠️ REMPLACER PAR VOTRE ADRESSE DE CONTRAT DEPLOYÉ
  const CONTRACT_ADDRESS = "0x...";
  
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
    
    [deployer] = await ethers.getSigners();
    
    console.log("🧑 Deployer:", deployer.address);
    
    // Vérifier la balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "CHZ");
    
    // Vérifier que CONTRACT_ADDRESS est défini
    if (CONTRACT_ADDRESS === "0x...") {
      throw new Error("❌ Please set CONTRACT_ADDRESS in the test file!");
    }
    
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
      expect(contractAdmin).to.equal(deployer.address);
    });

    it("Should have correct base URI", async function () {
      const baseURI = await rwaManager.baseURI();
      expect(baseURI).to.equal("https://api.ownible.com/metadata/");
    });

    it("Should have admin as authorized issuer", async function () {
      const isAuthorized = await rwaManager.authorizedIssuers(deployer.address);
      expect(isAuthorized).to.be.true;
    });
  });

  describe("Testnet Asset Creation", function () {
    it("Should create asset on testnet", async function () {
      console.log("🚀 Creating asset on testnet...");
      
      const gasPrice = ethers.parseUnits("2501", "gwei");
      
      const tx = await rwaManager.connect(deployer).createAsset(
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
      console.log("📊 Asset count:", assetCount.toString());
      
      const asset = await rwaManager.assets(assetCount);
      expect(asset.name).to.equal(SAMPLE_ASSET.name);
      expect(asset.valuation).to.equal(SAMPLE_ASSET.valuation);
    });
  });

  describe("Testnet Fragment Purchase", function () {
    it("Should buy fragments on testnet", async function () {
      console.log("💸 Buying fragments on testnet...");
      
      const assetCount = await rwaManager.getAssetCount();
      const assetId = assetCount > 0 ? assetCount : 1;
      
      const fragmentAmount = 100;
      const asset = await rwaManager.assets(assetId);
      const expectedCost = (asset.valuation * BigInt(fragmentAmount)) / BigInt(SAMPLE_ASSET.totalFragments);
      const gasPrice = ethers.parseUnits("2501", "gwei");
      
      console.log("💰 Expected cost:", ethers.formatEther(expectedCost), "CHZ");
      
      const tx = await rwaManager.connect(deployer).buyFragments(assetId, fragmentAmount, {
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
      const balance = await rwaManager.getFragmentBalance(assetId, deployer.address);
      expect(balance).to.equal(fragmentAmount);
      
      const erc1155Balance = await rwaManager.balanceOf(deployer.address, assetId);
      expect(erc1155Balance).to.equal(fragmentAmount);
    });
  });
});