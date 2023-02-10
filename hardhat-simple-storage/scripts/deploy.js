// imports
const { ethers, run, network } = require("hardhat")

// async main
async function main() {
    // deploy contract
    const simpleStorageFactory = await ethers.getContractFactory(
        "SimpleStorage"
    )
    console.log("Deploying...")
    const simpleStorage = await simpleStorageFactory.deploy()
    await simpleStorage.deployed()
    console.log(`Deployed contract to: ${simpleStorage.address}`)
    // console.log(network.config) // hardhat network chainId: 31337, goerli is 5

    //verifying contract on etherscan (goerli)
    if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
        await simpleStorage.deployTransaction.wait(6) // wait 6 blocks
        await verify(simpleStorage.address, [])
    }

    // interact with deployed contract
    const currentValue = await simpleStorage.retrieve()
    console.log(`Current value is: ${currentValue}`)

    const transactionResponse = await simpleStorage.store(7)
    await transactionResponse.wait(1) // wait 1 block

    const updateValue = await simpleStorage.retrieve()
    console.log(`Updated value is: ${updateValue}`)
}

// auto verification on etherscan
async function verify(contractAddress, args) {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}

// call main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
    })
