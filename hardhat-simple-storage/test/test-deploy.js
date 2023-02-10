const { ethers, run, network } = require("hardhat")
const { expect, assert } = require("chai")

// take two params
describe("SimpleStorage", function () {
    // deploy contract
    let simpleStorageFactory, simpleStorage
    beforeEach(async function () {
        simpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
        simpleStorage = await simpleStorageFactory.deploy()
    })

    it("Should start with a favorite number of 0", async function () {
        const currentValue = await simpleStorage.retrieve()
        const expectedValue = "0"
        // assert
        assert.equal(currentValue.toString(), expectedValue)
        // expect
    })
    // only run this test
    // command: yarn hardhat test --grep store, or do:
    // it.only("Should update when we call store", async function () {
    it("Should update when we call store", async function () {
        const expectedValue = "7"
        const transactionResponse = await simpleStorage.store(7)
        await transactionResponse.wait(1) // wait 1 block
        const updateValue = await simpleStorage.retrieve()
        assert.equal(updateValue.toString(), expectedValue)
        // expect
    })
})
