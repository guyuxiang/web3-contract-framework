const hre = require('hardhat')
const db = require('../flowCli/db.js')

async function main() {
  const address = await db.readAddress()
  console.log("all address", address);

  const env = await db.readEnv()
  console.log('env', env);

  // start
  const VotingTokenC = await hre.ethers.getContractAt('VotingToken', address["VotingToken"].address)
  const TimeLockC = await hre.ethers.getContractAt('TimeLock', address["TimeLock"].address)
  const GovernanceC = await hre.ethers.getContractAt('Governance', address["Governance"].address)

  // timeLock合约给govern合约授权
  const EXECUTOR_ROLE = hre.ethers.keccak256(ethers.toUtf8Bytes("EXECUTOR_ROLE"))
  const PROPOSER_ROLE = hre.ethers.keccak256(ethers.toUtf8Bytes("PROPOSER_ROLE"))

  let tx = await TimeLockC.grantRole(EXECUTOR_ROLE, hre.ethers.ZeroAddress)
  let receipt = await tx.wait();
  if (receipt.status === 1) {
    console.log('grantRoles was successful!');
  } else {
    console.log('grantRoles failed.');
  }

  tx = await TimeLockC.grantRole(EXECUTOR_ROLE, address["Governance"].address)
  receipt = await tx.wait();
  if (receipt.status === 1) {
    console.log('grantRoles was successful!');
  } else {
    console.log('grantRoles failed.');
  }

  tx = await TimeLockC.grantRole(PROPOSER_ROLE, address["Governance"].address)
  receipt = await tx.wait();
  if (receipt.status === 1) {
    console.log('grantRoles was successful!');
  } else {
    console.log('grantRoles failed.');
  }

  let targetAddrs = []
  let callValues = []
  let calldatas = []

  // 编码calldata
  const grantRolesContracts = { name: "Accessor", address: address["Accessor"].address}
  const contractC = await hre.ethers.getContractAt(grantRolesContracts.name, grantRolesContracts.address)
  const ISSUER_ROLE = hre.ethers.keccak256(ethers.toUtf8Bytes("ISSUER_ROLE"))
  var callData = contractC.interface.encodeFunctionData("grantRoles", [ISSUER_ROLE, env.user])
  targetAddrs.push(grantRolesContracts.address)
  callValues.push(0)
  calldatas.push(callData)

  // 委托
  tx = await VotingTokenC.delegate((await hre.ethers.provider.getSigner(0)).address)
  receipt = await tx.wait();
  if (receipt.status === 1) {
    console.log('delegate was successful!');
  } else {
    console.log('delegate failed.');
  }

  let proposalID
  GovernanceC.once("ProposalCreated", (proposalId) => {
    proposalID = proposalId
  })

  // 提案
  tx = await GovernanceC.propose(
    targetAddrs,
    callValues,
    calldatas,
    "set config propose at"+ (await hre.ethers.provider.getBlockNumber())
  )

  // 等待监听到事件
  await tx.wait(10)

  console.log("proposalId:", proposalID)
  console.log("proposalState after propose :" ,await GovernanceC.state(proposalID));

  // 投票
  const support = 1
  await GovernanceC.castVote(
    proposalID,
    support
  )
  console.log("proposalState after vote :" ,await GovernanceC.state(proposalID));

  // 等待投票结束
  console.log("wait 30 block");
  await tx.wait(31)
  console.log("proposalState after vote :" ,await GovernanceC.state(proposalID));

  // 提案放入队列
  console.log("add queue");
  tx = await GovernanceC.queue(proposalID)
  console.log("proposalState after queue :" ,await GovernanceC.state(proposalID));
  await tx.wait(2)

  // 执行
  console.log("execute")
  tx = await GovernanceC.execute(proposalID)
  await tx.wait(2)
  console.log("proposalState after execute :" ,await GovernanceC.state(proposalID));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
