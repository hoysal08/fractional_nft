require("@nomiclabs/hardhat-ethers");
const fs = require('fs');
require('solidity-coverage')
require('dotenv').config()
require("@nomiclabs/hardhat-etherscan");


const { API_URL, PRIVATE_KEY,ETH_SCAN_API_KEY } = process.env

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    goerli: {
      url: API_URL,
      accounts: [ PRIVATE_KEY] 
    }
  },
  etherscan: {
    apiKey: ETH_SCAN_API_KEY,
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};