require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    chilizTestnet: {
      url: process.env.CHILIZ_RPC_URL || "https://spicy-rpc.chiliz.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 2501000000000, // 2501 gwei
      timeout: 60000,
      chainId: 88882
    }
  },
  mocha: {
    timeout: 120000 // 2 minutes timeout pour les tests testnet
  }
};