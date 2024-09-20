const { ethers } = require('hardhat')
const db = require('../flowCli/db.js')

async function main () {
    const address = await db.readAddress()
    console.log("all address:", address);

    const env = await db.readEnv()
    console.log('env:', env);

    const SubscriptionConsumerC = await ethers.getContractAt("SubscriptionConsumer", address['SubscriptionConsumer'].address)
    let tx = await SubscriptionConsumerC.setSubscriptionId(ethers.getUint(env.vrfSubscriptionId))
    let receipt = await tx.wait()
    if (!receipt.status) {
        throw Error(`setSubscriptionId failed: ${tx.hash}`)
    }
    tx = await SubscriptionConsumerC.setKeyHash(env.vrfKeyHash)
    receipt = await tx.wait()
    if (!receipt.status) {
        throw Error(`setKeyHash failed: ${tx.hash}`)
    }
    console.log('set VRF ok')

    tx = await SubscriptionConsumerC.requestRandomWords(false)
    receipt = await tx.wait()
    if (!receipt.status) {
        throw Error(`requestRandomWords failed: ${tx.hash}`)
    }
    console.log('requestRandomWords ok')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
