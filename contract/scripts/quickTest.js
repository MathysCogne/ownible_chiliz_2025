const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Test Rapide du Contrat RWA Manager");
  
  // Déployer le contrat
  const [owner, issuer, buyer1, buyer2] = await ethers.getSigners();
  const RWAManager = await ethers.getContractFactory("RWAManager");
  const rwaManager = await RWAManager.deploy("https://api.test.com/metadata/");
  await rwaManager.waitForDeployment();
  
  console.log("📍 Contrat déployé:", await rwaManager.getAddress());
  
  // Ajouter l'émetteur
  await rwaManager.addAuthorizedIssuer(issuer.address);
  console.log("✅ Émetteur ajouté");
  
  // Créer un asset
  await rwaManager.connect(issuer).createAsset(
    "Test Music Asset",
    "ipfs://QmTest123",
    "music",
    ethers.parseEther("100"), // 100 CHZ
    true,  // fongible
    true,  // transférable
    1000   // 1000 fragments
  );
  console.log("🎵 Asset musical créé");
  
  // Acheter des fragments
  await rwaManager.connect(buyer1).purchaseFragments(1, 100, {
    value: ethers.parseEther("10") // 10 CHZ
  });
  console.log("💰 Fragments achetés par buyer1");
  
  // Vérifier les balances
  const balance = await rwaManager.balanceOf(buyer1.address, 1);
  console.log("📊 Balance buyer1:", balance.toString());
  
  // Acheter la propriété complète d'un autre asset
  await rwaManager.connect(issuer).createAsset(
    "Exclusive Art NFT",
    "ipfs://QmArt456",
    "art",
    ethers.parseEther("50"), // 50 CHZ
    false, // non-fongible
    true,  // transférable
    1      // 1 token unique
  );
  
  await rwaManager.connect(buyer2).purchaseFullOwnership(2, {
    value: ethers.parseEther("50")
  });
  console.log("🎨 Propriété complète achetée par buyer2");
  
  // Statistiques
  const stats = await rwaManager.getContractStats();
  console.log("📈 Statistiques:", {
    totalAssets: stats.totalAssets.toString(),
    totalOwnerships: stats.totalOwnerships.toString(),
    activeAssets: stats.activeAssets.toString()
  });
  
  console.log("✅ Test rapide terminé avec succès!");
}

main().catch(console.error);