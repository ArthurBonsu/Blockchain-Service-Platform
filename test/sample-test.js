const BrowserFS = require('browserfs');
const { expect } = require("chai");
const ReactDom= require ("react-dom")
const web3 = require ("web3")
//const { ethers } = require("hardhat");
const hre = require("hardhat");
const { Signer, BigNumber, ContractFactory, Contract, ethers } =require("ethers");
const etherprojectprovider = require ("@ethersproject/providers")
const etherprojectnetwork = require ("@ethersproject/networks")
const {SignerWithAddress} = require("@nomiclabs/hardhat-ethers/signers");
//const { expect } = require( "chai");
const chai  = require("chai");
const BN =require('bn.js')
chai.use(require('chai-bn')(BN));
const chaiaspromised = require("chai-as-promised");
const { Wallet } = require("ethers");
require("@nomiclabs/hardhat-web3")
const GnosissafeContract  = artifacts.require("GnosisSafeGetAddresses");
const ArtifactAbi = require("../artifacts/contracts/GnosisSafeGetAddresses.sol/GnosisSafeGetAddresses.json");

console.log( "Artifact Abi", ArtifactAbi); 
//const GnosisSafeGetAddresses__factory = "./typechain/factories/GnosisSafeGetAddresses__factory";
//const GnosisSafeGetAddressesInterface = "./artifacts/contracts/GnosisSafeGetAddresses.json";

//const GnosisSafeGetAddressesInstance = artifacts.require("/GnosisSafeGetAddresses");
// GnosisSafeGetAddressesInstance.link("GnosisSafeGetAddresses", GnosisSafeGetAddressesInstance.address);
const assert = require('assert');
//const { doesNotMatch } = require("assert");
let dotenv =require('dotenv');
dotenv.config()
let fs = require('node:fs/promises');
const { Console } = require("console");
require("@nomiclabs/hardhat-waffle");

if (typeof window !== 'undefined'){
const BrowserFS = require('browserfs');
BrowserFS.install(window);
const fs = require('fs');
BrowserFS.FileSystem.InMemory.Create((err, inMemoryFS) => {
  if (err) throw err;
  fs.mkdirSync('/sandbox');
  fs.mount('/sandbox', inMemoryFS);
  fs.writeFileSync('/sandbox/test.txt', 'Hello, BrowserFS!');
  // Use fs methods to read/write files
});
fs.readFile('/sandbox/test.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data); // Output: Hello, BrowserFS!
});

}
let gnosissafeaddresshere;
let provider; 
let contractaddress; 
let gnosisSafeGetAddressescontractx;

let signer;
let gnosissafestring; 

let myaddress = "0x06Da25591CdF58758C4b3aBbFf18B092e4380B65";
let signeraddress;
let walletaddress;
let safestring ="0x345";
 let GnosisSafeGetAddresses;
   let gnosisSafeGetAddressescontract;
 let transactiontx ;
let comparetx;
  let owner;
  let  addr1;

  let payment;
  let myreceiver = "0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe";

  var address2 = '0x91796AA285Cc5770fEd2f1B496b411f5BE3ED9D4';

  let  signers;
     let amount = 2;
  let amountofbnstring;
   let amountofbn;
       // pull out 1 signer as our admin
  let admin;

  let walletsigner;
     
let account;
let mycontractaddress;
let  transfertx;
let n;
let receitpId;
let x;
let y;

let myEventFilter;
let listener1;
let listener2;

