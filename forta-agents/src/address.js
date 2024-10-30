const fs = require('fs');
const p = require("path");

const address = readAddressSync(p.join(__dirname, '../../deployments', 'address.json'))
console.log("all address:", address);

function readAddressSync(path) {
    try {
        const data = fs.readFileSync(path, { encoding: 'utf8' });
        return JSON.parse(data.toString());
    } catch (err) {
        throw err;
    }
}

module.exports = {
    accessCA: address["Accessor"].address,
    proxyCA: [
        address["GLSGD"].address,
        address["GLUSD"].address
    ],
    tokenCA: [
        address["GLSGD"].address,
        address["GLUSD"].address
    ],
    allCA: [
        address["GLSGD"].address,
        address["GLUSD"].address,
        address["Accessor"].address
    ],
    acountA: "0xA3437A092239dC5E7825E6B4EFCc419348f71f5a"
}