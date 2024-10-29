const {Finding, FindingSeverity, FindingType, getTransactionReceipt} = require("forta-agent");
const CONTRACT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F".toLowerCase();
const {allCA} = require("./address")

const handleTransaction = async (txEvent) => {
    const findings = [];

    const transactions = txEvent.filterFunction(
        null,
        allCA
    );

    if (transactions.length) {
        if ((await getTransactionReceipt(txEvent.hash)).status === 0) {
            findings.push(
                Finding.fromObject({
                    name: "Transaction Failed",
                    description: `Transaction ${txEvent.hash} to contract ${CONTRACT_ADDRESS} failed`,
                    alertId: "FORTA-6",
                    severity: FindingSeverity.High,
                    type: FindingType.Info,
                    metadata: {
                        from: txEvent.from,
                        to: txEvent.to,
                    },
                })
            );
        }
    }


    return findings;
};

module.exports = {
    handleTransaction,
};
