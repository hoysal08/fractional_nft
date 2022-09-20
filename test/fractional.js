const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { describe } = require("mocha");

describe("fractional",function (){
    async function deployFixture(){
        
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

        fractioncontract.Intialize(nftcontract.address,tokenId);

      return {owner,account1,nftcontract,fractioncontract,tokenId};

    }

    describe("Deployment" , async function (done){
       
        it("NFT contract initialized with name and symbol",async function (){
         const{nftcontract}=await loadFixture(deployFixture);
         expect(await nftcontract.name()).to.be.equal("Mynft");
         expect(await nftcontract.symbol()).to.be.equal("MNFT");
        });

        it("NFT minted successfully",async function (){
        const{owner,account1,nftcontract,fractioncontract,tokenId}=await loadFixture(deployFixture);
        console.log(owner.address);
         
        expect(await nftcontract.ownerOf(tokenId)).to.be.equal(owner.address);
         });

    })
})