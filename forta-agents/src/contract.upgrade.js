const {Finding, FindingSeverity, FindingType} = require("forta-agent");

const ERC1967_UPGRADE_EVENT =
    "event Upgraded(address indexed implementation)";
const PROXY_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

const handleTransaction = async (txEvent) => {
    const findings = [];

    // filter the transaction logs for Tether transfer events
    const events = txEvent.filterLog(
        ERC1967_UPGRADE_EVENT,
        PROXY_ADDRESS
    );

    events.forEach((event) => {
        const {newImplementation} = event.args;
        findings.push(
            Finding.fromObject({
                name: "Contract Upgrade",
                description: `Contract ${PROXY_ADDRESS} Upgraded`,
                alertId: "FORTA-6",
                severity: FindingSeverity.High,
                type: FindingType.Info,
                metadata: {
                    newImplementation,
                },
            })
        );
    });

    return findings;
};

module.exports = {
    handleTransaction,
};
