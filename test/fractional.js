const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { describe } = require("mocha");
require("@nomicfoundation/hardhat-chai-matchers");

const Million=1000000;
const thousand = 10000;
describe("fractional",function (){
    //fixture to deploy nft, fraction contract
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
     
    //fixture to deploy nft contract
    async function deployFixture()
    {
        const[account1,owner]=await ethers.getSigners();
        
        const NFTcontract=await ethers.getContractFactory("Mynft",account1);
        let nftcontract=await NFTcontract.deploy();
        await nftcontract.deployed();
        const tokenId=1;

        await nftcontract.connect(owner).safeMint(owner.address,tokenId);

        return {owner,account1,nftcontract,tokenId};

    }

    describe("minting and Fractional ownership of NFT's" , async function (){
       
        it("NFT contract initialized with name and symbol",async function (){
         const{nftcontract}=await loadFixture(deployFixture);

         expect(await nftcontract.name()).to.be.equal("Mynft");
         expect(await nftcontract.symbol()).to.be.equal("MNFT");
        });

        it("NFT minted successfully",async function (){
        const{owner,nftcontract,tokenId}=await loadFixture(deployFixture);

        expect(await nftcontract.ownerOf(tokenId)).to.be.equal(owner.address);
         });
          

         it("The collection and tokenId are initialized",async function (){
            const {nftcontract,fractioncontract,tokenId}=await loadFixture(deployFixturefrac);

            expect(await fractioncontract.collection()).to.be.equal(nftcontract.address);
            let tokenid= ethers.BigNumber.from(await fractioncontract.tokenId()).toNumber();
            expect(tokenid).to.be.equal(tokenId);
         });

         it("NFT is transfered to fractional contract",async function (){
         const {nftcontract,fractioncontract,tokenId}=await loadFixture(deployFixturefrac);

          expect(await nftcontract.ownerOf(tokenId)).to.be.equal(fractioncontract.address);
        })

        it("fractional contract can't be intialized with zero address",async function (){
            const {fractioncontract,tokenId}=await loadFixture(deployFixturefrac);

            const zeroaddr=ethers.constants.AddressZero;
            await expect(fractioncontract.Intialize(zeroaddr,tokenId)).to.be.reverted;
        })

        it("fractional contract can't be intialized more than once",async function (){
            const {nftcontract,fractioncontract,tokenId}=await loadFixture(deployFixturefrac);

            await expect(fractioncontract.Intialize(nftcontract.address,tokenId)).to.be.revertedWith("Already Initialized")
        })
        
        it("Mints 1 Million fractions",async function (){
            const {fractioncontract}=await loadFixture(deployFixturefrac);

             expect(await fractioncontract.totalSupply()).to.be.equal(Million);
        })

        it("Mints 1 million fractions for the NFT owner",async function (){
            const {owner,fractioncontract}=await loadFixture(deployFixturefrac);

             expect(await fractioncontract.balanceOf(owner.address)).to.be.equal(Million);
        })
        
        it("The minted fractions can be transfered",async function (){
            const {owner,account1,fractioncontract}=await loadFixture(deployFixturefrac);

            await fractioncontract.connect(owner).transfer(account1.address,thousand);
            expect(await fractioncontract.balanceOf(account1.address)).to.be.equal(thousand);
            expect(await fractioncontract.balanceOf(owner.address)).to.be.equal(Million-thousand);
        });
    })
})