// imports
// main
// call main

const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")

// function deployFunc() {
//     console.log("Hi!")
// }
// module.exports.default = deployFunc

// anonymous function. deconstruct variables from hre, same as
// const {getNamedAccounts, deployments} = hre
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // network configuration
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const eth
    }
    // mock: if contract doesn't exist, deploy a minimal version for local testing

    // when going for localhost or hardhat network we want to use a mock
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [],
        log: true
    })
    // when we want to change chains
}
