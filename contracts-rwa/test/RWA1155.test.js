const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RWA1155", function () {
  let RWA1155, rwa, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    RWA1155 = await ethers.getContractFactory("RWA1155");
    rwa = await RWA1155.deploy();
    await rwa.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await rwa.owner()).to.equal(owner.address);
    });

    it("Should support ERC1155 interface", async function () {
      expect(await rwa.supportsInterface("0xd9b67a26")).to.equal(true);
    });
  });

  describe("Minting", function () {
    it("Should mint RWA tokens to specified address", async function () {
      const metadataURI = "ipfs://QmTest/metadata.json";
      const rwaType = "music_right";
      const percent = 5;
      const amount = 10;

      await rwa.mintRWA(addr1.address, amount, rwaType, percent, metadataURI);

      expect(await rwa.balanceOf(addr1.address, 1)).to.equal(amount);
    });

    it("Should store correct RWA metadata", async function () {
      const metadataURI = "ipfs://QmTest/metadata.json";
      const rwaType = "music_right";
      const percent = 5;
      const amount = 10;

      await rwa.mintRWA(addr1.address, amount, rwaType, percent, metadataURI);

      const rwaData = await rwa.getRWA(1);
      expect(rwaData.rwaType).to.equal(rwaType);
      expect(rwaData.percent).to.equal(percent);
      expect(rwaData.metadataURI).to.equal(metadataURI);
    });

    it("Should return correct URI for token", async function () {
      const metadataURI = "ipfs://QmTest/metadata.json";
      const rwaType = "music_right";
      const percent = 5;
      const amount = 10;

      await rwa.mintRWA(addr1.address, amount, rwaType, percent, metadataURI);

      expect(await rwa.uri(1)).to.equal(metadataURI);
    });

    it("Should increment token IDs correctly", async function () {
      const metadataURI1 = "ipfs://QmTest1/metadata.json";
      const metadataURI2 = "ipfs://QmTest2/metadata.json";
      const rwaType = "music_right";
      const percent = 5;
      const amount = 10;

      await rwa.mintRWA(addr1.address, amount, rwaType, percent, metadataURI1);
      await rwa.mintRWA(addr1.address, amount, rwaType, percent, metadataURI2);

      expect(await rwa.balanceOf(addr1.address, 1)).to.equal(amount);
      expect(await rwa.balanceOf(addr1.address, 2)).to.equal(amount);
    });

    it("Should only allow owner to mint", async function () {
      const metadataURI = "ipfs://QmTest/metadata.json";
      const rwaType = "music_right";
      const percent = 5;
      const amount = 10;

      await expect(
        rwa.connect(addr1).mintRWA(addr1.address, amount, rwaType, percent, metadataURI)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("RWA Data Retrieval", function () {
    it("Should return correct RWA data for different token types", async function () {
      // Mint music rights
      await rwa.mintRWA(addr1.address, 10, "music_right", 5, "ipfs://music.json");
      
      // Mint property rights
      await rwa.mintRWA(addr1.address, 1, "property_right", 25, "ipfs://property.json");

      const musicRWA = await rwa.getRWA(1);
      const propertyRWA = await rwa.getRWA(2);

      expect(musicRWA.rwaType).to.equal("music_right");
      expect(musicRWA.percent).to.equal(5);
      expect(propertyRWA.rwaType).to.equal("property_right");
      expect(propertyRWA.percent).to.equal(25);
    });
  });

  describe("Batch Operations", function () {
    it("Should handle batch transfers correctly", async function () {
      // First mint some tokens
      await rwa.mintRWA(addr1.address, 10, "music_right", 5, "ipfs://music.json");
      await rwa.mintRWA(addr1.address, 5, "property_right", 10, "ipfs://property.json");

      // Batch transfer
      await rwa.connect(addr1).safeBatchTransferFrom(
        addr1.address,
        addr2.address,
        [1, 2],
        [5, 2],
        "0x"
      );

      expect(await rwa.balanceOf(addr1.address, 1)).to.equal(5);
      expect(await rwa.balanceOf(addr1.address, 2)).to.equal(3);
      expect(await rwa.balanceOf(addr2.address, 1)).to.equal(5);
      expect(await rwa.balanceOf(addr2.address, 2)).to.equal(2);
    });
  });
});
