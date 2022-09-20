// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
 import "hardhat/console.sol";
/// @title A generic NFT(ERC721) contract
contract Mynft is ERC721 {
    ///@notice using a default nft name and symbol to intialize ERC721
    constructor() ERC721("Mynft", "MNFT") {}

    function safeMint(address to, uint256 tokenId) external  {
        console.log("Minting address %s for tokenId ",to,tokenId);
        _safeMint(to, tokenId);
        address temp=ownerOf(1);
        console.log("owner of 1 %s to: %s",temp,to);
    }
}
