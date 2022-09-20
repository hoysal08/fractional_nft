const {ethers,network}=require("hardhat");
const fs = require("fs");
// require("dotenv").config();

async function main(){

  const NFT_collection=await ethers.getContractFactory("Mynft");
  const nft_collection=await NFT_collection.deploy();

  await nft_collection.deployed();

  console.log("NFT Collection deployed at:",nft_collection.address);

  const collection_data = {
    address: nft_collection.address,
    abi: JSON.parse(nft_collection.interface.format('json'))
  }

  //This writes the ABI and address to the mktplace.json
  fs.writeFileSync('./src/NFT_collection.json', JSON.stringify(collection_data))


  const Fractional=await ethers.getContractFactory("Fractional");
  const fractional=await Fractional.deploy();

  await fractional.deployed();

  console.log("Fractional deployed at:",fractional.address);
  console.log("Please Intialize the contract with desired NFT");
 
  const fractional_data = {
    address: fractional.address,
    abi: JSON.parse(fractional.interface.format('json'))
  }

  //This writes the ABI and address to the mktplace.json
   fs.writeFileSync('./src/Fractional.json', JSON.stringify(fractional_data))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });