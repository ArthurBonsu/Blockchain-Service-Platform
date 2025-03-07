import React, { createContext, useContext, useEffect, useState } from "react";
import { Contract, ethers, Signer, BigNumberish} from "ethers";
import { Provider } from "@ethersproject/providers";
import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';
import { SwapNewTokenTransaction } from 'types/ethers';

// Create a type that will be shared across components
export interface SwapContextType {
  // Connection States
  currentAccount: string;
  isLoading: boolean;
  connectWallet: () => Promise<string[]>;
  
  // Token Data
  formData: {
    tokenAname: string;
    symbolA: string;
    tokenBname: string;
    symbolB: string;
    amount: number;
    newamount: number | string;
  };
  
  // Core Swap Functions
  swapTKA: (params: SwapProp) => Promise<void>;
  swapTKX: (params: SwapProp) => Promise<void>;
  
  // Additional Functions
  setRatio: (ratio: number) => Promise<any>;
  getRatio: () => Promise<number>;
  setFees: (fees: number) => Promise<any>;
  getFees: () => Promise<number>;
  
  // Token Functions
  buyTokensABC: (amount: number) => Promise<any>;
  buyTokensXYZ: (amount: number) => Promise<any>;
  
  // Liquidity Functions
  addLiquidity: (amountABC: number, amountXYZ: number) => Promise<any>;
  removeLiquidity: (liquidity: number) => Promise<any>;
  
  // Helper Functions
  getAmountToSwap: (amountIn: number) => Promise<string>;
  swapTokens: (amountIn: number) => Promise<any>;
  getReserves: () => Promise<{ reserveA: number, reserveB: number, timestamp: number }>;
  getPairAddress: () => Promise<string>;
  
  // Wallet/Connection Info
  accountsretrieved: string[];
  origamount: number;
  newtokenamount: number;
  transactionCount: number;
  transactions: {
    tokenAname: string;
    symbolA: string;
    tokenBname: string;
    symbolB: string;
    amount: number;
    newamount: number | string;
    swaphash: string;
    from: string;
    to: string;
  };
  checkIfWalletIsConnect: () => Promise<void>;
  checkIfTransactionsExists: () => Promise<void>;
}

interface SwapProp {
  transactionObject?: SwapNewTokenTransaction;
  tokenAname: string;
  symbolA: string;
  tokenBname: string;
  symbolB: string;
  amount: number;
  newamount?: string;
  newcontract?: Contract;
}

interface sendTransactionProp {
  signer: Signer;
  provider: Web3Provider;
  transactionObject: SwapNewTokenTransaction;
  newcontract: Contract;
}

// Create the actual context
const SwapContext = createContext<SwapContextType | null>(null);

// Create a provider component
export const SwapContextProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Implementation from useSwapContext
  let contractABI = ""; // Will be populated from constants or config
  let contractAddress = " "; // Will be populated from constants or config
  const { ethereum } = window as any;
  
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
  const [accountsretrieved, setAccounts] = useState<string[]>([]);
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
  
  // Extracted from original useSwapContext - create contract instance
  const createEthereumContract = async () => {
    if (!ethereum) throw new Error("Please install MetaMask.");
    
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const swapContract = new ethers.Contract(contractAddress, contractABI, signer);
    return { swapContract, signer, provider };
  };
  
  // Check if wallet is connected on component mount
  useEffect(() => {
    checkIfWalletIsConnect();
    checkIfTransactionsExists();
  }, []);

  // All functions from useSwapContext implementation
  const swapTKA = async ({ tokenAname, symbolA, tokenBname, symbolB, amount }: SwapProp) => {
    setIsLoading(true);
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
          transactionObject: transactionObject as any,
          newcontract: swapContract,
        });
        setTokenAmount(amount);
        setNewTokenAmount(newtokenamount);
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.error("Error in swapTKA:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Other functions from useSwapContext...
  // (Implementation of all other functions from the original context)
  
  const swapTKX = async ({ tokenAname, symbolA, tokenBname, symbolB, amount }: SwapProp) => {
    setIsLoading(true);
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
        // Rest of implementation...
        // (Implementing remainder of swapTKX function)
      }
    } catch (error) {
      console.error("Error in swapTKX:", error);
    } finally {
      setIsLoading(false);
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
      console.error("Error checking wallet connection:", error);
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
      console.error("Error checking transactions:", error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      let accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setAccounts(accounts);
      setCurrentAccount(accounts[0]);
      return accounts;
    } catch (error) {
      console.error("Error connecting wallet:", error);
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
      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw new Error("No ethereum object");
    }
  };

  // Additional functions would be implemented here
  // setRatio, getRatio, setFees, getFees, etc.

  // Create the context value object with all required functions and state
  const contextValue: SwapContextType = {
    currentAccount,
    isLoading,
    connectWallet,
    formData,
    swapTKA,
    swapTKX,
    // Include all other functions and state here
    accountsretrieved,
    origamount,
    newtokenamount,
    transactions,
    transactionCount,
    checkIfWalletIsConnect,
    checkIfTransactionsExists,
    // All other functions would be included here as well
    setRatio: async () => { /* Implementation */ return null; },
    getRatio: async () => { /* Implementation */ return 0; },
    setFees: async () => { /* Implementation */ return null; },
    getFees: async () => { /* Implementation */ return 0; },
    buyTokensABC: async () => { /* Implementation */ return null; },
    buyTokensXYZ: async () => { /* Implementation */ return null; },
    addLiquidity: async () => { /* Implementation */ return null; },
    removeLiquidity: async () => { /* Implementation */ return null; },
    getAmountToSwap: async () => { /* Implementation */ return "0"; },
    swapTokens: async () => { /* Implementation */ return null; },
    getReserves: async () => { /* Implementation */ return { reserveA: 0, reserveB: 0, timestamp: 0 }; },
    getPairAddress: async () => { /* Implementation */ return ""; },
  };

  return (
    <SwapContext.Provider value={contextValue}>
      {children}
    </SwapContext.Provider>
  );
};

// Create a custom hook to use the swap context
export const useSwapContext = () => {
  const context = useContext(SwapContext);
  if (context === null) {
    throw new Error("useSwapContext must be used within a SwapContextProvider");
  }
  return context;
};

export default useSwapContext;