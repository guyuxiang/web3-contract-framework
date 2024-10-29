const {Finding, FindingSeverity, FindingType} = require("forta-agent");

const ROLE_GRANTED_EVENT =
    "RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)";
const CONTRACT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

const handleTransaction = async (txEvent) => {
    const findings = [];

    // filter the transaction logs for Tether transfer events
    const events = txEvent.filterLog(
        ROLE_GRANTED_EVENT,
        CONTRACT_ADDRESS
    );

    events.forEach((event) => {
        const {role, account, sender} = event.args;
        findings.push(
            Finding.fromObject({
                name: "Access Control Changes",
                description: `Role ${role} grante to ${account}`,
                alertId: "FORTA-6",
                severity: FindingSeverity.High,
                type: FindingType.Info,
                metadata: {
                    sender
                },
            })
        );
    });

    return findings;
};

module.exports = {
    handleTransaction,
};
