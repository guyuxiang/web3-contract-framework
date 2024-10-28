# web3-contract-scaffolding

## Introduction

`web3-contract-scaffolding`智能合约脚手架，对web3开源技术的整合应用，封装程度较低，相当于一套技术最佳实践。

## Architecture
![image](docs/images/architecture.png)
- kyc层对进入合约的用户进行信息认证

## Scaffolding

`web3-contract-scaffolding`脚手架核心目录如下，下面主要针对该包结构进行描述：

```bash
web3-contract-scaffolding/
├── README.md
├── codegen
├── contracts
│   ├── endPoint
│   │   ├── Diamond.sol
│   │   ├── DiamondCutFacet.sol
│   │   ├── DiamondEtherscanFacet.sol
│   │   ├── DiamondLoupeFacet.sol
│   │   └── Storage.sol
│   ├── govern
│   │   ├── Governance.sol
│   │   ├── TimeLock.sol
│   │   └── VotingToken.sol
│   ├── interfaces
│   │   ├── IDiamondCut.sol
│   │   ├── IDiamondLoupe.sol
│   │   └── IERC165.sol
│   ├── kyc
│   │   └── Accessor.sol
│   ├── libraries
│   │   ├── Counters.sol
│   │   ├── LibDiamond.sol
│   │   ├── LibDiamondEtherscan.sol
│   │   └── Permission.sol
│   └── utils
├── deployments
│   └── address.json
├── docs
├── hardhat.config.js
├── package-lock.json
├── package.json
├── patches
│   ├── @openzeppelin+hardhat-upgrades+3.2.0.patch
│   └── hardhat-diamond-abi+3.0.1.patch
├── scripts
│   ├── deploys
│   │   ├── deploy.js
│   │   └── deployTemplate.json
│   ├── config.json
│   ├── flowCli
│   │   ├── db.js
│   │   ├── diamond.js
│   │   ├── generateDummyContract.js
│   │   ├── generateDummyContract.ts
│   │   └── utl.js
│   ├── others
│   │   ├── caculateContractSize.js
│   │   ├── explorerVerify.js
│   │   ├── gencode.js
│   │   ├── runGenerateDummyFromABI.js
│   │   ├── set.js
│   │   └── setWithGovern.js
│   └── upgrades
│       └── upgrade.js
├── storage-layouts
├── test
│   └── demoTest.js
└── tools
    └── tenderly

```

# Sample Hardhat Project
This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy_bak.js

// 合约存储结构检查
npx hardhat storage-layout --check
// 合约存储结构更新
npx hardhat storage-layout --update
```

# 部署流程

# node_modules包修改
打补丁示例:
npx patch-package hardhat

# 开启hardhat rpc dubug日志
DEBUG=hardhat:providers npx hardhat run...
