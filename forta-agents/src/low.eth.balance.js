const {Finding, FindingSeverity, FindingType} = require("forta-agent");
const BigNumber = require("bignumber.js");
const {acountA} = require("./address")

const MIN_BALANCE = "100000000000000000" // 0.1 eth
const minBalance = new BigNumber(MIN_BALANCE).dividedBy(10 ** 18);

function provideHandleBlock() {
    return async function handleBlock(ethersProvider) {
        // report finding if specified account balance falls below threshold
        const findings = []
        const accountBalance = new BigNumber((await ethersProvider.getBalance(acountA)).toString())
        if (accountBalance.isGreaterThanOrEqualTo(MIN_BALANCE)) return findings

        findings.push(
            Finding.fromObject({
                    name: "Low Account Balance",
                    description: `Account balance (${accountBalance.dividedBy(10 ** 18).toString()}eth) below threshold (${minBalance.toString()}eth)`,
                    alertId: "ABT",
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
    handleBlock: provideHandleBlock()
}