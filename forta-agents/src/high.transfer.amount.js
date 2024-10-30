const BigNumber = require("bignumber.js");
const {Finding, FindingSeverity, FindingType} = require("forta-agent");
const {tokenCA} = require("./address")
const TOKEN_DECIMALS = 6;
const ERC20_TRANSFER_EVENT =
    "event Transfer(address indexed from, address indexed to, uint value)";

const AMOUNT_THRESHOLD = "100000"; // 0.1 million

function provideHandleTransaction(amountThreshold) {
    return async function handleTransaction(txEvent) {
        const findings = [];

        // filter the transaction logs for USDT Transfer events
        const tokenTransferEvents = txEvent.filterLog(
            ERC20_TRANSFER_EVENT,
            tokenCA
        );

        // fire alerts for transfers of large amounts
        tokenTransferEvents.forEach((tokenTransfer) => {
            // shift decimal places of transfer amount
            const amount = new BigNumber(
                tokenTransfer.args.value.toString()
            ).dividedBy(10 ** TOKEN_DECIMALS);

            if (amount.isLessThan(amountThreshold)) return;

            const formattedAmount = amount.toFixed(2);
            findings.push(
                Finding.fromObject({
                    name: "Large Token Transfer",
                    description: `${formattedAmount} USDT transferred`,
                    alertId: "ABT",
                    severity: FindingSeverity.Info,
                    type: FindingType.Info,
                    metadata: {
                        from: tokenTransfer.args.from,
                        to: tokenTransfer.args.to,
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
    handleTransaction: provideHandleTransaction(AMOUNT_THRESHOLD),
};
