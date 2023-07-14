const { network, ethers, deployments } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNFT unit tests", function () {
          let deployer, basicNFT
          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["basicnft"])
              const basicNFTContract = await ethers.getContract("BasicNFT")
              basicNFT = basicNFTContract.connect(deployer)
          })

          describe("constructor", function () {
              it("initializes the token counter correctly", async () => {
                  const tokenCounter = (await basicNFT.getTokenCounter()).toString()
                  console.log(tokenCounter)
                  assert.equal(tokenCounter, "0")
              })
              it("initializes the token with the correct name and symbol ", async () => {
                  console.log(await basicNFT.name())
                  assert.equal("Dogie", await basicNFT.name())
                  console.log(await basicNFT.symbol())
                  assert.equal("DOG", await basicNFT.symbol())
              })
          })

          describe("mintNFT", function () {
              it("Should be able to mint tokens successfully to an address", async () => {
                  await basicNFT.mintNFT()
                  assert.equal((await basicNFT.balanceOf(deployer)).toString(), "1")
              })
              it("emits an transfer event, when an transfer occurs", async () => {
                  await expect(await basicNFT.mintNFT()).to.emit(basicNFT, "Transfer")
              })
              it("should return token counter correctly", async () => {
                  await basicNFT.mintNFT()
                  const tokenCounter = await basicNFT.getTokenCounter()
                  console.log(tokenCounter.toString())
                  assert.equal(tokenCounter.toString(), "1")
              })
              it("Show the correct tokenURI, balance and owner of an NFT", async function () {
                  await basicNFT.mintNFT()
                  const firstTokenURI = await basicNFT.tokenURI(0)
                  assert.equal(firstTokenURI, await basicNFT.TOKEN_URI())
                  const owner = await basicNFT.ownerOf("0")
                  console.log(owner)
                  console.log(deployer.address)
                  assert.equal(owner, deployer.address)
              })
          })
      })
