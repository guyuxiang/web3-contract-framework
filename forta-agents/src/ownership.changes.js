const {Finding, FindingSeverity, FindingType} = require("forta-agent");
const {allCA} = require("./address")
const OWNERSHIP_TRANSFERRED_EVENT =
    "OwnershipTransferred(address indexed previousOwner, address indexed newOwner)";

const handleTransaction = async (txEvent) => {
    const findings = [];

    // filter the transaction logs for Tether transfer events
    const events = txEvent.filterLog(
        OWNERSHIP_TRANSFERRED_EVENT,
        allCA
    );

    events.forEach((event) => {
        const {previousOwner, newOwner} = event.args;
        findings.push(
            Finding.fromObject({
                name: "Ownership Changes",
                description: `Contract ${event.address} Ownership Transferred`,
                alertId: "FORTA-6",
                severity: FindingSeverity.High,
                type: FindingType.Info,
                metadata: {
                    previousOwner,
                    newOwner
                },
            })
        );
    });

    return findings;
};

module.exports = {
    handleTransaction,
};
