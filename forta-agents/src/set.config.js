const {Finding, FindingSeverity, FindingType} = require("forta-agent")
const {allCA} = require("./address")
const SET_CONFIG_FOUNCTION =
    "function setConfig(address _config)";

async function handleTransaction(txEvent) {
    const findings = []

    const setConfigFunctionCalls = txEvent.filterFunction(SET_CONFIG_FOUNCTION, allCA)
    setConfigFunctionCalls.forEach((setConfigFunctionCall) => {
        const {newConfig} = setConfigFunctionCall.args
        findings.push(Finding.fromObject({
            name: "Set Config Call",
            description: `call ${setConfigFunctionCall.address} setConfig to ${newConfig}`,
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