const generateDummyContract  = require('../flowCli/generateDummyContract')
const ethers = require('ethers5')
const fs = require('fs')

module.exports.generateDttDummyContractFromABI = async function generateDttDummyContractFromABI(){
  const abiPath = "./artifacts/hardhat-diamond-abi/HardhatDiamondABI.sol/DiamondFull.json";

  const { abi } = JSON.parse(fs.readFileSync(abiPath, "utf8"));

  if (!abi) {
    throw new Error("missing abi path");
  }

  const contract = new ethers.Contract(ethers.constants.AddressZero, abi);

  const contractString = generateDummyContract.generateDummyContract([contract], {});

  fs.writeFileSync(
    "./contracts/endPoint/DummyDiamondImplementation.sol",
    contractString,
  );
};