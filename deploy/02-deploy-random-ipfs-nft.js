const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const FUND_AMOUNT = ethers.parseEther("30")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorV2Address, subId, vrfCoordinatorV2Mock

    let tokenUris = [
        "ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
        "ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
        "ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm",
    ]

    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
        vrfCoordinatorV2Address = await vrfCoordinatorV2Mock.getAddress()

        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)

        subId = transactionReceipt.logs[0].args.subId
        log(typeof subId)

        await vrfCoordinatorV2Mock.fundSubscription(subId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2Address"]
        subId = networkConfig[chainId]["subId"]
    }

    const mintFee = networkConfig[chainId]["mintFee"]
    const keyHash = networkConfig[chainId]["keyHash"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]

    // Tons of args
    const args = [vrfCoordinatorV2Address, keyHash, subId, callbackGasLimit, tokenUris, mintFee]

    const randomIPFSNFT = await deploy("RandomIPFSNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    /*  In latest version of Chainlink/contracts 0.6.1 or after 0.4.1, 
        we need to add consumer explicitly after deployment of contract
        refer: https://github.com/smartcontractkit/full-blockchain-solidity-course-js/discussions/1565
    */
    if (developmentChains.includes(network.name)) {
        await vrfCoordinatorV2Mock.addConsumer(subId, randomIPFSNFT.address)
        log("Consumer is added")
    }

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(randomIPFSNFT.address, args)
    }
    log("--------------------------------")
}

module.exports.tags = ["all", "randomipfsnft"]
