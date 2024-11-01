const accessControlChangesAgent = require("./access.control.changes");
const contractUpgradeAgent = require("./contract.upgrade");
const highGasUsedAgent = require("./high.gas.used");
const highTransferAmountAgent = require("./high.transfer.amount");
const lowETHBalanceAgent = require("./low.eth.balance");
const ownershipChangesAgent = require("./ownership.changes");
const setConfigAgent = require("./set.config");
const txFailedAgent = require("./tx.failed");
const { getEthersProvider, getJsonRpcUrl } = require("forta-agent");
console.log(getJsonRpcUrl());
const ethersProvider = getEthersProvider();

// let findingsCount = 0;

function provideHandleTransaction(
    accessControlChangesAgent,
    contractUpgradeAgent,
    highGasUsedAgent,
    highTransferAmountAgent,
    lowETHBalanceAgent,
    ownershipChangesAgent,
    setConfigAgent,
    txFailedAgent
) {
    return async function handleTransaction(txEvent) {
        // limiting this agent to emit only 5 findings so that the alert feed is not spammed
        // if (findingsCount >= 5) return [];

        const findings = (
            await Promise.all([
                accessControlChangesAgent.handleTransaction(txEvent),
                contractUpgradeAgent.handleTransaction(txEvent),
                highGasUsedAgent.handleTransaction(txEvent),
                highTransferAmountAgent.handleTransaction(txEvent),
                lowETHBalanceAgent.handleBlock(ethersProvider),
                ownershipChangesAgent.handleTransaction(txEvent),
                setConfigAgent.handleTransaction(txEvent),
                txFailedAgent.handleTransaction(txEvent)
            ])
        ).flat();

        // findingsCount += findings.length;
        return findings;
    };
}

module.exports = {
    provideHandleTransaction,
    handleTransaction: provideHandleTransaction(
        accessControlChangesAgent,
        contractUpgradeAgent,
        highGasUsedAgent,
        highTransferAmountAgent,
        lowETHBalanceAgent,
        ownershipChangesAgent,
        setConfigAgent,
        txFailedAgent
    ),
};


// const initialize = async () => {
//   // do some initialization on startup e.g. fetch data
// }

// const handleBlock = async (blockEvent) => {
//   const findings = [];
//   // detect some block condition
//   return findings;
// };

// const handleAlert = async (alertEvent) => {
//   const findings = [];
//   // detect some alert condition
//   return findings;
// };

