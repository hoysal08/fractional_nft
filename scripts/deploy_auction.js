const {ethers,network}=require("hardhat");
let params = require("../constructor_ip");
let fractional_contract=require("../src/Fractional.json")
let nft_collection=require("../src/NFT_collection.json")
const fs = require("fs");
const { utils } = require("ethers");


async function main(){ 

  const fractional_contract_address=utils.getAddress(fractional_contract.address)
  const  nft_collection_address=utils.getAddress(nft_collection.address);

  console.log("Deploying auction contract....");
  console.log("Minting NFT to fractionlize... from ",nft_collection_address);

  const[owner]=await ethers.getSigners();
  let tokenid=11;

  let nft_contract= new ethers.Contract(nft_collection_address,nft_collection.abi,owner);
  //await nft_contract.safeMint(owner.address,tokenid);
  //await nft_contract.connect(owner).approve(fractional_contract_address,tokenid);

  console.log("Initalizing fraction contract with contract",nft_collection_address);

  let fraction_contract= new ethers.Contract(fractional_contract_address,fractional_contract.abi,owner);
  //await fraction_contract.connect(owner).Intialize(nft_collection_address,tokenid);

  const startingprice=utils.parseEther(params.startingprice)

  const Dutch_Auction=await ethers.getContractFactory("DutchAuction",owner);
  const dutch_auction=await Dutch_Auction.connect(owner).deploy(startingprice,params.discountRate,fractional_contract_address,params.timeperiod);

  await dutch_auction.deployed();

  let approvedtokens=10000;
  await fraction_contract.connect(owner).approve(dutch_auction.address,approvedtokens);

  console.log("Dutch auction deployed at:",dutch_auction.address);

    const data = {
        address: dutch_auction.address,
        abi: JSON.parse(dutch_auction.interface.format('json'))
      }
    
      //This writes the ABI and address to the mktplace.json
      fs.writeFileSync('./src/auction.json', JSON.stringify(data))
}



  main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });