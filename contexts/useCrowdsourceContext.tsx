import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { BlockchainTransaction } from 'types/ethers';

// Import your contract ABI and address
const contractABI = "";
const contractAddress = "";
const { ethereum } = window;

// Create the context
const CrowdSourceContext = createContext<any>(null);

export const CrowdSourceProvider = ({ children }: { children: React.ReactNode }) => {
  // Keep all existing state from useCrowdsourceContext
  const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
  const [transactions, setTransactions] = useState([]);

  // Create the Ethereum contract
  const createEthereumContract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
    return transactionsContract;
  };

  // Get all transactions
  const getAllTransactions = async () => {
    try {
      if (ethereum) {
        const transactionsContract = await createEthereumContract();
        const availableTransactions = await transactionsContract.getAllTransactions();
        const structuredTransactions = availableTransactions.map((transaction: BlockchainTransaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(Number(transaction.timestamp.valueOf()) * 1000).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount.valueOf().toString()) / (10 ** 18)
        }));
        console.log(structuredTransactions);
        setTransactions(structuredTransactions);
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Check if wallet is connected
  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        getAllTransactions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Check if transactions exist
  const checkIfTransactionsExists = async () => {
    try {
      if (ethereum) {
        const transactionsContract = await createEthereumContract();
        const currentTransactionCount = await transactionsContract.getTransactionCount();
        window.localStorage.setItem("transactionCount", currentTransactionCount);
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  // Send transaction
  const sendTransaction = async () => {
    try {
      if (ethereum) {
        const { addressTo, amount, keyword, message } = formData;
        const transactionsContract = await createEthereumContract();
        const parsedAmount = ethers.utils.parseEther(amount);

        await ethereum.request({
          method: "eth_sendTransaction",
          params: [{
            from: currentAccount,
            to: addressTo,
            gas: "0x5208",
            value: ethers.utils.formatEther(parsedAmount),
          }],
        });

        const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

        setIsLoading(true);
        console.log(`Loading - ${transactionHash.hash}`);
        await transactionHash.wait();
        console.log(`Success - ${transactionHash.hash}`);
        setIsLoading(false);

        const transactionsCount = await transactionsContract.getTransactionCount();

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

  // Create campaign function
  const createCampaign = async (name: string, recipient: string, goal: string) => {
    try {
      if (ethereum) {
        const transactionsContract = await createEthereumContract();
        const parsedGoal = ethers.utils.parseEther(goal);
        
        setIsLoading(true);
        const tx = await transactionsContract.createCampaign(name, recipient, parsedGoal);
        await tx.wait();
        setIsLoading(false);
        
        return tx.hash;
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      setIsLoading(false);
      throw error;
    }
  };

  // Contribute to campaign function
  const contributeToCampaign = async (campaignId: string, amount: string) => {
    try {
      if (ethereum) {
        const transactionsContract = await createEthereumContract();
        const parsedAmount = ethers.utils.parseEther(amount);
        
        setIsLoading(true);
        const tx = await transactionsContract.contribute(campaignId, parsedAmount);
        await tx.wait();
        setIsLoading(false);
        
        return tx.hash;
      }
    } catch (error) {
      console.error("Error contributing to campaign:", error);
      setIsLoading(false);
      throw error;
    }
  };

  // Handle form data changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  // Initialize when component mounts
  useEffect(() => {
    checkIfWalletIsConnect();
    checkIfTransactionsExists();
  }, [transactionCount]);

  // Provide the context values
  const contextValue = {
    transactionCount,
    connectWallet,
    transactions,
    currentAccount,
    isLoading,
    sendTransaction,
    handleChange,
    formData,
    createCampaign,
    contributeToCampaign
  };

  return (
    <CrowdSourceContext.Provider value={contextValue}>
      {children}
    </CrowdSourceContext.Provider>
  );
};

// Create and export the hook for using the context
export const useCrowdSourceContext = () => {
  const context = useContext(CrowdSourceContext);
  if (!context) {
    throw new Error("useCrowdSourceContext must be used within a CrowdSourceProvider");
  }
  return context;
};

export default useCrowdSourceContext;