const { ethers, upgrades } = require('hardhat')
const db = require('./db')
const hre = require("hardhat");
const { getSelectors, FacetCutAction } = require('./diamond.js')
const generateDummyContractFromABI = require("../others/runGenerateDummyFromABI");

module.exports.reOrganizeTokens = function reOrganizeTokens (tokenNames, tokenSymbols) {
  return tokenNames.map((name, index) => {
    return {
      name,
      symbol: tokenSymbols[index]
    }
  })
}

module.exports.deployContracts =  async function deployContracts(contractsToDeploy) {
  const address = await db.readAddress()
  const envParam = await db.readEnv()
  const depolyer = (await hre.ethers.provider.getSigner(0)).address
  function getParamValue (item) {
    let paramFactoryName = ''
    if (typeof item === "string" && item.includes('address.')) {
      paramFactoryName = item.split('.')[1]
      // console.log('paramAddress: ', paramAddress)
      return address[paramFactoryName].address
    } else if (typeof item === "string" && item.includes('config.')) {
      // console.log('envP: ', envP)
      return envParam[item.split('.')[1]]
    } else if (typeof item === "string" && item == 'deployer') {
      return depolyer
    }  else {
      return item
    }
  }

  function processDeployParam (deployParam) {
    let paramArray = []
    if (deployParam.length === 0) return paramArray
    for (let i in deployParam) {
      if (Array.isArray(deployParam[i])) {
        let subParamArray = []
        for (let k in deployParam[i]) {
          subParamArray = subParamArray.concat(getParamValue(deployParam[i][k]))
        }
        paramArray.push(subParamArray)
      } else {
        paramArray.push(getParamValue(deployParam[i]))
      }
    }
    return paramArray
  }

  const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 }

  for (let i = 0; i < contractsToDeploy.length; i++) {
    const contract = contractsToDeploy[i]
    const factory = await ethers.getContractFactory(contract.factoryName)
    let contractInstance
    if (contract.type === 'diamond') {
      // deploy DiamondCutFacet
      const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet')
      let diamondCutFacet = await DiamondCutFacet.deploy()
      diamondCutFacet = await diamondCutFacet.waitForDeployment()
      console.log('DiamondCutFacet deployed:', await diamondCutFacet.getAddress())
      // deploy Diamond
      console.log("Diamond deployer: ", (await hre.ethers.provider.getSigner(0)).address)
      let diamond = await factory.deploy((await hre.ethers.provider.getSigner(0)).address, await diamondCutFacet.getAddress())
      diamond = await diamond.waitForDeployment()
      console.log('Diamond deployed:', await diamond.getAddress())
      // deploy facets
      console.log('Deploying facets')
      let facetNames = contract.facetNames
      // 添加区块链浏览器认证合约
      facetNames.push("DiamondEtherscanFacet")
      // 添加放大镜合约
      facetNames.push("DiamondLoupeFacet")
      const cut = []
      for (const FacetName of facetNames) {
        const Facet = await ethers.getContractFactory(FacetName)
        let facet = await Facet.deploy()
        facet = await facet.waitForDeployment()
        console.log(`${FacetName} deployed:`, await facet.getAddress())
        if (FacetName == 'DiamondLoupeFacet' || FacetName == 'DiamondEtherscanFacet') {
          cut.push({
            facetAddress: await facet.getAddress(),
            action: FacetCutAction.Add,
            functionSelectors: getSelectors(facet)
          })
        } else {
          cut.push({
            facetAddress: await facet.getAddress(),
            action: FacetCutAction.Add,
            functionSelectors: getSelectors(facet).remove(['ds()'])
          })
        }
      }
      // cut diamond with facets
      console.log('Diamond Cut:', cut)
      const diamondCut = await ethers.getContractAt('IDiamondCut', await diamond.getAddress())
      let tx = await diamondCut.diamondCut(cut, ethers.ZeroAddress, '0x')
      console.log('Diamond cut tx: ', tx.hash)
      let receipt = await tx.wait()
      if (!receipt.status) {
        throw Error(`Diamond cut failed: ${tx.hash}`)
      }
      console.log('Completed diamond cut')
      address[contract.contractName].address = await diamond.getAddress()
      address[contract.contractName].sourceContractName = contract.factoryName
      address[contract.contractName].contractDeployTxBlockNumber = (await ethers.provider.getTransaction(diamond.deploymentTransaction().hash)).blockNumber
      address[contract.contractName].contractType = contract.type
      address[contract.contractName].facetContracts = []
      for (let i = 0; i<cut.length; i++) {
        address[contract.contractName].facetContracts.push({
          facetName: facetNames[i],
          address :cut[i].facetAddress
        })
      }
      address[contract.contractName].facetContracts.push({
        facetName: "DiamondCutFacet",
        address :await diamondCutFacet.getAddress()
      })
    } else if (contract.type === 'uups') {
      const param = processDeployParam(contract.deployParam)
      // console.log(contract.type +' param: ', param)
      const options = {
        initializer: 'initialize', kind: 'uups',
        redeployImplementation: 'always',
        timeout: 0
      }
      contractInstance =  contract.deployParam.length === 0 ? await upgrades.deployProxy(factory, options) : await upgrades.deployProxy(factory, param, options)
      contractInstance = await contractInstance.waitForDeployment()
      console.log(contract.contractName + ' proxy deployed to:', await contractInstance.getAddress())
      address[contract.contractName].address = await contractInstance.getAddress()
      address[contract.contractName].sourceContractName = contract.factoryName
      address[contract.contractName].contractDeployTxBlockNumber = (await ethers.provider.getTransaction(contractInstance.deploymentTransaction().hash)).blockNumber
      address[contract.contractName].contractType = contract.type
    } else if (contract.type === 'normal') {
      const param = processDeployParam(contract.deployParam)
      console.log('deploy param: ', param)
      contractInstance = await factory.deploy(...param)
      contractInstance = await contractInstance.waitForDeployment()
      console.log(contract.contractName + ' proxy deployed to:', await contractInstance.getAddress())
      address[contract.contractName].address = await contractInstance.getAddress()
      address[contract.contractName].sourceContractName = contract.factoryName
      address[contract.contractName].contractDeployTxBlockNumber = (await ethers.provider.getTransaction(contractInstance.deploymentTransaction().hash)).blockNumber
      address[contract.contractName].contractType = contract.type
    }
  }

  await db.write(address);
}

