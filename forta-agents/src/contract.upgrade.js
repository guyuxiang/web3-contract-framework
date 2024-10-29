const {Finding, FindingSeverity, FindingType} = require("forta-agent");
const {proxyCA} = require("./address")

const ERC1967_UPGRADE_EVENT =
    "event Upgraded(address indexed implementation)";

const handleTransaction = async (txEvent) => {
    const findings = [];

    const events = txEvent.filterLog(
        ERC1967_UPGRADE_EVENT,
        proxyCA
    );

    events.forEach((event) => {
        const {newImplementation} = event.args;
        findings.push(
            Finding.fromObject({
                name: "Contract Upgrade",
                description: `Contract ${event.address} Upgraded`,
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
