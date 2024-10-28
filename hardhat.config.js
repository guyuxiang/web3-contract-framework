require('@nomicfoundation/hardhat-toolbox')
require("@nomicfoundation/hardhat-foundry");
require("hardhat-forta");
require("@openzeppelin/hardhat-upgrades");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-diamond-abi");
require("hardhat-storage-layout-changes");
require('dotenv').config();
//const tdly = require('@tenderly/hardhat-tenderly');
//tdly.setup();

task("hello", "Prints 'Hello, World!'", async function(taskArguments, hre, runSuper) {
  console.log("Hello, World!");
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.27',
    settings: {
      optimizer: {
        enabled: true,
      },
      viaIR: true,
    }
  },
  tenderly: {
    username: "<username." ?? "error",
    project: "<projectname>",
    privateVerification: true
  },
  diamondAbi: {
    // (required) The name of your Diamond ABI.
    name: "DiamondFull",
    // (optional) An array of strings, matched against fully qualified contract names, to
    // determine which contracts are included in your Diamond ABI.
    include: [
    ],
    exclude: [
    ],
    filter: "function (abiElement, index, fullAbi, fullyQualifiedName) {return abiElement.name !== 'DS';}",
    strict: false
  },
  networks: {
    hardhat: {
      blockGasLimit: 50000000000
    },
    polygon: {
      url: process.env.RPC_API_KEY_POLYGON,
      gasPrice: 250000000000,
      accounts: [
        process.env.PRIVATE_KEY_POLYGON
      ]
    },
    polygon_amoy: {
      url: process.env.RPC_API_KEY_POLYGON_AMOY,
      chainId: 80002,
      accounts: [
        process.env.PRIVATE_KEY_POLYGON_AMOY
      ]
    },
    arbitrum_sepolia: {
      url: process.env.RPC_API_KEY_ARBITRUM_SEPOLIA,
      chainId: 421614,
      accounts: [
        process.env.PRIVATE_KEY_ARBITRUM_SEPOLIA
      ]
    },
    linea_sepolia: {
      url: process.env.RPC_API_KEY_LINEA_SEPOLIA,
      chainId: 59141,
      accounts: [
        process.env.PRIVATE_KEY_LINEA_SEPOLIA
      ],
      gasPrice: 50000000000
    }
  },
  etherscan: {
    apiKey: {
      lineaSepolia: process.env.ETHERSCAN_API_KEY_LINEA,
      polygonAmoy: process.env.ETHERSCAN_API_KEY_POLYGON,
      arbitrumSepolia: process.env.ETHERSCAN_API_KEY_ARBITRUM
    },
    customChains: [
      {
        network: "lineaSepolia",
        chainId: 59141,
        urls: {
          apiURL: "https://api-sepolia.lineascan.build/api",
          browserURL: "https://api-sepolia.lineascan.build"
        }
      }
    ]
  }
}