module.exports.upgradeContracts =  async function upgradeContracts(contractsToUpgrade) {
  const address = await db.readAddress()
  const envParam = await db.readEnv()
  function getParamValue (item) {
    let paramFactoryName = ''
    if (item.includes('address.')) {
      paramFactoryName = item.split('.')[1]
      // console.log('paramAddress: ', paramAddress)
      return address[paramFactoryName].address
    } else if (item.includes('config.')) {
      // console.log('envP: ', envP)
      return envParam[item.split('.')[1]]
    } else {
      return item
    }
  }

  function processDeployParam (deployParam) {
    let paramArray = []
    if (deployParam.length === 0) return paramArray
    for (let i in deployParam) {
      if (Array.isArray(deployParam[i])) {
        let subParamArray = []
        for (let k in deployParam[i]) {
          subParamArray = subParamArray.concat(getParamValue(deployParam[i][k]))
        }
        paramArray.push(subParamArray)
      } else {
        paramArray.push(getParamValue(deployParam[i]))
      }
    }
    return paramArray
  }

  for (let i = 0; i < contractsToUpgrade.length; i++) {
    const contract = contractsToUpgrade[i]
    if (contract.type == 'uups') {
      const factory = await ethers.getContractFactory(contract.factoryName)
      await upgrades.forceImport(address[contract.contractName].address, factory, {kind: "uups"});
      const contractInstance = await upgrades.upgradeProxy(
          address[contract.contractName].address,
          factory,
          {
            redeployImplementation: "always"
          }
      );
      const contractImplAddress = await upgrades.erc1967.getImplementationAddress(await contractInstance.getAddress());
      console.log(contract.contractName + ' upgraded successfully', await contractInstance.getAddress(), "==>", contractImplAddress)
    } else if (contract.type == 'diamond') {
      const diamondAddress = address[contract.contractName].address
      let diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
      const diamondLoupeFacet = await ethers.getContractAt('IDiamondLoupe', diamondAddress)

      let selectors = []
      for (const Facet of contract.facetNames) {
        for (const facetContract of address[contract.contractName].facetContracts) {
          if (facetContract.facetName == Facet) {
            console.log(facetContract)
            let facet1Functions = await diamondLoupeFacet.facetFunctionSelectors(facetContract.address)
            for (let i = 0; i < facet1Functions.length; i++) {
              selectors.push(facet1Functions[i])
            }
          }
        }
      }
      console.log("selectors:", selectors)
      let tx
      let receipt
      if (selectors.length > 0) {
        tx = await diamondCutFacet.diamondCut(
            [{
              facetAddress: ethers.ZeroAddress,
              action: FacetCutAction.Remove,
              functionSelectors: selectors
            }],
            ethers.ZeroAddress, '0x')
        receipt = await tx.wait()
        if (!receipt.status) {
          throw Error(`Diamond upgrade failed: ${tx.hash}`)
        }
        console.log("remove ok")
      }

      // deploy new facets
      console.log('upgradeing facets')
      const cut = []
      for (const FacetName of contract.facetNames) {
        const Facet = await ethers.getContractFactory(FacetName)
        let facet = await Facet.deploy()
        facet = await facet.waitForDeployment()
        console.log(`${FacetName} deployed: ${await facet.getAddress()}`)
        for(let i = 0; i < address[contract.contractName].facetContracts.length; i++) {
          if (address[contract.contractName].facetContracts[i].facetName == FacetName) {
            address[contract.contractName].facetContracts[i].address = await facet.getAddress()
          }
        }
        cut.push({
          facetAddress: await facet.getAddress(),
          action: FacetCutAction.Add,
          functionSelectors: getSelectors(facet).remove(['ds()'])
        })
      }

      console.log('Diamond Cut:', cut)
      tx = await diamondCutFacet.diamondCut(cut, ethers.ZeroAddress, '0x')
      console.log('Diamond cut tx: ', tx.hash)
      receipt = await tx.wait()
      if (!receipt.status) {
        throw Error(`Diamond upgrade failed: ${tx.hash}`)
      }
      console.log('Completed diamond upgrade')
      await db.write(address);
    }
  }
}

