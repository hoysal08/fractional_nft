//SPDX-License-Identifier:MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
 
 ///@title DutchAuction for ERC20 token
 ///@author Sooraj hoysal
 ///@notice contract has to be deployed with the same address which holds ERC20 tokens

    contract DutchAuction{
       
       ///@dev The duration of auction can't be altered after initialized,represents the duration auction can last for.
       uint private immutable duration;
       
       ///@dev The contract address of the tokens to be auctioned for which can't be altered after initialized
       IERC20 public immutable fractionalcnt;
       
       ///@dev The owner of tokens to be sold
       address payable public immutable seller;
       
       ///@dev The starting price for the auction 
       uint public immutable startingPrice;
       ///@dev the timestamp of start of the auction
       uint public immutable startAt;
       ///@dev The number of days the auction has to last
       uint public immutable expiresAt;
       ///@dev The amount of Wei to be decreased for every passing second
       uint public immutable discountRate;
                    

        /**
         * @dev Initializes the immutable state variables
         * 
         * Requirments:
         *     - The startingprice has to be greater than the product of discount rate and timeperiod(in seconds)
         *     - The owner of the contract should have balance of token greater than 0
         *     - `_fractioncontract` should not be zero address
         * 
         * @param _startingprice The starting price of the auction
         * @param _discountedRate The discount rate by which the price decrease's every second
         * @param  _fractioncontract The contract address of the tokens to be sold
         * @param _timeperiod The timeperiod of the maximum days the auction should continue
         */

       constructor(uint _startingprice,
                   uint _discountedRate,
                   address _fractioncontract,
                   uint _timeperiod
                ){

                    require(
                        _startingprice>=_discountedRate*(_timeperiod* 1 days),
                        "starting price has to greater than discount"
                        ); 
                    require(
                        IERC20(_fractioncontract).balanceOf(msg.sender)>0,
                        "you don't have enough balance"
                        );
                    require(_fractioncontract!=address(0),"Invalid Contract address");

                    seller=payable(msg.sender);
                    startingPrice=_startingprice;
                    discountRate=_discountedRate;
                    startAt=block.timestamp;
                    duration=_timeperiod * 1 days;
                    expiresAt=block.timestamp+(_timeperiod*1 days);
                     

                    fractionalcnt=IERC20(_fractioncontract);
                }

    /**
     * @dev To check if the auction is still in progress and if the time has exceeded
     */

    modifier auctioninprogress {
        if(block.timestamp<expiresAt){
            _;
        }
        else {
            revert("Sorry,auction has ended!");
        }
    }

    /**
     * @dev Used to always get the current price for each token
     * 
     */
    function getPrice() public view auctioninprogress returns(uint) {
        uint  timeElapsed=block.timestamp-startAt;
        uint  discount=discountRate*timeElapsed;
        return startingPrice-discount;
    }

     /**
      *  @dev the buyer can buy desired amount of tokens
      *  @dev the function also refunds the extra eth , which was not used for buying the tokens
      *  @notice the transactions won't proceed if the approved limit by the owner is less than the requested amount
      * 
      * Requirments:
      *     - `_amount` should be greater than 0
      *     - the amount of eth sent by the user with the  buy call, should be greater than the (currentprice*_amount)
      * 
      * @param _amount the amount of tokens user requesting to buy
      *
      */  
    function Buy(uint  _amount)external auctioninprogress payable {

        require(fractionalcnt.balanceOf(seller)!=0,"The auction has ended");
        require(_amount>0,
        "requested amount of tokens should be greater than 0"
        );
        require(
            fractionalcnt.balanceOf(seller)>=_amount,
            "The request exceeds present avaialable tokens"
            );
        require(
            fractionalcnt.allowance(seller,address(this))>=_amount,
            "The approved amount of tokens are sold out,come back later"
            );

        uint  price=getPrice();
        uint  buyamount=price*_amount;
        require(msg.value>=buyamount,"The eth sent is insufficent");

        bool  tnx_status=fractionalcnt.transferFrom(seller,msg.sender,_amount);
        if(tnx_status)
        {
        uint  refund=msg.value-buyamount;

        if(refund>0)
            payable(msg.sender).transfer(refund);   
        }

    }
    /**
     * @dev the function transfers the contract balance to the seller
     * 
     * Requirment:
     *      -The function has to be called only by the seller
     */

    function withDraw() external {
        require(msg.sender==seller,"Unauthorised Call");
        seller.transfer(address(this).balance);
}    
      /**
     * @dev the function transfers the contract balance to the seller and kills the contract from any further transactions
     * @notice The fucntion call will kill the auction and has to be called only in emergency
     * 
     * Requirment:
     *      -The function has to be called only by the seller
     */

    function closeAuction()external{
    require(msg.sender==seller,"Unauthorised Call");
    selfdestruct(seller);
    }
}

