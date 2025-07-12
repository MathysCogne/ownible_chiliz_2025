const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RWAManager", function () {
  let RWAManager;
  let rwaManager;
  let admin;
  let issuer;
  let buyer;
  let other;
  
  const BASE_URI = "https://api.example.com/metadata/";
  const SAMPLE_ASSET = {
    name: "Test Property",
    category: "Real Estate",
    valuation: ethers.parseEther("100"), // 100 ETH
    totalFragments: 1000,
    isNFT: false,
    isTransferable: true
  };

  beforeEach(async function () {
    [admin, issuer, buyer, other] = await ethers.getSigners();
    
    RWAManager = await ethers.getContractFactory("RWAManager");
    rwaManager = await RWAManager.deploy(BASE_URI);
    await rwaManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      expect(await rwaManager.admin()).to.equal(admin.address);
    });

    it("Should set the base URI", async function () {
      expect(await rwaManager.baseURI()).to.equal(BASE_URI);
    });

    it("Should authorize the admin as issuer", async function () {
      expect(await rwaManager.authorizedIssuers(admin.address)).to.be.true;
    });

    it("Should initialize asset count to 0", async function () {
      expect(await rwaManager.getAssetCount()).to.equal(0);
    });
  });

  describe("Authorization Management", function () {
    it("Should allow admin to add authorized issuer", async function () {
      await rwaManager.connect(admin).addAuthorizedIssuer(issuer.address);
      expect(await rwaManager.authorizedIssuers(issuer.address)).to.be.true;
    });

    it("Should allow admin to remove authorized issuer", async function () {
      await rwaManager.connect(admin).addAuthorizedIssuer(issuer.address);
      await rwaManager.connect(admin).removeAuthorizedIssuer(issuer.address);
      expect(await rwaManager.authorizedIssuers(issuer.address)).to.be.false;
    });

    it("Should revert when non-admin tries to add issuer", async function () {
      await expect(
        rwaManager.connect(other).addAuthorizedIssuer(issuer.address)
      ).to.be.revertedWith("Not admin");
    });

    it("Should revert when non-admin tries to remove issuer", async function () {
      await expect(
        rwaManager.connect(other).removeAuthorizedIssuer(issuer.address)
      ).to.be.revertedWith("Not admin");
    });
  });

  describe("Asset Creation", function () {
    it("Should create asset successfully", async function () {
      await expect(
        rwaManager.connect(admin).createAsset(
          SAMPLE_ASSET.name,
          SAMPLE_ASSET.category,
          SAMPLE_ASSET.valuation,
          SAMPLE_ASSET.totalFragments,
          SAMPLE_ASSET.isNFT,
          SAMPLE_ASSET.isTransferable
        )
      ).to.emit(rwaManager, "AssetCreated")
        .withArgs(1, SAMPLE_ASSET.name, SAMPLE_ASSET.valuation);
    });

    it("Should increment asset count", async function () {
      await rwaManager.connect(admin).createAsset(
        SAMPLE_ASSET.name,
        SAMPLE_ASSET.category,
        SAMPLE_ASSET.valuation,
        SAMPLE_ASSET.totalFragments,
        SAMPLE_ASSET.isNFT,
        SAMPLE_ASSET.isTransferable
      );
      
      expect(await rwaManager.getAssetCount()).to.equal(1);
    });

    it("Should store asset data correctly", async function () {
      await rwaManager.connect(admin).createAsset(
        SAMPLE_ASSET.name,
        SAMPLE_ASSET.category,
        SAMPLE_ASSET.valuation,
        SAMPLE_ASSET.totalFragments,
        SAMPLE_ASSET.isNFT,
        SAMPLE_ASSET.isTransferable
      );

      const asset = await rwaManager.assets(1);
      expect(asset.name).to.equal(SAMPLE_ASSET.name);
      expect(asset.category).to.equal(SAMPLE_ASSET.category);
      expect(asset.valuation).to.equal(SAMPLE_ASSET.valuation);
      expect(asset.totalFragments).to.equal(SAMPLE_ASSET.totalFragments);
      expect(asset.isNFT).to.equal(SAMPLE_ASSET.isNFT);
      expect(asset.isTransferable).to.equal(SAMPLE_ASSET.isTransferable);
      expect(asset.remainingFragments).to.equal(SAMPLE_ASSET.totalFragments);
      expect(asset.owner).to.equal(ethers.ZeroAddress);
    });

    it("Should revert with invalid parameters", async function () {
      await expect(
        rwaManager.connect(admin).createAsset(
          SAMPLE_ASSET.name,
          SAMPLE_ASSET.category,
          0, // Invalid valuation
          SAMPLE_ASSET.totalFragments,
          SAMPLE_ASSET.isNFT,
          SAMPLE_ASSET.isTransferable
        )
      ).to.be.revertedWith("Invalid parameters");

      await expect(
        rwaManager.connect(admin).createAsset(
          SAMPLE_ASSET.name,
          SAMPLE_ASSET.category,
          SAMPLE_ASSET.valuation,
          0, // Invalid fragments
          SAMPLE_ASSET.isNFT,
          SAMPLE_ASSET.isTransferable
        )
      ).to.be.revertedWith("Invalid parameters");
    });

    it("Should revert when unauthorized user tries to create asset", async function () {
      await expect(
        rwaManager.connect(other).createAsset(
          SAMPLE_ASSET.name,
          SAMPLE_ASSET.category,
          SAMPLE_ASSET.valuation,
          SAMPLE_ASSET.totalFragments,
          SAMPLE_ASSET.isNFT,
          SAMPLE_ASSET.isTransferable
        )
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Fragment Purchase", function () {
    beforeEach(async function () {
      await rwaManager.connect(admin).createAsset(
        SAMPLE_ASSET.name,
        SAMPLE_ASSET.category,
        SAMPLE_ASSET.valuation,
        SAMPLE_ASSET.totalFragments,
        SAMPLE_ASSET.isNFT,
        SAMPLE_ASSET.isTransferable
      );
    });

    it("Should buy fragments successfully", async function () {
      const fragmentAmount = 100;
      const expectedCost = (SAMPLE_ASSET.valuation * BigInt(fragmentAmount)) / BigInt(SAMPLE_ASSET.totalFragments);

      await expect(
        rwaManager.connect(buyer).buyFragments(1, fragmentAmount, {
          value: expectedCost
        })
      ).to.emit(rwaManager, "FragmentsPurchased")
        .withArgs(1, buyer.address, fragmentAmount);
    });

    it("Should update fragment balances correctly", async function () {
      const fragmentAmount = 100;
      const expectedCost = (SAMPLE_ASSET.valuation * BigInt(fragmentAmount)) / BigInt(SAMPLE_ASSET.totalFragments);

      await rwaManager.connect(buyer).buyFragments(1, fragmentAmount, {
        value: expectedCost
      });

      expect(await rwaManager.getFragmentBalance(1, buyer.address)).to.equal(fragmentAmount);
      expect(await rwaManager.balanceOf(buyer.address, 1)).to.equal(fragmentAmount);
    });

    it("Should update remaining fragments", async function () {
      const fragmentAmount = 100;
      const expectedCost = (SAMPLE_ASSET.valuation * BigInt(fragmentAmount)) / BigInt(SAMPLE_ASSET.totalFragments);

      await rwaManager.connect(buyer).buyFragments(1, fragmentAmount, {
        value: expectedCost
      });

      const asset = await rwaManager.assets(1);
      expect(asset.remainingFragments).to.equal(SAMPLE_ASSET.totalFragments - fragmentAmount);
    });

    it("Should refund overpayment", async function () {
      const fragmentAmount = 100;
      const expectedCost = (SAMPLE_ASSET.valuation * BigInt(fragmentAmount)) / BigInt(SAMPLE_ASSET.totalFragments);
      const overpayment = ethers.parseEther("1");

      const initialBalance = await ethers.provider.getBalance(buyer.address);
      const tx = await rwaManager.connect(buyer).buyFragments(1, fragmentAmount, {
        value: expectedCost + overpayment
      });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const finalBalance = await ethers.provider.getBalance(buyer.address);

      expect(finalBalance).to.equal(initialBalance - expectedCost - gasUsed);
    });

    it("Should revert with insufficient payment", async function () {
      const fragmentAmount = 100;
      const expectedCost = (SAMPLE_ASSET.valuation * BigInt(fragmentAmount)) / BigInt(SAMPLE_ASSET.totalFragments);

      await expect(
        rwaManager.connect(buyer).buyFragments(1, fragmentAmount, {
          value: expectedCost - 1n
        })
      ).to.be.revertedWith("Underpayment");
    });

    it("Should revert when buying more fragments than available", async function () {
      const fragmentAmount = SAMPLE_ASSET.totalFragments + 1;
      const expectedCost = (SAMPLE_ASSET.valuation * BigInt(fragmentAmount)) / BigInt(SAMPLE_ASSET.totalFragments);

      await expect(
        rwaManager.connect(buyer).buyFragments(1, fragmentAmount, {
          value: expectedCost
        })
      ).to.be.revertedWith("Not enough fragments");
    });

    it("Should revert when asset is not transferable", async function () {
      // Create non-transferable asset
      await rwaManager.connect(admin).createAsset(
        "Non-transferable Asset",
        "Test Category",
        ethers.parseEther("50"),
        500,
        false,
        false // Not transferable
      );

      const fragmentAmount = 10;
      const expectedCost = (ethers.parseEther("50") * BigInt(fragmentAmount)) / BigInt(500);

      await expect(
        rwaManager.connect(buyer).buyFragments(2, fragmentAmount, {
          value: expectedCost
        })
      ).to.be.revertedWith("Asset not transferable");
    });
  });

  describe("Full Ownership Purchase", function () {
    beforeEach(async function () {
      await rwaManager.connect(admin).createAsset(
        SAMPLE_ASSET.name,
        SAMPLE_ASSET.category,
        SAMPLE_ASSET.valuation,
        SAMPLE_ASSET.totalFragments,
        SAMPLE_ASSET.isNFT,
        SAMPLE_ASSET.isTransferable
      );
    });

    it("Should buy full ownership successfully", async function () {
      await rwaManager.connect(buyer).buyFullOwnership(1, {
        value: SAMPLE_ASSET.valuation
      });

      const asset = await rwaManager.assets(1);
      expect(asset.owner).to.equal(buyer.address);
      expect(asset.remainingFragments).to.equal(0);
      expect(await rwaManager.balanceOf(buyer.address, 1)).to.equal(SAMPLE_ASSET.totalFragments);
    });

    it("Should refund overpayment for full ownership", async function () {
      const overpayment = ethers.parseEther("10");
      const initialBalance = await ethers.provider.getBalance(buyer.address);
      
      const tx = await rwaManager.connect(buyer).buyFullOwnership(1, {
        value: SAMPLE_ASSET.valuation + overpayment
      });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const finalBalance = await ethers.provider.getBalance(buyer.address);

      expect(finalBalance).to.equal(initialBalance - SAMPLE_ASSET.valuation - gasUsed);
    });

    it("Should revert with insufficient payment for full ownership", async function () {
      await expect(
        rwaManager.connect(buyer).buyFullOwnership(1, {
          value: SAMPLE_ASSET.valuation - 1n
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should revert when asset already has owner", async function () {
      await rwaManager.connect(buyer).buyFullOwnership(1, {
        value: SAMPLE_ASSET.valuation
      });

      await expect(
        rwaManager.connect(other).buyFullOwnership(1, {
          value: SAMPLE_ASSET.valuation
        })
      ).to.be.revertedWith("Already owned");
    });

    it("Should revert when fragments already sold", async function () {
      const fragmentAmount = 100;
      const expectedCost = (SAMPLE_ASSET.valuation * BigInt(fragmentAmount)) / BigInt(SAMPLE_ASSET.totalFragments);

      await rwaManager.connect(buyer).buyFragments(1, fragmentAmount, {
        value: expectedCost
      });

      await expect(
        rwaManager.connect(other).buyFullOwnership(1, {
          value: SAMPLE_ASSET.valuation
        })
      ).to.be.revertedWith("Fragments already sold");
    });
  });

  describe("Multiple Assets", function () {
    it("Should handle multiple assets correctly", async function () {
      // Create first asset
      await rwaManager.connect(admin).createAsset(
        "Asset 1",
        "Category 1",
        ethers.parseEther("100"),
        1000,
        false,
        true
      );

      // Create second asset
      await rwaManager.connect(admin).createAsset(
        "Asset 2",
        "Category 2",
        ethers.parseEther("200"),
        2000,
        true,
        false
      );

      expect(await rwaManager.getAssetCount()).to.equal(2);

      const asset1 = await rwaManager.assets(1);
      const asset2 = await rwaManager.assets(2);

      expect(asset1.name).to.equal("Asset 1");
      expect(asset2.name).to.equal("Asset 2");
      expect(asset1.valuation).to.equal(ethers.parseEther("100"));
      expect(asset2.valuation).to.equal(ethers.parseEther("200"));
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero fragment purchase attempt", async function () {
      await rwaManager.connect(admin).createAsset(
        SAMPLE_ASSET.name,
        SAMPLE_ASSET.category,
        SAMPLE_ASSET.valuation,
        SAMPLE_ASSET.totalFragments,
        SAMPLE_ASSET.isNFT,
        SAMPLE_ASSET.isTransferable
      );

      await expect(
        rwaManager.connect(buyer).buyFragments(1, 0, { value: 0 })
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should handle non-existent asset queries", async function () {
      const asset = await rwaManager.assets(999);
      expect(asset.name).to.equal("");
      expect(asset.valuation).to.equal(0);
    });
  });
});