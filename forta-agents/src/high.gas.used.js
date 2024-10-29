const BigNumber = require("bignumber.js");
const {Finding, FindingSeverity, FindingType, getTransactionReceipt} = require("forta-agent");
const {allCA} = require("./address")

const MEDIUM_GAS_THRESHOLD = "1000000";
const HIGH_GAS_THRESHOLD = "3000000";
const CRITICAL_GAS_THRESHOLD = "7000000";

// report finding if gas used in transaction is higher than threshold
const handleTransaction = async (txEvent) => {
    const findings = []

    const transactions = txEvent.filterFunction(
        null,
        allCA
    );

    if (transactions.length) {
        const { gasUseds } = await getTransactionReceipt(txEvent.hash)
        const gasUsed = new BigNumber(gasUseds);
        const findings = [];

        if (gasUsed.isLessThan(MEDIUM_GAS_THRESHOLD)) return findings;

        findings.push(
            Finding.fromObject({
                name: "High Gas Used",
                description: `Gas Used: ${gasUsed}`,
                alertId: "FORTA-1",
                type: FindingType.Suspicious,
                severity: getSeverity(gasUsed),
                metadata: {
                    gasUsed: gasUsed.toString(),
                },
            })
        );
    }
    return findings;
};

const getSeverity = (gasUsed) => {
    return gasUsed.isGreaterThan(CRITICAL_GAS_THRESHOLD)
        ? FindingSeverity.Critical
        : gasUsed.isGreaterThan(HIGH_GAS_THRESHOLD)
            ? FindingSeverity.High
            : FindingSeverity.Medium;
};

module.exports = {
    handleTransaction,
};