let network;
let chainId;
/*
const {
  ethers,
  deployerWallet,
  account1Wallet,
  account2Wallet,
  ContinousToken,
  GanacheDaiToken,
  provider,
  daiAbi,
  expectEvent,
  expectRevert,
  isDev
} = require('../scripts/helpers/common');
*/
  //it("Should deploy via metamask and web3 provider", async () => {
  
 //   if (typeof window !== 'undefined' ) {

 //     provider = new ethers.providers.Web3Provider(window.ethereum);
 //     console.log("This is " +provider)
    // await provider.send("eth_requestAccounts", []);
 //}
 
 
  //});

   // provider = new ethers.providers.getDefaultProvider("ropsten");
  //  signer = provider.getSigner()
 // provider = provider = new InfuraProvider("ropsten");
     //signeraddress =signer._address;

    // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.


  /// --WEB3 
  /*  const Web3 = require("web3");
  hre.Web3 = Web3;

  // hre.network.provider is an EIP1193-compatible provider.
  hre.web3 = new Web3(hre.network.provider); */
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.


  
    let provider = new ethers.providers.InfuraProvider('ropsten');

       console.log("This is my provider" + provider);
      // also known as signer or provider.getSigner()
       walletsigner = await new  ethers.Wallet.fromMnemonic(String(process.env.MNEMONIC)) 
       // signer is thethe signer address not signer

       //  also known as provider.signer(0)
       signer =  walletsigner.address;
       // the wallet activated becomes the account
       // Web3 joins the two together( the wallet(signer) and the provider)
       // the active userthat can send the transaction, has the signer and the connection 

   
       account = await  walletsigner.connect(provider);
       console.log(" account is the account here" + account)
       console.log("This is my signer" + signer);
        let myprovider = walletsigner.provider;
 //     const networkId = (await walletsigner.provider.getNetwork()).chainId;
         console.log("This is my myprovider" + myprovider);
        
        let mywalletbalance = await account.getBalance();
        console.log("This is the balance", mywalletbalance);
   //    const network = await etherprojectnetwork.getNetwork('ropsten')
     //   console.log(network)

          amountofbn = await new ethers.BigNumber.from(amount);
         console.log("This is BigNumber",amountofbn );
         
         
         amountofbnstring = amountofbn.toString();
     

    //  let bytecode = fs.readFileSync('GnosisSafeGetAddressesInterface').toString();
      //  let abi = JSON.parse(fs.readFileSync('GnosisSafeGetAddresses').toString());

         GnosisSafeGetAddresses = await hre.ethers.getContractFactory("GnosisSafeGetAddresses");
         gnosisSafeGetAddressescontract = await GnosisSafeGetAddresses.deploy(account.address);
         console.log("This is deployment" + await gnosisSafeGetAddressescontract);
        
         [owner] = await hre.ethers.getSigners(0);
         console.log ("Owner" + await owner.getAddress());
         console.log("Address" + await addr1 );
         
             
       gnosissafeaddresshere=  await gnosisSafeGetAddressescontract.deployed();

       mycontractaddress = await gnosisSafeGetAddressescontract.address;
       console.log ("This is after being deployed " + await mycontractaddress )
      
      signers = await hre.ethers.getSigners();
     console.log("This is the signers" + await signers);
  
       // pull out 1 signer as our admin
       admin = signers[0];

       console.log("Admin" + await admin.getAddress());


       /*

const accounts = await ethers.getSigners();

  console.log(
    "Accounts:",
    accounts.map((a) => a.address)
  );
*/
       admin = signers[0];

       console.log("GetBalance" + await admin.getBalance());

   
       
  
   
 
   
   
   
   
   
      });
    

     describe("Token contract", function () {
        //  const signer = await  ethers.getSigners()
     //   console.log ("This is the signer ", signer[0])
     let provider = new ethers.providers.InfuraProvider('ropsten');

      it("Deployment should assign the total supply of tokens to the owner", async function () {


      transactiontx = await gnosisSafeGetAddressescontract.storeGnosisSafeAddress(account.address,safestring);
 
  //    expectEvent(transactiontx, 'GnosisSafeAddress', { _walletaddressevent: account.address, _safestringevent: safestring});

      listener1 = await gnosisSafeGetAddressescontract.on("GnosisSafeAddress", (x, y) => {
        console.log(`Gnosis Safe Details Provided ${x} to ${y}`);
      });
      
      // Listen for one new event
       listener2 = await gnosisSafeGetAddressescontract.once("GnosisSafeAddress", (x, y) => {
        // ...
        console.log(`Listen One For Event ${x} to ${y}`);
        
       })

      comparetx = await gnosisSafeGetAddressescontract.getSafeAddresses(account.address);

    

        let transactionreceiptx =  transactiontx.wait()
         console.log ("Gnosis Safe transactional ", await transactionreceiptx );
        
    




        receitpId  = await transactionreceiptx.events;
     // console.log("Receipt Given ",await   transactionreceiptx.event[0].topics[0]);

     console.log("Receipt Given ", receitpId);


// Create a filter that queries events with a `val1` of 1 and a `val2` of 2 (only works with `indexed` parameters)
/// ETHERJS EVENTS TARGET
 //LISTENERS

 

 


   
 //console.log("First listener",listener1 );
 //console.log("Second listener", listener2);


//FILTERS
// for filtering you are very specific as to what you want 
// for filtering you put in your parameters so that you can be able to get all the log information aboout it
// so you use 'filter'
// for queryfilter , you use it with blockhash range of values from a certain block to a particular block

// you use .event.args() to get the values you aim to query
 myEventFilter = gnosisSafeGetAddressescontract.filters.GnosisSafeAddress(account.address, y);
 console.log ("Event Filter", myEventFilter);
 console.log ("Event Filter Address ", myEventFilter.address);
 console.log ("Event Filter Topics", myEventFilter.topics);
 console.log ("Event Filter Topics Array", myEventFilter.topics[0].toString());
 
})


    
      it("It should check for completion of payments ", async function () {
        let provider = new ethers.providers.InfuraProvider('ropsten');
      //  account
        payment = await gnosisSafeGetAddressescontract.connect(account).payfee(myreceiver, amountofbn );
    

        //  await   payment.wait();
    ///Wait () does not work with payment transaction especially for those resolving within the smart contracty

     console.log ("payment transaction", payment);


      console.log ('hash' +  await payment.hash);
    
      let txobject= {
     from:account.address,
     to: payment.to,    
     value:payment.value,
 }  



 
     let transactionsend =  await account.connect(provider).sendTransaction(txobject);

     let sendtransactionreceipt =   transactionsend.wait()
    
    
     // For Wait avoid using await when trying to obtain values for .wait()
 
     console.log("Transactions to be sent",  sendtransactionreceipt);
  

     //  console.log("Hash", + payment.hash);

  let txsendtransaction = await account.connect(provider).sendTransaction({
      to:myreceiver.address,
      value:ethers.utils.parseEther("0.01"),

    })
    
    
      })
/*
      it("It should change the provider we have  ", async function () {
    //   console.log("Window", window);
        if (typeof web3 !== 'undefined') {
         
      
        provider = new ethers.providers.Web3Provider(web3.currentProvider);
        
           console.log ("This is the old provider",provider );

          
         network = await provider.getNetwork();
 
         console.log ("This is the network", network);
         chainId = network.chainId;
         console.log ("This is the chainId", chainId);
        }  })
    
*/

/*

      it("It should test for all events here   ", async function () {


    //   console.log("Window", window);
        if (typeof web3 !== 'undefined') {
         
      
        provider = new ethers.providers.Web3Provider(web3.currentProvider);
        
           console.log ("This is the old provider",provider );

          
         network = await provider.getNetwork();
 
         console.log ("This is the network", network);
         chainId = network.chainId;
         console.log ("This is the chainId", chainId);
        }  
      
      })
    

*/



 
      })