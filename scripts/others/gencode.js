const fs = require('fs');
const { exec } = require('child_process');

const list = [
    "./artifacts/contracts/kyc/Accessor.sol/Accessor.json",
    "./artifacts/hardhat-diamond-abi/HardhatDiamondABI.sol/DiamondFull.json",
]

// gen abi
for (let i = 0; i < list.length; i++) {
    const data = fs.readFileSync(list[i], 'utf8');
    // parse JSON string to JSON object
    const config = JSON.parse(data);

    let ccname = config.contractName.toLowerCase()

    let abiFile
    // 钻石合约event abi去重
    if (list[i].includes("hardhat-diamond-abi")) {
        ccname = ccname.replace("full", "")
        // 解析出abi文件
        abiFile = './codegen/'+ ccname + ".abi"
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
        fs.writeFileSync(abiFile, JSON.stringify(config.abi, '', '\t'));
    } else {
        // 解析出abi文件
        abiFile = './codegen/'+ ccname + ".abi"
        fs.writeFileSync(abiFile, JSON.stringify(config.abi, '', '\t'));

    }

    // go文件夹
    const gocodeDir = "./codegen/" + ccname
    if (!fs.existsSync(gocodeDir)) {
        fs.mkdirSync(gocodeDir)
    }

    // 生成golang文件
    const cmd = 'abigen --abi ' + abiFile + " --pkg "+ ccname + " --out " + gocodeDir + "/"+ ccname + ".go"

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`执行命令时发生错误: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`标准错误输出: ${stderr}`);
            return;
        }
    });
}
