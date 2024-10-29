const {Finding, FindingSeverity, FindingType} = require("forta-agent")

const SET_CONFIG_FOUNCTION =
    "function setConfig(address _config)";
const CONTRACT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

async function handleTransaction(txEvent) {
    const findings = []

    const setConfigFunctionCalls = txEvent.filterFunction(SET_CONFIG_FOUNCTION, CONTRACT_ADDRESS)
    setConfigFunctionCalls.forEach((setConfigFunctionCall) => {
        const {newConfig} = setConfigFunctionCall.args
        findings.push(Finding.fromObject({
            name: "Set Config Call",
            description: `call ${CONTRACT_ADDRESS} setConfig to ${newConfig}`,
            alertId: "FORTA-6",
            severity: FindingSeverity.High,
            type: FindingType.Info,
            metadata: {
                newConfig
            },
        }))
    })

    return findings
}

module.exports = {
    handleTransaction,
};