process.env.TENDERLY_AUTOMATIC_VERIFICATION = true
process.env.TENDERLY_AUTOMATIC_POPULATE_HARDHAT_VERIFY_CONFIG=true
require('@nomicfoundation/hardhat-toolbox')
require("@openzeppelin/hardhat-upgrades");
require("@nomicfoundation/hardhat-ethers");
const tdly = require('@tenderly/hardhat-tenderly');
require("hardhat-diamond-abi");
require("hardhat-storage-layout-changes");

tdly.setup();

task("hello", "Prints 'Hello, World!'", async function(taskArguments, hre, runSuper) {
  console.log("Hello, World!");
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
      },
      viaIR: true,
    }
  },
  tenderly: {
    username: "guyuxiang" ?? "error",
    project: "projectname",
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
      url: 'https://polygon-mainnet.infura.io/v3/ee88ccbf873149e6b94a8ef88dd99878',
      gasPrice: 250000000000,
      accounts: [
        ''
      ]
    },
    polygon_amoy: {
      url: 'https://polygon-amoy.gateway.tenderly.co/5tC8uoCQ2JIDDa1xfoKjCS',
      chainId: 80002,
      accounts: [
        ''
      ]
    },
    linea_sepolia: {
      url: 'https://linea-sepolia.infura.io/v3/4643ae7604804747b39480b919af22cb',
      chainId: 59141,
      accounts: [
        ''
      ],
      gasPrice: 50000000000
    }
  },
  etherscan: {
    apiKey: {
      lineaSepolia: 'Y8IXDIWF2T11X3SDPXJJWHJYJQD2SYXCDE',
      polygonAmoy: '9WBYENCEWEZCBMURJUQ6M724NVZAQFTAA5'
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
