import React, { useEffect, useState } from "react";
import { ethers, BigNumberish } from 'ethers';
import { BlockchainTransaction } from "types/ethers";
import { useSafeStore } from 'stores/safeStore';
import useLoadSafe from 'hooks/useLoadSafe';
import { useEthersStore } from "stores/ethersStore";
import useTransactonContext from "./useTransactionContext";


let contractABI = "";
let safecontractAddress: string = "";

const { ethereum } = window;
const chainId = useEthersStore((state) => state.chainId);
const address = useEthersStore((state) => state.setAddress);

const safeAddress = useSafeStore((state) => state.safeAddress);
const ownersAddress = useSafeStore((state) => state.ownersAddress);
const safeContractAddress = useSafeStore((state) => state.safeContractAddress)
const isPendingSafeCreation = useSafeStore((state) => state.isPendingSafeCreation);
const pendingSafeData = useSafeStore((state) => state.pendingSafeData);
const isPendingAddOwner = useSafeStore((state) => state.isPendingAddOwner);
const pendingAddOwnerData = useSafeStore((state) => state.pendingAddOwnerData);

const setSafeAddress = useSafeStore((state) => state.setSafeAddress);
const setOwnersAddress = useSafeStore((state) => state.setOwnersAddress);
const setSafeContractAddress = useSafeStore((state) => state.setSafeContractAddress);
const setIsPendingSafeCreation = useSafeStore((state) => state.setIsPendingSafeCreation);
const setPendingSafeData = useSafeStore((state) => state.setPendingSafeData);
const setIsPendingAddOwner = useSafeStore((state) => state.setIsPendingAddOwner);
const setPendingAddOwnerData = useSafeStore((state) => state.setPendingAddOwnerData);
const setSafeStore = useSafeStore((state) => state.setSafeStore);

const [allSafeTransactions, setAllSafeTransactions] = useState([]);
const [safeTransaction, setSafeTransaction] = useState(null);
const [error, setError] = useState(null);
const createEthereumContract = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = await provider.getSigner();
  const safeContract = new ethers.Contract(safecontractAddress, contractABI, signer);
  return safeContract;
};


// safecontext
const useSafeContext = () => {
  const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "", });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      const accounts = await ethereum.request({ method: "eth_accounts" });
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
        const transactionsContract = await createEthereumContract();
        const currentTransactionCount = await transactionsContract.getTransactionCount();
        window.localStorage.setItem("transactionCount", currentTransactionCount);
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

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

   
  const getAllSafeTransactions = async () => {
    try {
      // Use the safeAddress and safeContractAddress to fetch all safe transactions
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(safeContractAddress, ABI, provider);
  
      const transactionCount = await contract.getTransactionCount();
      const transactions = [];
  
      for (let i = 0; i < transactionCount; i++) {
        const transactionDetails = await contract.getTransactionDetails(i);
        transactions.push({
          destination: transactionDetails.destination,
          value: transactionDetails.value,
          data: transactionDetails.data,
          approvals: transactionDetails.approvals,
          executed: transactionDetails.executed,
        });
      }
  
      setAllSafeTransactions(transactions);
    } catch (error) {
      setError(error.message);
    }
  };


  const sendSafeTransaction = async (transactionData) => {
    try {
      // Use the safeAddress and safeContractAddress to send a particular safe transaction
      const response = await fetch('/api/send-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      const data = await response.json();
      setSafeTransaction(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const getSafeDetails = () => {
    // Return the safe details, including the safeAddress, ownersAddress, and safeContractAddress
    return {
      safeAddress,
      ownersAddress,
      safeContractAddress,
    };
  };

  const getPendingSafeData = () => {
    // Return the pending safe data
    return pendingSafeData;
  };

  const getPendingAddOwnerData = () => {
    // Return the pending add owner data
    return pendingAddOwnerData;
  };

  const addOwner = async (newOwner) => {
    try {
      // Add a new owner to the safe
      const response = await fetch('/api/add-owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newOwner }),
      });
      const data = await response.json();
      setOwnersAddress([...ownersAddress, newOwner]);
    } catch (error) {
      setError(error.message);
    }
  };

  const removeOwner = async (ownerToRemove) => {
    try {
      // Remove an owner from the safe
      const response = await fetch('/api/remove-owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ownerToRemove }),
      });
      const data = await response.json();
      setOwnersAddress(ownersAddress.filter((owner) => owner !== ownerToRemove));
    } catch (error) {
      setError(error.message);
    }
  };

  const updateThreshold = async (newThreshold) => {
    try {
      // Update the threshold for the safe
      const response = await fetch('/api/update-threshold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newThreshold }),
      });
      const data = await response.json();
      // Update the threshold in the store
    } catch (error) {
      setError(error.message);
    }
  };

  // update threshold, add owner, remove owner, 
  useEffect(() => {
    checkIfWalletIsConnect();
    checkIfTransactionsExists();
  }, [transactionCount]);

  return {
    transactionCount,
    connectWallet,
    transactions,
    currentAccount,
    isLoading,
  
    handleChange,
    formData,
    safeAddress, 
    ownersAddress,
    safeContractAddress,
    isPendingSafeCreation,
    pendingSafeData,
    isPendingAddOwner,
    pendingAddOwnerData,
    setSafeAddress,
    setOwnersAddress,
    setSafeContractAddress,
    setIsPendingSafeCreation,
    setPendingSafeData,
    setIsPendingAddOwner,
    setPendingAddOwnerData,
    setSafeStore

  };
};

export default useSafeContext;
