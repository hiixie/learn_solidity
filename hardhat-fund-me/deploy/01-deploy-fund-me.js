// imports
// main
// call main

require("dotenv").config()
const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../util/verify")

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
        // get a deployment by name,
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    // mock: if contract doesn't exist, deploy a minimal version for local testing

    const args = [ethUsdPriceFeedAddress]
    // when going for localhost or hardhat network we want to use a mock
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    //verifying contract on etherscan (goerli)
    if (
        !developmentChains.includes[network.name] &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("----------------------------------------------")
}
module.exports.tags = ["all", "fundme"]
