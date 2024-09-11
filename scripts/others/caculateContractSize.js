const hre = require("hardhat");

async function main() {
    const contracts = [
        "Accessor",
    ]

    for (let i = 0; i<contracts.length; i++) {
        // 加载合约的Artifact
        const ContractArtifact = await hre.artifacts.readArtifact(contracts[i]);

        // 计算并输出部署字节码长度
        const DeployBytecodeLength = ContractArtifact.deployedBytecode.length / 2 - 1; // 除以2是因为字节码使用16进制表示
        console.log(`${contracts[i]}部署字节码长度（以字节为单位）: ${DeployBytecodeLength}`);

        // 计算并输出完整（构造器）字节码长度
        const BytecodeLength = ContractArtifact.bytecode.length / 2 - 1;
        console.log(`${contracts[i]}完整（含构造器）字节码长度（以字节为单位）: ${BytecodeLength}`);
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
