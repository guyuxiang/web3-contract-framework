const {Finding, FindingSeverity, FindingType} = require("forta-agent");

const OWNERSHIP_TRANSFERRED_EVENT =
    "OwnershipTransferred(address indexed previousOwner, address indexed newOwner)";
const CONTRACT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

const handleTransaction = async (txEvent) => {
    const findings = [];

    // filter the transaction logs for Tether transfer events
    const events = txEvent.filterLog(
        OWNERSHIP_TRANSFERRED_EVENT,
        CONTRACT_ADDRESS
    );

    events.forEach((event) => {
        const {previousOwner, newOwner} = event.args;
        findings.push(
            Finding.fromObject({
                name: "Contract Ownership Transferred",
                description: `Contract ${CONTRACT_ADDRESS} Ownership Transferred`,
                alertId: "FORTA-6",
                severity: FindingSeverity.High,
                type: FindingType.Info,
                metadata: {
                    newOwner,
                },
            })
        );
    });

    return findings;
};

module.exports = {
    handleTransaction,
};
