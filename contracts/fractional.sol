// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

///@title NFT fractional ownership 
///@author Sooraj Hoysal
///@notice The contract can receive NFT as we are using ERC721Holder
///@notice contract has to be deployed with the same address which holds tokens

contract Fractional is ERC20, Ownable, ERC721Holder {
    ///@dev Collection address and tokenId for the NFT to be fractionalized
    IERC721 public collection;
    uint256 public tokenId;

    ///@dev To contain the contract to be initialized more than once
    bool public initialized=false; 
     
    ///@notice The number of fractions is equal to 1 Million
    uint256 public constant FRACTIONS=1000000;
    
    ///@notice using a default  name and symbol to intialize ERC20
    constructor() ERC20("MyFractions", "MF")  {}
    
    /**
     * @dev Initializes the contract
     *     -Sets the collection address and tokenId for the token to be fractionalized
     *     -Mints 1 Million tokens to the NFT owner
     * 
     * @notice The tokenId being has to be approved so the contract can aquire ownership
     * 
     * @param _collection contract address of the NFT to be fractionalized
     * @param _tokenId The tokenId to be fractionalized and approved for
     */
    function Intialize(
        address _collection,
        uint256 _tokenId
        ) external onlyOwner {
        require(
            _collection!=address(0),
            "Invalid collection address"
            );
        require(!initialized,"Already Initialized");
        collection=IERC721(_collection);
        collection.safeTransferFrom(msg.sender,address(this),_tokenId);
        tokenId=_tokenId;
        initialized=true;
        
        _mint(msg.sender,FRACTIONS);
    }
}
