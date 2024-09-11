const { ethers } = require('hardhat')
const db = require('../flowCli/db.js')

async function main () {
    const address = await db.readAddress()
    console.log("all address:", address);

    const env = await db.readEnv()
    console.log('env:', env);

    // grant role demo
    const Accessor = await ethers.getContractAt("Accessor", address['Accessor'].address)
    tx = await Accessor.grantRoles("0x114e74f6ea3bd819998f78687bfcb11b140da08e9b7d222fa9c1f1ba1f2aa122", env.user)
    receipt = await tx.wait()
    if (!receipt.status) {
        throw Error(`grant roles failed: ${tx.hash}`)
    }
    console.log('grant roles ok')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
