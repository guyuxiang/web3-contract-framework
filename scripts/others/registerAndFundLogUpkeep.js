const db = require('../flowCli/db.js')
const hre = require('hardhat')
const { AbiCoder } = require('ethers')

const minimalERC20ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint amount) returns (bool)",
]

async function main () {
    const address = await db.readAddress()
    console.log('address', address)
    const configParam = await db.readconfig()
    console.log('configParam', configParam)

    const streamsUpkeep = address["StreamsUpkeepRegistrar"].address
    const logEmitter = address["LogEmitter"].address

    // Retrieve the deployer's (admin's) signer object to sign transactions.
    const [signer] = await hre.ethers.getSigners()

    // 给streamsUpkeep合约转link代币
    const linkTokenContract = await hre.ethers.getContractAt(minimalERC20ABI, configParam.linkToken)
    // const balance = await linkTokenContract.balanceOf(signer.address)
    // console.log(`LINK balance of sender ${signer.address} is ${hre.ethers.formatUnits(balance)} LINK`)
    // const result = await linkTokenContract.connect(signer).transfer(streamsUpkeep, hre.ethers.parseUnits("1", "ether"))
    // await result.wait() // Wait for the transaction to be mined.

    // 注册streamsUpkeep
    console.log("start register streamsUpkeep")
    const balance = await linkTokenContract.balanceOf(streamsUpkeep)
    console.log(`LINK balance of streamsUpkeep ${signer.address} is ${hre.ethers.formatUnits(balance)} LINK`)
    // See more information on https://docs.chain.link/chainlink-automation/guides/register-upkeep-in-contract.
    const name = "YG Streams Upkeep" // Name of the upkeep registration.
    const encryptedEmail = "0x" // Placeholder for an encrypted email (optional).
    const gasLimit = 500000 // Maximum gas allowance for the upkeep execution.
    const triggerType = 1 // Type of trigger, where `1` represents a Log Trigger.
    const checkData = "0x" // Data passed to checkUpkeep; placeholder in this context.
    const offchainConfig = "0x" // Off-chain configuration data; placeholder in this context.
    const amount = hre.ethers.parseUnits("1", "ether") // Funding amount in LINK tokens.

    // Event signature hash and placeholder topics for the LogEmitter trigger.
    const topic0 = "0xb8a00d6d8ca1be30bfec34d8f97e55f0f0fd9eeb7fb46e030516363d4cfe1ad6" // Event signature hash.
    const topic1 = (topic2 = topic3 = "0x0000000000000000000000000000000000000000000000000000000000000000") // Placeholder topics.
    const abiCoder = new AbiCoder();
    // ABI-encode the trigger configuration data.
    const triggerConfig = abiCoder.encode(
      ["address", "uint8", "bytes32", "bytes32", "bytes32", "bytes32"],
      [logEmitter, 0, topic0, topic1, topic2, topic3]
    )

    // Construct the parameters for registration, combining all previously defined values.
    const params = {
      name,
      encryptedEmail,
      upkeepContract: streamsUpkeep,
      gasLimit,
      adminAddress: signer.address,
      triggerType,
      checkData,
      triggerConfig,
      offchainConfig,
      amount,
    }
    // Interact with the deployed StreamsUpkeep contract to register the upkeep.
    console.log(`Registering upkeep with Chainlink Automation using account: ${signer.address}`)
    const StreamsUpkeepContract = await hre.ethers.getContractAt("StreamsUpkeepRegistrar", streamsUpkeep)

    let tx = await StreamsUpkeepContract.registerAndPredictID(params)
    receipt = await tx.wait()
    if (!receipt.status) {
        throw Error(`Failed to register upkeep.`)
    }
    console.log('Upkeep registered and funded with 1 LINK successfully.')

    // 测试发送一个事件进行data streams
    console.log(("Emitting a log..."))
    const LogEmitterContract = await hre.ethers.getContractAt("LogEmitter", logEmitter)
    // Call the emitLog function of the LogEmitter contract to emit a log event.
    tx = await LogEmitterContract.emitLog()
    await tx.wait()
    if (!receipt.status) {
        throw Error(`Failed to emit log.`)
    }
    console.log(`Log emitted successfully in transaction: ${tx.hash}`)

    // 查询获取的价格
    const s_lastRetrievedPrice = await StreamsUpkeepContract.s_last_retrieved_price()
    console.log(`Last Retrieved Price: ${s_lastRetrievedPrice}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
