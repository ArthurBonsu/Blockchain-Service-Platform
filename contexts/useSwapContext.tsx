import React, { useEffect, useState } from "react";
import { Contract, ethers, Signer, BigNumberish} from "ethers";
let contractABI = ""; // Populate with your contract's ABI
let contractAddress = " "; // Populate with your contract's address
import { SwapNewTokenTransaction } from 'types/ethers';
const chai = require("chai");
const BN = require('bn.js');
chai.use(require('chai-bn')(BN));
const chaiaspromised = require("chai-as-promised");
const { Wallet } = require("ethers");
const { ethereum } = window;
require("@nomiclabs/hardhat-web3");
import { Provider } from "@ethersproject/providers";
import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';

interface SwapProp {
  transactionObject: SwapNewTokenTransaction;
  tokenAname: string;
  symbolA: string;
  tokenBname: string;
  symbolB: string;
  amount: number;
  newamount: string;
  newcontract: Contract;
}

interface sendTransactionProp {
  signer: Signer;
  provider: Web3Provider;
  transactionObject: SwapNewTokenTransaction;
  newcontract: Contract;
}

export const useSwapContext = () => {
  const createEthereumContract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = await provider.getSigner();
    const swapContract = new ethers.Contract(contractAddress, contractABI, signer);
    return { swapContract, signer, provider };
  };

  let accounts: Array<string>;
  const [formData, setformData] = useState({
    tokenAname: "",
    symbolA: "",
    tokenBname: "",
    symbolB: "",
    amount: 0,
    newamount: 0
  });
  const [currentAccount, setCurrentAccount] = useState("");
  const [accountsretrieved, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [origamount, setTokenAmount] = useState(0);
  const [newtokenamount, setNewTokenAmount] = useState(0);
  const [transactions, setSwapTransactions] = useState({
    tokenAname: "",
    symbolA: "",
    tokenBname: "",
    symbolB: "",
    amount: 0,
    newamount: 0,
    swaphash: "",
    from: "",
    to: ""
  });
  const [transactioninfocase, setTransactionInfo] = useState({});
  const [transactionCount, setTransactionCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const swapTKA = async ({ tokenAname, symbolA, tokenBname, symbolB, amount }: SwapProp) => {
    try {
      if (ethereum) {
        const { swapContract, signer, provider } = await createEthereumContract();
        const amountoftokens = ethers.utils.parseEther(amount.toString());
        console.log("This is the amount of tokens", amountoftokens);
        const newswaptransaction = await swapContract.swapTKA(amountoftokens);
        const newtransaction = await newswaptransaction.wait();
        setSwapTransactions(newswaptransaction);
        const filter = swapContract.filters.eventswapTKA(0); 
        const results = await swapContract.queryFilter(filter);
        console.log(results);
        const counterretrieved = newtransaction.events[0].args.swapTKAcounter.toNumber();
        const initialamount = newtransaction.events[0].args.initialamount.toNumber();
        const newtokenamount = newtransaction.events[0].args.amountafter.toNumber();
        console.log('counterretrieved', counterretrieved);
        console.log('initialamount', initialamount);
        console.log('newtokenamount', newtokenamount);
        const recipient = newtransaction.to; // Get the recipient from the transaction
        const transactionObject = {
          tokenAname,
          symbolA,
          tokenBname,
          symbolB,
          amount,
          newamount: newtokenamount,
          swaphash: newtransaction.transactionHash,
          from: accounts[0],
          to: recipient, // Set the recipient in the transaction object
        };
        setTransactionInfo(transactionObject);
        setformData({
          tokenAname,
          symbolA,
          tokenBname,
          symbolB,
          amount,
          newamount: newtokenamount,
        });
        await sendTransaction({
          signer,
          provider: provider as any,
          transactionObject,
          newcontract: swapContract,
        });
        setTokenAmount(amount);
        setNewTokenAmount(newtokenamount);
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  };
const swapTKX = async ({ tokenAname, symbolA, tokenBname, symbolB, amount }: SwapProp) => {
try {
if (ethereum) {
const { swapContract, signer, provider } = await createEthereumContract();
const amountoftokens = ethers.utils.parseEther(amount.toString());
console.log("This is the amount of tokens", amountoftokens);
const newswapTKAtransaction = await swapContract.swapTKA(amountoftokens);
const transactionreceipt = await newswapTKAtransaction.wait();
console.log("Swap Transaction For TKA", newswapTKAtransaction);
console.log('new TKA Transaction hash', newswapTKAtransaction.hash);
setSwapTransactions(newswapTKAtransaction);
const filter = swapContract.filters.eventswapTKA(0); // Updated to correct filter usage
const results = await swapContract.queryFilter(filter);
console.log(results);
const counterretrieved = transactionreceipt.events[0].args.swapTKXcounter.toNumber();
const initialamount = transactionreceipt.events[0].args.initialamount.toNumber();
const newtokenamount = transactionreceipt.events[0].args.amountafter.toNumber();
console.log('counterretrieved', counterretrieved);
console.log('initialamount', initialamount);
console.log('newtokenamount', newtokenamount);
const transactionObject = {
tokenAname,
symbolA,
tokenBname,
symbolB,
amount,
newamount: newtokenamount,
swaphash: newswapTKAtransaction.hash,
from: accounts[0],
to: newswapTKAtransaction.to
};
setformData({
tokenAname,
symbolA,
tokenBname,
symbolB,
amount,
newamount: newtokenamount
});
setTokenAmount(amount);
setNewTokenAmount(newtokenamount);
setTransactionInfo(transactionObject);
await sendTransaction({
signer,
provider: provider as any,
transactionObject,
newcontract: swapContract
});
} else {
console.log("Ethereum is not present");
}
} catch (error) {
console.log(error);
}
};

const checkIfWalletIsConnect = async () => {
try {
if (!ethereum) return alert("Please install MetaMask.");
accounts = await ethereum.request({ method: "eth_accounts" });
if (accounts.length) {
setCurrentAccount(accounts[0]);
} else {
console.log("No accounts found");
}
} catch (error) {
console.log(error);
}
};

const checkIfTransactionsExists = async () => {
try {
if (ethereum) {
const { swapContract } = await createEthereumContract();
const swapContractCount = await swapContract.getTransactionCount();
window.localStorage.setItem("transactionCount", swapContractCount);
}
} catch (error) {
console.log(error);
throw new Error("No ethereum object");
}
};

const connectWallet = async () => {
try {
if (!ethereum) return alert("Please install MetaMask.");
let accounts = await ethereum.request({ method: "eth_requestAccounts" });
setAccounts(accounts);
setCurrentAccount(accounts[0]);
window.location.reload();
return accounts;
} catch (error) {
console.log(error);
throw new Error("No ethereum object");
}
};

const sendTransaction = async ({ signer, provider, transactionObject, newcontract }: sendTransactionProp) => {
try {
if (ethereum) {
const accounts = await connectWallet();
await signer.connect(provider).sendTransaction(transactionObject);
const transactionsCount = await newcontract.getTransactionCount();
setTransactionCount(transactionsCount.toNumber());
window.location.reload();
} else {
console.log("No ethereum object");
}
} catch (error) {
console.log(error);
throw new Error("No ethereum object");
}
};

// Implement setRatio function
const setRatio = async (ratio: number) => {
try {
if (ethereum) {
const { swapContract } = await createEthereumContract();
const transaction = await swapContract.setRatio(ratio);
await transaction.wait();
return transaction;
} else {
console.log("Ethereum is not present");
}
} catch (error) {
console.log(error);
throw new Error("Failed to set ratio");
}
};

// Implement getRatio function
const getRatio = async () => {
try {
if (ethereum) {
const { swapContract } = await createEthereumContract();
const ratio = await swapContract.getRatio();
return ratio.toNumber();
} else {
console.log("Ethereum is not present");
}
} catch (error) {
console.log(error);
throw new Error("Failed to get ratio");
}
};

// Implement setFees function
const setFees = async (fees: number) => {
try {
if (ethereum) {
const { swapContract } = await createEthereumContract();
const transaction = await swapContract.setFees(fees);
await transaction.wait();
return transaction;
} else {
console.log("Ethereum is not present");
}
} catch (error) {
console.log(error);
throw new Error("Failed to set fees");
}
};

// Implement getFees function
const getFees = async () => {
try {
if (ethereum) {
const { swapContract } = await createEthereumContract();
const fees = await swapContract.getFees();
return fees.toNumber();
} else {
console.log("Ethereum is not present");
}
} catch (error) {
console.log(error);
throw new Error("Failed to get fees");
}
};

// Implement buyTokensABC function
const buyTokensABC = async (amount: number) => {
try {
if (ethereum) {
const { swapContract, signer } = await createEthereumContract();
const amountInWei = ethers.utils.parseEther(amount.toString());
const transaction = await swapContract.buyTokensABC(amountInWei, { value: amountInWei });
const receipt = await transaction.wait();
return receipt;
} else {
console.log("Ethereum is not present");
}
} catch (error) {
console.log(error);
throw new Error("Failed to buy ABC tokens");
}
};

// Implement buyTokensXYZ function
const buyTokensXYZ = async (amount: number) => {
try {
if (ethereum) {
const { swapContract, signer } = await createEthereumContract();
const amountInWei = ethers.utils.parseEther(amount.toString());
const transaction = await swapContract.buyTokensXYZ(amountInWei, { value: amountInWei });
const receipt = await transaction.wait();
return receipt;
} else {
console.log("Ethereum is not present");
}
} catch (error) {
console.log(error);
throw new Error("Failed to buy XYZ tokens");
}
};

// Implement addLiquidity function
const addLiquidity = async (amountABC: number, amountXYZ: number) => {
try {
if (ethereum) {
const { swapContract } = await createEthereumContract();
const amountABCInWei = ethers.utils.parseEther(amountABC.toString());
const amountXYZInWei = ethers.utils.parseEther(amountXYZ.toString());
const transaction = await swapContract.addLiquidity(amountABCInWei, amountXYZInWei);
const receipt = await transaction.wait();
return receipt;
} else {
console.log("Ethereum is not present");
}
} catch (error) {
console.log(error);
throw new Error("Failed to add liquidity");
}
};

// Implement removeLiquidity function
const removeLiquidity = async (liquidity: number) => {
try {
if (ethereum) {
const { swapContract } = await createEthereumContract();
const liquidityInWei = ethers.utils.parseEther(liquidity.toString());
const transaction = await swapContract.removeLiquidity(liquidityInWei);
const receipt = await transaction.wait();
return receipt;
} else {
console.log("Ethereum is not present");
}
} catch (error) {
console.log(error);
throw new Error("Failed to remove liquidity");
}
};

// Implement getAmountToSwap function
const getAmountToSwap = async (amountIn: number) => {
try {
if (ethereum) {
const { swapContract } = await createEthereumContract();
const amountInWei = ethers.utils.parseEther(amountIn.toString());
const amountOut = await swapContract.getAmountToSwap(amountInWei);
return ethers.utils.formatEther(amountOut);
} else {
console.log("Ethereum is not present");
}
} catch (error) {
console.log(error);
throw new Error("Failed to get swap amount");
}
};

// Implement swapTokens function
const swapTokens = async (amountIn: number) => {
try {
if (ethereum) {
const { swapContract } = await createEthereumContract();
const amountInWei = ethers.utils.parseEther(amountIn.toString());
const transaction = await swapContract.swapTokens(amountInWei);
const receipt = await transaction.wait();
return receipt;
} else {
console.log("Ethereum is not present");
}
} catch (error) {
console.log(error);
throw new Error("Failed to swap tokens");
}
};

// Implement getReserves function
const getReserves = async () => {
try {
if (ethereum) {
const { swapContract } = await createEthereumContract();
const reserves = await swapContract.getReserves();
return { reserveA: reserves[0].toNumber(), reserveB: reserves[1].toNumber(), timestamp: reserves[2].toNumber() };
} else {
console.log("Ethereum is not present");
}
} catch (error) {
console.log(error);
throw new Error("Failed to get reserves");
}
};

// Implement getPairAddress function
const getPairAddress = async () => {
try {
if (ethereum) {
const { swapContract } = await createEthereumContract();
const pairAddress = await swapContract.getPairAddress();
return pairAddress;
} else {
console.log("Ethereum is not present");
}
} catch (error) {
console.log(error);
throw new Error("Failed to get pair address");
}
};

return {
swapTKA,
swapTKX,
transactionCount,
connectWallet,
transactions,
currentAccount,
sendTransaction,
formData,
accountsretrieved,
origamount,
newtokenamount,
setRatio,
getRatio,
setFees,
getFees,
buyTokensABC,
buyTokensXYZ,
addLiquidity,
removeLiquidity,
getAmountToSwap,
swapTokens,
getReserves,
getPairAddress,
checkIfWalletIsConnect,
checkIfTransactionsExists
};
};

export default useSwapContext;