//SPDX-License-Identifier:MIT
pragma solidity ^0.8.10;

interface IERC721{
    function transferFrom(
        address _from,
        address _to,
        uint _nftId
    ) external;
}
    contract DutchAuction{

       uint private constant DURATION=7 days;
       
       IERC721 public immutable nft;
       uint public immutable nftId;
       
       address payable public  immutable seller;
       uint public immutable startingPrice;
       uint public immutable startAt;
       uint public immutable expiresAt;
       uint public immutable discountRate;

       constructor(uint _startingprice,
                   uint _discountedRate,
                   address _nft,
                   uint _nftId
                ){
                    seller=payable(msg.sender);
                    startingPrice=_startingprice;
                    discountRate=_discountedRate;
                    startAt=block.timestamp;
                    expiresAt=block.timestamp+DURATION;
                     
                    require(_startingprice>=_discountedRate*DURATION,"starting price has to breater than discount"); 

                    nft=IERC721(_nft);
                    nftId=_nftId;

                }

    function getPrice( ) public view returns(uint){
        uint timeElapsed=block.timestamp-startAt;
        uint discount=discountRate*timeElapsed;
        return startingPrice-discount;
    }
       
    function buy()external payable{
        require(block.timestamp<expiresAt,"Auction ended");

        uint price=getPrice();
        require(msg.value>=price,"Eth<price");

        nft.transferFrom(seller,msg.sender,nftId);
        uint refund=msg.value-price;
        if(refund>0){
            payable(msg.sender).transfer(refund);
        }

        selfdestruct(seller);
    }
    }