module.exports.verifyContracts =  async function verifyContracts(contractsToVerify) {
  const address = await db.readAddress()
  const envParam = await db.readEnv()
  function getParamValue (item) {
    let paramFactoryName = ''
    if (item.includes('address.')) {
      paramFactoryName = item.split('.')[1]
      // console.log('paramAddress: ', paramAddress)
      return address[paramFactoryName].address
    } else if (item.includes('config.')) {
      // console.log('envP: ', envP)
      return envParam[item.split('.')[1]]
    } else {
      return item
    }
  }

  function processDeployParam (deployParam) {
    let paramArray = []
    if (deployParam.length === 0) return paramArray
    for (let i in deployParam) {
      if (Array.isArray(deployParam[i])) {
        let subParamArray = []
        for (let k in deployParam[i]) {
          subParamArray = subParamArray.concat(getParamValue(deployParam[i][k]))
        }
        paramArray.push(subParamArray)
      } else {
        paramArray.push(getParamValue(deployParam[i]))
      }
    }
    return paramArray
  }

  for (let i = 0; i < contractsToVerify.length; i++) {
    const contract = contractsToVerify[i]
    if (contract.type == "diamond") {
          // 重新生成钻石合约的模拟合约
          generateDummyContractFromABI.generateDttDummyContractFromABI()
          // 部署模拟合约
          const dumpFactory = await ethers.getContractFactory('DummyDiamondImplementation')
          let dump = await dumpFactory.deploy()
          dump = await dump.waitForDeployment()
          console.log('dump deployed:', await dump.getAddress())
          // 绑定钻石合约和模拟合约的代理关系
          const etherscanFacet = await ethers.getContractAt('DiamondEtherscanFacet', address["Diamond"].address);
          await etherscanFacet.setDummyImplementation(await dump.getAddress());
          console.log("etherscanFacet Implementation: ", await etherscanFacet.implementation());
          // 验证dump合约
          let cp = contract.contractPath.slice(0, contract.contractPath.lastIndexOf("/"))
          cps = cp + "/DummyDiamondImplementation.sol:DummyDiamondImplementation"
          console.log("Dummy contractPath: ", cps)
          await hre.run("verify:verify", {
            address: await dump.getAddress(),
            contract: cps, //Filename.sol:ClassName
          }).then().catch((error)=>{
            console.log(error)
          });
          console.log("verify dump end")
          // 获取cut合约地址
          let DiamondCutFacetAddress = ""
          for (const facet of address[contract.contractName].facetContracts) {
            // 验证切片合约
            await hre.run("verify:verify", {
              address: facet.address,
              contract: cp+"/"+facet.facetName+".sol:"+facet.facetName, //Filename.sol:ClassName
            }).then().catch((error)=>{
              console.log(error)
            });
            if (facet.facetName == "DiamondCutFacet") {
              DiamondCutFacetAddress = facet.address
            }
          }
          console.log("DiamondCutFacetAddress: ", DiamondCutFacetAddress)

          // 验证钻石合约
          await hre.run("verify:verify", {
            address: address[contract.contractName].address,
            contract: contract.contractPath, //Filename.sol:ClassName
            constructorArguments: [(await hre.ethers.provider.getSigner(0)).address, DiamondCutFacetAddress]
          }).then().catch((error)=>{
            console.log(error)
          });
    } else {
      const param = processDeployParam(contract.deployParam)
      await hre.run("verify:verify", {
        address: address[contract.contractName].address,
        contract: contract.contractPath, //Filename.sol:ClassName
        constructorArguments: param
      }).then().catch((error)=>{
        console.log(error)
      });
    }
    console.log("verify", contract.contractName, "end")
  }
}
