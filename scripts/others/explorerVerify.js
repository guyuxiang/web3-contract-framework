const db = require('../flowCli/db')
const { reOrganizeTokens, verifyContracts } = require('../flowCli/utl')

async function main () {
    const address = await db.readAddress()
    console.log('all address', address)

    const envParam = await db.readEnv()
    console.log('envParam', envParam)

    const contractsParam =

    await verifyContracts(contractsParam)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })