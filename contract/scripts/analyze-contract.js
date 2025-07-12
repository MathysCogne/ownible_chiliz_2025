const { ethers } = require("hardhat");
const fs = require("fs");

async function analyzeContract() {
  console.log("🔍 Detailed RWAManager Analysis...");
  
  const RWAManager = await ethers.getContractFactory("RWAManager");
  
  // Analyse du bytecode
  const bytecode = RWAManager.bytecode;
  const deployedBytecode = RWAManager.deployedBytecode;
  const interface = RWAManager.interface;
  
  const creationSize = (bytecode.length - 2) / 2;
  const deployedSize = (deployedBytecode.length - 2) / 2;
  
  console.log("📊 SIZE ANALYSIS");
  console.log("═══════════════════════════════════════");
  console.log(`📦 Creation bytecode: ${creationSize.toLocaleString()} bytes`);
  console.log(`🚀 Deployed bytecode: ${deployedSize.toLocaleString()} bytes`);
  console.log(`📏 Size difference: ${(creationSize - deployedSize).toLocaleString()} bytes`);
  
  // Limites par réseau
  const limits = {
    ethereum: 24576,
    polygon: 24576,
    chiliz: 24576, // Même limite que Ethereum
    bsc: 24576
  };
  
  console.log("\n🌐 NETWORK COMPATIBILITY");
  console.log("═══════════════════════════════════════");
  Object.entries(limits).forEach(([network, limit]) => {
    const percentage = ((deployedSize / limit) * 100).toFixed(2);
    const remaining = limit - deployedSize;
    const status = deployedSize <= limit ? "✅" : "❌";
    console.log(`${status} ${network.toUpperCase()}: ${percentage}% (${remaining} bytes remaining)`);
  });
  
  // Analyse des fonctions
  console.log("\n🔧 FUNCTION ANALYSIS");
  console.log("═══════════════════════════════════════");
  const functions = Object.values(interface.functions);
  console.log(`📋 Total functions: ${functions.length}`);
  console.log(`🔒 View functions: ${functions.filter(f => f.stateMutability === 'view').length}`);
  console.log(`💰 Payable functions: ${functions.filter(f => f.stateMutability === 'payable').length}`);
  console.log(`✏️  Non-payable functions: ${functions.filter(f => f.stateMutability === 'nonpayable').length}`);
  
  // Analyse des events
  const events = Object.values(interface.events);
  console.log(`📢 Total events: ${events.length}`);
  
  // Suggestions d'optimisation
  console.log("\n💡 OPTIMIZATION SUGGESTIONS");
  console.log("═══════════════════════════════════════");
  
  if (deployedSize > 20000) {
    console.log("⚠️  Contract is large (>20KB). Consider:");
    console.log("   • Split into multiple contracts");
    console.log("   • Use libraries for common functions");
    console.log("   • Remove unused imports");
    console.log("   • Optimize string storage");
  }
  
  if (deployedSize > limits.ethereum) {
    console.log("🚨 Contract exceeds size limit! Actions needed:");
    console.log("   • MUST split contract");
    console.log("   • Use proxy pattern");
    console.log("   • Move logic to libraries");
  }
  
  // Sauvegarder l'analyse
  const analysis = {
    timestamp: new Date().toISOString(),
    creationSize,
    deployedSize,
    functions: functions.length,
    events: events.length,
    networkCompatibility: Object.entries(limits).map(([network, limit]) => ({
      network,
      compatible: deployedSize <= limit,
      usage: ((deployedSize / limit) * 100).toFixed(2) + '%'
    }))
  };
  
  fs.writeFileSync('contract-analysis.json', JSON.stringify(analysis, null, 2));
  console.log("\n💾 Analysis saved to contract-analysis.json");
}

analyzeContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Analysis failed:", error);
    process.exit(1);
  });