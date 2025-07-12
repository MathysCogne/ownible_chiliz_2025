const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Starting RWAManager Features Test on Chiliz Testnet...\n");

    // Configuration du contrat déployé
    const contractAddress = "0xEA8f4aF8f1D127f13837a4159FF97fE09C414F7D";
    const [deployer] = await ethers.getSigners();

    console.log("📋 Test Configuration:");
    console.log("   Contract Address:", contractAddress);
    console.log("   Deployer:", deployer.address);
    console.log("   Network: Chiliz Testnet\n");

    // Vérifier le solde du deployer
    const deployerBalance = await ethers.provider.getBalance(deployer.address);
    console.log("   💰 Deployer Balance:", ethers.formatEther(deployerBalance), "CHZ");

    // Configuration gas optimisée pour Chiliz
    const gasPrice = ethers.parseUnits("2500", "gwei");
    console.log("   ⚡ Gas Price:", ethers.formatUnits(gasPrice, "gwei"), "gwei");

    // Connexion au contrat
    const RWAManager = await ethers.getContractFactory("RWAManager");
    const rwaManager = RWAManager.attach(contractAddress);

    try {
        // 1. Test des fonctions de base
        console.log("\n1️⃣ Testing Basic Contract Functions...");
        
        const admin = await rwaManager.admin();
        const baseURI = await rwaManager.baseURI();
        const assetCount = await rwaManager.getAssetCount();
        
        console.log("   ✅ Admin:", admin);
        console.log("   ✅ Base URI:", baseURI);
        console.log("   ✅ Current Asset Count:", assetCount.toString());
        
        // 2. Test d'autorisation
        console.log("\n2️⃣ Testing Authorization...");
        
        const isDeployerAuthorized = await rwaManager.authorizedIssuers(deployer.address);
        console.log("   ✅ Deployer authorized:", isDeployerAuthorized);

        // 3. Test de création d'assets avec retry
        console.log("\n3️⃣ Testing Asset Creation...");
        
        // Asset 1: Stadium Share (Transferable)
        console.log("   📦 Creating Asset 1: Stadium Share...");
        
        try {
            const createTx1 = await rwaManager.createAsset(
                "FC Barcelona Stadium Share",
                "Sports Infrastructure",
                ethers.parseEther("100"), // 100 CHZ
                1000, // 1000 fragments
                false, // not NFT
                true,  // transferable
                { 
                    gasLimit: 800000,
                    gasPrice: gasPrice
                }
            );
            
            console.log("   ⏳ Transaction sent:", createTx1.hash);
            console.log("   ⏳ Waiting for confirmation...");
            
            const receipt1 = await createTx1.wait();
            console.log("   ✅ Asset 1 created! Gas used:", receipt1.gasUsed.toString());
            
        } catch (error) {
            console.error("   ❌ Failed to create Asset 1:", error.message);
            
            // Essayer avec des paramètres plus petits
            console.log("   🔄 Retrying with smaller parameters...");
            try {
                const createTx1Retry = await rwaManager.createAsset(
                    "Small Stadium Share",
                    "Sports",
                    ethers.parseEther("10"), // 10 CHZ
                    100, // 100 fragments
                    false,
                    true,
                    { 
                        gasLimit: 600000,
                        gasPrice: gasPrice
                    }
                );
                
                console.log("   ⏳ Retry transaction sent:", createTx1Retry.hash);
                const retryReceipt = await createTx1Retry.wait();
                console.log("   ✅ Asset 1 created on retry! Gas used:", retryReceipt.gasUsed.toString());
                
            } catch (retryError) {
                console.error("   ❌ Retry also failed:", retryError.message);
                throw retryError;
            }
        }

        // Asset 2: Real Estate (plus petit)
        console.log("   📦 Creating Asset 2: Real Estate...");
        
        try {
            const createTx2 = await rwaManager.createAsset(
                "Miami Condo",
                "Real Estate",
                ethers.parseEther("50"), // 50 CHZ
                500, // 500 fragments
                false,
                true,
                { 
                    gasLimit: 600000,
                    gasPrice: gasPrice
                }
            );
            
            console.log("   ⏳ Transaction sent:", createTx2.hash);
            const receipt2 = await createTx2.wait();
            console.log("   ✅ Asset 2 created! Gas used:", receipt2.gasUsed.toString());
            
        } catch (error) {
            console.error("   ❌ Failed to create Asset 2:", error.message);
            console.log("   🔄 Continuing with existing assets...");
        }

        // 4. Vérifier les assets créés
        console.log("\n4️⃣ Verifying Created Assets...");
        
        const newAssetCount = await rwaManager.getAssetCount();
        console.log("   📊 Total Assets:", newAssetCount.toString());

        if (newAssetCount > 0) {
            for (let i = 1; i <= newAssetCount; i++) {
                try {
                    const asset = await rwaManager.assets(i);
                    console.log(`   📋 Asset ${i}:`);
                    console.log(`      Name: ${asset.name}`);
                    console.log(`      Category: ${asset.category}`);
                    console.log(`      Valuation: ${ethers.formatEther(asset.valuation)} CHZ`);
                    console.log(`      Total Fragments: ${asset.totalFragments}`);
                    console.log(`      Remaining Fragments: ${asset.remainingFragments}`);
                    console.log(`      Is NFT: ${asset.isNFT}`);
                    console.log(`      Is Transferable: ${asset.isTransferable}`);
                    console.log(`      Fragment Price: ${ethers.formatEther(asset.valuation / asset.totalFragments)} CHZ`);
                } catch (error) {
                    console.error(`   ❌ Error reading asset ${i}:`, error.message);
                }
            }
        }

        // 5. Test d'achat de fragments (seulement si on a des assets)
        if (newAssetCount > 0) {
            console.log("\n5️⃣ Testing Fragment Purchase...");
            
            try {
                const asset1 = await rwaManager.assets(1);
                const fragmentPrice = asset1.valuation / asset1.totalFragments;
                const fragmentsToBuy = 5n;
                const totalCost = fragmentPrice * fragmentsToBuy;
                
                console.log(`   💰 Buying ${fragmentsToBuy} fragments of Asset 1...`);
                console.log(`   💸 Total cost: ${ethers.formatEther(totalCost)} CHZ`);
                
                const buyTx = await rwaManager.buyFragments(1, fragmentsToBuy, {
                    value: totalCost,
                    gasLimit: 400000,
                    gasPrice: gasPrice
                });
                
                console.log("   ⏳ Purchase transaction sent:", buyTx.hash);
                const buyReceipt = await buyTx.wait();
                console.log("   ✅ Fragments purchased! Gas used:", buyReceipt.gasUsed.toString());

                // Vérifier le solde
                const fragmentBalance = await rwaManager.getFragmentBalance(1, deployer.address);
                console.log(`   📊 Fragment balance: ${fragmentBalance}`);
                
            } catch (error) {
                console.error("   ❌ Fragment purchase failed:", error.message);
            }
        }

        // 6. Test d'autorisation
        console.log("\n6️⃣ Testing Authorization Management...");
        
        try {
            const testAddress = ethers.Wallet.createRandom().address;
            console.log(`   🔧 Adding test address: ${testAddress.slice(0, 10)}...`);
            
            const addTx = await rwaManager.addAuthorizedIssuer(testAddress, {
                gasLimit: 100000,
                gasPrice: gasPrice
            });
            await addTx.wait();
            
            const isAuthorized = await rwaManager.authorizedIssuers(testAddress);
            console.log(`   ✅ Test address authorized: ${isAuthorized}`);
            
        } catch (error) {
            console.error("   ❌ Authorization test failed:", error.message);
        }

        // 7. Résumé final
        console.log("\n🎉 Test Summary:");
        console.log("================");
        
        const finalAssetCount = await rwaManager.getAssetCount();
        const finalBalance = await ethers.provider.getBalance(deployer.address);
        
        console.log(`📊 Total Assets: ${finalAssetCount}`);
        console.log(`💰 Final Balance: ${ethers.formatEther(finalBalance)} CHZ`);
        console.log(`💸 CHZ Spent: ${ethers.formatEther(deployerBalance - finalBalance)} CHZ`);
        
        console.log("\n✅ Test completed!");
        console.log("🔗 View contract: https://spicy-explorer.chiliz.com/address/" + contractAddress);

    } catch (error) {
        console.error("❌ Test failed:", error);
        console.error("Stack:", error.stack);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });