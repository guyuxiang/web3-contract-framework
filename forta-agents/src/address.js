const db = require('../../scripts/flowCli/db.js')
const address = await db.readAddress()
console.log("all address:", address);

module.exports = {
    accessCA: address[""].address,
    proxyCA: [
        address[""].address,
        address[""].address
    ],
    tokenCA: [
        address[""].address,
        address[""].address
    ],
    allCA: [
        address[""].address,
        address[""].address
    ],
    acountA: [
        ""
    ]
}