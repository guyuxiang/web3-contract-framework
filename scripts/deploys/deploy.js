const db = require('../flowCli/db')
const { reOrganizeTokens, deployContracts } = require('../flowCli/utl')

async function main () {
    const address = await db.readAddress()
    console.log('all address', address)

    const configParam = await db.readconfig()
    console.log('configParam', configParam)

    const contractsParam  = [  {
        "factoryName": "StreamsUpkeepRegistrar",
        "contractName": "StreamsUpkeepRegistrar",
        "deployParam": [
            "config.verifierProxyAddress",
            "config.linkToken",
            "config.automationRegistrarAddress",
            ["config.dataStreamsId"]
        ],
        "type": "normal"
    },
        {
            "factoryName": "LogEmitter",
            "contractName": "LogEmitter",
            "deployParam": [
            ],
            "type": "normal"
        }]

    await deployContracts(contractsParam)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
