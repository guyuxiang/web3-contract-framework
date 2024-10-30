const BigNumber = require("bignumber.js");
const {Finding, FindingSeverity, FindingType} = require("forta-agent");
const TOKEN_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const TOKEN_DECIMALS = 6;
const ERC20_TRANSFER_FROM_FUNCTION =
    "function transferFrom(address from, address to, uint value)";

function provideHandleTransaction() {
    return async function handleTransaction(txEvent) {
        const findings = [];

        // filter the transaction input for token transferFrom function calls
        const usdtTransferFromInvocations = txEvent.filterFunction(
            ERC20_TRANSFER_FROM_FUNCTION,
            TOKEN_ADDRESS
        );

        // fire alerts for each function call
        usdtTransferFromInvocations.forEach((transferFromInvocation) => {
            // shift decimal places of transfer amount
            const amount = new BigNumber(
                transferFromInvocation.args.value.toString()
            ).dividedBy(10 ** TOKEN_DECIMALS);

            const formattedAmount = amount.toFixed(2);
            findings.push(
                Finding.fromObject({
                    name: "Token Delegate Transfer",
                    description: `${formattedAmount} token transferred`,
                    alertId: "ABT",
                    severity: FindingSeverity.Info,
                    type: FindingType.Info,
                    metadata: {
                        by: txEvent.from,
                        from: transferFromInvocation.args.from,
                        to: transferFromInvocation.args.to,
                        amount: formattedAmount,
                    },
                })
            );
        });

        return findings;
    };
}

module.exports = {
    provideHandleTransaction,
    handleTransaction: provideHandleTransaction(),
};
