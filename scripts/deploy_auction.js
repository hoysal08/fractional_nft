const {ethers,network}=require("hardhat");
let params = require("../constructor_ip");
let fractional_contract=require("../src/Fractional.json")
const fs = require("fs");
const { utils } = require("ethers");


async function main(){ 
  const contract_address=utils.getAddress(fractional_contract.address)
  const startingprice=utils.parseEther(params.startingprice)

  const Dutch_Auction=await ethers.getContractFactory("DutchAuction");
  const dutch_auction=await Dutch_Auction.deploy(startingprice,params.discountRate,contract_address,params.timeperiod);

  await dutch_auction.deployed();

  console.log("Dutch auction deployed at:",dutch_auction.address);
    const data = {
        address: dutch_auction.address,
        abi: JSON.parse(dutch_auction.interface.format('json'))
      }
    
      //This writes the ABI and address to the mktplace.json
      fs.writeFileSync('./src/auction.json', JSON.stringify(data))
}

/*
                   uint _startingprice,
                   uint _discountedRate,
                   address _fractioncontract,
                   uint _timeperiod
*/

  main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });