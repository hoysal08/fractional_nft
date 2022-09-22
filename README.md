# A NFT fractional contract with Dutch Auction

The repo contains 3 contracts
1. Generic ERC721 NFT contract
2. Fractionl contract
3. Dutch Auction contract

## Work Flow

- Deploy the NFT contract and mint a NFT or use any existing NFT.
- Deploy the Fractionl contract with the same address which holds the NFT to be Fractionalized.
- Call the Initialize function on the Fractional contract with the nft collection address and the tokenId of the NFT to be Fractionalized.
- Bingo, you have 1 Million Fraction's of your NFT in your Wallet.
- You can put these fractions to sale using a Dutch Auction to enable Multilple Ownership.
- Deploy the Dutch auction with the  following augmuents Fractional contract address,starting price for the auction,the discount rate by which you want the price to decrease per second,the time period till when the auction should last for.

## How to run the code?

1. clone the repo
2. install the dependencies using  
``` npm install ```
3. Run the tests using  
``` npx hardhat test```  
4. Deploy the contracts using  
*Don't forget to mention the network , use (--network localhost) to deploy to local chain*  
*Update env file to deploy to mainnet or testnet*  
```npx hardhat run scripts/deploy.js```  
```npx hardhat run scripts/deploy_auction.js```

### Check out verified here (Etherscan)
- [NFT contract](https://goerli.etherscan.io/address/0x26d2702B6BEA3DE42660ec420E10cA813495A749)
- [Fractional contract](https://goerli.etherscan.io/address/0xcCd26278E477D0E0A30979e029Aa61396976de56#readContract)
- [Dutch auction](https://goerli.etherscan.io/address/0xB05788611Bdbfd43044cBA90315F3C5623fB1203)

# Wanna know more?  


### Fractional Contract  


The contract gets the ownership of the NFT and returns you 1 Million fungible tokens, which can be used to represent partial ownership of the NFT. These tokens can be transfered to anybody and can even be introduced to secondary market(uniswap etc...)  

### Dutch Auction

Dutch Auction is different then traditional auctions, as the price endup going down as the time passes by.The contract has to be provided with the starting price of the auction , discount rate which will be amount of the price drop for the asset for every passing second, the address of the fractional contract for where the asset for the auction has to be transfered from, the maximum time till when the auction has to continue incase the assets don't run out.

Any user can now access the buy function to get hold of these tokens at the current running price, any extra amount attached than the asset purchased will be refunded to the buyer.

The owner can withdraw the ETH from the contract at any time using the withdraw function.

Once the time for the given auction ends there can't be anymore transactions to buy the tokens.The auction also stops once the sellers balance gets sold out.


