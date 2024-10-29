const {Finding, FindingSeverity, FindingType, getEthersProvider} = require("forta-agent");
const BigNumber = require("bignumber.js");
const {accessCA} = require("./address")
export const MIN_BALANCE = "100000000000000000" // 0.1 eth
const ethersProvider = getEthersProvider()

function provideHandleBlock(ethersProvider) {
    return async function handleBlock(blockEvent) {
        // report finding if specified account balance falls below threshold
        const findings = []

        const accountBalance = new BigNumber((await ethersProvider.getBalance(accessCA, blockEvent.blockNumber)).toString())
        if (accountBalance.isGreaterThanOrEqualTo(MIN_BALANCE)) return findings

        findings.push(
            Finding.fromObject({
                    name: "Minimum Account Balance",
                    description: `Account balance (${accountBalance.toString()}) below threshold (${MIN_BALANCE})`,
                    alertId: "FORTA-6",
                    severity: FindingSeverity.Info,
                    type: FindingType.Suspicious,
                    metadata: {
                        balance: accountBalance.toString()
                    }
                }
            ))

        return findings
    }
}

module.exports = {
    provideHandleBlock,
    handleBlock: provideHandleBlock(ethersProvider)
}