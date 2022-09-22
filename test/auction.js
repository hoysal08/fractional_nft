const {expect} = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { describe } = require("mocha");
require("@nomicfoundation/hardhat-chai-matchers");
let params = require("../constructor_ip");


const Million=1000000;

describe("Auction",async function() {
      
    //fixture to deploy nft.fraction,auction contract
    async function deployFixture(){
        
        const[account1,owner]=await ethers.getSigners();
        
        const NFTcontract=await ethers.getContractFactory("Mynft",account1);
        const nftcontract=await NFTcontract.deploy();
        await nftcontract.deployed();
        
        const FractionContract=await ethers.getContractFactory("Fractional",owner);
        const fractioncontract=await FractionContract.deploy();
        await fractioncontract.deployed();
         
        const tokenId=1;

        await nftcontract.connect(owner).safeMint(owner.address,tokenId);
        await nftcontract.connect(owner).approve(fractioncontract.address,tokenId);

        await fractioncontract.Intialize(nftcontract.address,tokenId);

        const startingprice=ethers.utils.parseEther(params.startingprice)

                
        const Dutch_Auction=await ethers.getContractFactory("DutchAuction",owner);
        const dutch_auction=await Dutch_Auction.deploy(startingprice,params.discountRate,fractioncontract.address,params.timeperiod);
        await dutch_auction.deployed(); 
        
        const approvedtokens=1000;
        await fractioncontract.connect(owner).approve(dutch_auction.address,approvedtokens); 

      return {owner,account1,nftcontract,fractioncontract,tokenId,dutch_auction};
    }
   
    //fixture to deploy nft,fraction contract
    async function deployFixturefrac(){
        
      const[account1,owner]=await ethers.getSigners();
      
      const NFTcontract=await ethers.getContractFactory("Mynft",account1);
      let nftcontract=await NFTcontract.deploy();
      await nftcontract.deployed();
      
      const FractionContract=await ethers.getContractFactory("Fractional",owner);
      const fractioncontract=await FractionContract.deploy();
      await fractioncontract.deployed();
       
      const tokenId=1;

      await nftcontract.connect(owner).safeMint(owner.address,tokenId);
      await nftcontract.connect(owner).approve(fractioncontract.address,tokenId);

     await fractioncontract.Intialize(nftcontract.address,tokenId);

    return {owner,account1,nftcontract,fractioncontract,tokenId};
  }

    describe("Check for a valid auction process",async function() {
         
      it("The seller of the auction is the token holder",async function (){
            const{owner,dutch_auction}=await loadFixture(deployFixture);

            expect(await dutch_auction.seller()).to.be.equal(owner.address);
         });

      it("Non token holder can't start auction",async function (){
         const {account1,fractioncontract}= await loadFixture(deployFixturefrac);

         const startingprice=ethers.utils.parseEther(params.startingprice)

         const Dutch_Auction=await ethers.getContractFactory("DutchAuction",account1);
         await expect(  Dutch_Auction.deploy(startingprice,params.discountRate,fractioncontract.address,params.timeperiod)).to.be.revertedWith("you don't have enough balance"); 
      });

      it("The NFT contract address can't be a zero account",async function (){

        const {owner}= await loadFixture(deployFixturefrac);

        const startingprice=ethers.utils.parseEther(params.startingprice)

        const Dutch_Auction=await ethers.getContractFactory("DutchAuction",owner);
        const zeroaddr=ethers.constants.AddressZero;
        await expect(  Dutch_Auction.deploy(startingprice,params.discountRate,zeroaddr,params.timeperiod)).to.be.reverted; 
      });

    it("Users can buy tokens in auction ",async function (){
       const{account1,fractioncontract,dutch_auction}=await loadFixture(deployFixture);

        let amount=5;
       
        await dutch_auction.connect(account1).Buy(amount,{value: ethers.utils.parseEther("1.0")})
        expect(await fractioncontract.balanceOf(account1.address)).to.be.equal(amount)
    })
    it("Users can't buy tokens if the amount sent is Insufficent",async function (){
      const{account1,fractioncontract,dutch_auction}=await loadFixture(deployFixture);

      let amount=10;
     
      await expect( dutch_auction.connect(account1).Buy(amount,{value: ethers.utils.parseEther(".05")})).to.be.revertedWith("The eth sent is insufficent");
     expect(await fractioncontract.balanceOf(account1.address)).to.be.equal(0);
    });

    it("The users can't buy tokens more then the sellers balance",async function (){
      const{account1,fractioncontract,dutch_auction}=await loadFixture(deployFixture);

      let amount=Million+1;
    
      await expect( dutch_auction.connect(account1).Buy(amount,{value: ethers.utils.parseEther("5.0")})).to.be.revertedWith("The request exceeds present avaialable tokens");
     expect(await fractioncontract.balanceOf(account1.address)).to.be.equal(0);
    });

    it("The users can't buy tokens more then the approved limit",async function (){

      const{account1,fractioncontract,dutch_auction}=await loadFixture(deployFixture);
      
      const approvedtokens=1000;
      let amount=approvedtokens+1;

     await expect( dutch_auction.connect(account1).Buy(amount,{value: ethers.utils.parseEther("100.0")})).to.be.revertedWith("The approved amount of tokens are sold out,come back later");
     expect(await fractioncontract.balanceOf(account1.address)).to.be.equal(0);
    });
     
    it("The ether's from the contract can be withdrawn only by owner",async function (){

      const{owner,account1,dutch_auction}=await loadFixture(deployFixture);

      let amount=5;

      dutch_auction.connect(account1).Buy(amount,{value: ethers.utils.parseEther("1.0")})

      let owner_balance=await ethers.provider.getBalance(owner.address);
      await dutch_auction.connect(owner).withDraw()
      let new_owner_balance=await ethers.provider.getBalance(owner.address);
      
      expect(new_owner_balance).to.be.greaterThanOrEqual(owner_balance);
      expect(await ethers.provider.getBalance(dutch_auction.address)).to.be.equal(0);
    })

    it("Withdraw fails if called by other than owner", async function() {
      const{account1,dutch_auction}=await loadFixture(deployFixture);

      let contract_balance=await ethers.provider.getBalance(dutch_auction.address)
      await expect(dutch_auction.connect(account1).withDraw()).to.be.revertedWith("Unauthorised Call");
      let new_contract_balance=await ethers.provider.getBalance(dutch_auction.address)
      
      expect(new_contract_balance).to.be.equal(contract_balance);
    })

    it("The contract can be destroyed only by owner", async function (){
      const{owner,account1,dutch_auction}=await loadFixture(deployFixture);
      
      await expect(dutch_auction.connect(account1).closeAuction()).to.be.revertedWith("Unauthorised Call");
      await expect(dutch_auction.connect(owner).closeAuction()).not.to.be.reverted;      

    })
    })
})