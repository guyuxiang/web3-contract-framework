const { expect } = require('chai')
const { ethers } = require('hardhat')
const dayjs = require('dayjs')

const {
    loadFixture,
} = require('@nomicfoundation/hardhat-network-helpers')

describe('Deploy', function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployDttFixture () {
        // 预准备账户
        const [owner1, owner2, owner3] = await ethers.getSigners()

        // kyc合约
        const AccessorFactory = await ethers.getContractFactory('Accessor')
        const AccessorContract = await AccessorFactory.deploy()
        console.log('Accessor合约地址： ', AccessorContract.address)

        return {
            owner1,
            owner2,
            owner3,
            AccessorContract,
        }
    }

    describe('Test Demo', function () {
        it('Test1', async function () {
            const {
                owner1,
                owner2,
                owner3,
                AccessorContract,
            } = await loadFixture(deployDttFixture)
        })

        // 具体测试
        // ...
    })
})
