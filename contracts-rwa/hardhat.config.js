require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  solidity: "0.8.17",
  networks: {
    chiliz: {
      url: "https://spicy-rpc.chiliz.com",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
