# NFT Hardhat Project

3 contracts of NFT

-   Basic NFT
-   Random IPFS NFT
-   Dynamic SVG NFT

1. Need to put some gasPrice in hardhat.config to Deploy on Sepolia network:
   https://stackoverflow.com/questions/71343598/providererror-transaction-underpriced-on-mumbai-testnet

```shell
module.exports = {
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            gasPrice: 35000000000,
            chainId: 11155111,
            blockConfirmations: 6,
```
