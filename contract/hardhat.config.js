require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    chilizTestnet: {
      url: "https://spicy-rpc.chiliz.com",
      accounts: [process.env.PRIVATE_KEY], // Assure-toi que c'est bien défini
      chainId: 88882,
      gasPrice: 2501000000000, // 2500 gwei
    },
  },
  etherscan: {
    apiKey: {
      chilizTestnet: "your-api-key-here" // Optionnel pour vérification
    }
  }
};