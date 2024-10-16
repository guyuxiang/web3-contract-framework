const db = require('../flowCli/db')
const { reOrganizeTokens, upgradeContracts, deployContracts} = require('../flowCli/utl')

async function main () {
    const address = await db.readAddress()
    console.log('all address', address)

    const config = await db.readconfig()
    console.log('configParam', config)

    // 升级
    const contractsParam  = await db.readContractTemplate()

    await upgradeContracts(contractsParam)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
