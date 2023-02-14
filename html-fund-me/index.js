// modules
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

// get elements from DOM
const connectButton = document.getElementById("connectButton")
const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")

// add event listener
connectButton.onclick = connect
withdrawButton.onclick = withdraw
fundButton.onclick = fund
balanceButton.onclick = getBalance

// functions
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        // connect to metamask
        try {
            await ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        console.log("connected!")
        console.log(ethers)
        connectButton.innerHTML = "Connected"
    } else {
        connectButton.innerHTML = "Please install metamask!"
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount} ETH...`)
    if (typeof window.ethereum !== "undefined") {
        // What do we need?
        // provider / connection to the blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // signer / wallet / someone with gas
        const signer = provider.getSigner()
        console.log(signer)
        // contract that we are interacting with ABI & Address
        const contract = new ethers.Contract(contractAddress, abi, signer)

        // do transaction
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // listen for the tx to be mined or an event
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    } else {
        connectButton.innerHTML = "Please install metamask!"
    }
}

async function withdraw() {
    console.log(`Withdrawing...`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            // await transactionResponse.wait(1)
        } catch (error) {
            console.log(error)
        }
    } else {
        withdrawButton.innerHTML = "Please install MetaMask"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        try {
            const balance = await provider.getBalance(contractAddress)
            // read numbers into ether units
            console.log(ethers.utils.formatEther(balance))
        } catch (error) {
            console.log(error)
        }
    } else {
        balanceButton.innerHTML = "Please install MetaMask"
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`)
    // create a listener for the blockchain, , use Promise so it waits for it to finish
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(`Completed with ${transactionReceipt.confirmations} confirmations. `)
                resolve()
            })
        } catch (error) {
            reject(error)
        }
    })
}
