const fs = require('fs');

const list = [
    "./artifacts/contracts/kyc/Accessor.sol/Accessor.json",
]

// gen abi
for (let i = 0; i < list.length; i++) {
    const data = fs.readFileSync(list[i], 'utf8');
    // parse JSON string to JSON object
    const config = JSON.parse(data);

    let ccname = config.contractName.toLowerCase()

    // 钻石合约event abi去重
    if (list[i].includes("hardhat-diamond-abi")) {
        ccname = ccname.replace("full", "")
        // 解析出abi文件
        const abiFile = './codegen/'+ ccname + ".abi"
        let abiArray1 = [];
        for(let i = 0; i < config.abi.length; i++) {
            if(abiArray1.includes(JSON.stringify(config.abi[i]))) {
                console.log("remove: ", config.abi[i].name)
            } else {
                abiArray1.push(JSON.stringify(config.abi[i]));
            }
        }
        let abiArray2 = []
        for(let i = 0; i < abiArray1.length; i++) {
            abiArray2.push(JSON.parse(abiArray1[i]))
        }
        config.abi = abiArray2
        config.contractName = config.contractName.replace("Full", "")
        config.sourceName = "contracts/endPoint/Diamond.sol"
        fs.writeFileSync(abiFile, JSON.stringify(config, '', '\t'));
    } else {
        // 解析出abi文件
        const abiFile = './codegen/'+ ccname + ".abi"
        fs.writeFileSync(abiFile, JSON.stringify(config, '', '\t'));
    }
}
