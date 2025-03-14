import React, { createContext, useContext, useEffect, useState, useCallback, PropsWithChildren } from "react";
import { ethers, BigNumberish } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { BlockchainTransaction } from "types/ethers";
import { PaymentTransactions } from "types";
import { useSafeStore } from 'stores/safeStore';
import { useEthersStore } from "stores/ethersStore";
import { useWalletStore } from 'stores/ContextStores/walletStore';

// Define interfaces
export interface SafeInfoParam {
  ownersAddress: string[];
  safeContractAddress: string;
  threshold: number;
  ownerInfo: any[];
  safeAddress: string;
  provider?: Web3Provider;
  signer?: string;
}

export interface executeTransParam {
  safeAddress: string;
  provider?: Web3Provider;
  signer?: string;
  transaction: PaymentTransactions;
  hashtxn?: string;
  ownersAddress: string[];
  safeContractAddress: string;
  threshold: number;
  ownerInfo: any[];
}

// Interface for the context
interface SafeContextType {
  // Safe state
  safeAddress: string;
  ownersAddress: string[];
  safeContractAddress: string;
  isPendingSafeCreation: boolean;
  pendingSafeData: any;
  isPendingAddOwner: boolean;
  pendingAddOwnerData: any;
  isLoading: boolean;
  safe: any;
  isCurrentUserAlreadySigned: boolean;
  hasReachedThreshold: boolean;
  transactions: BlockchainTransaction[];
  allSafeTransactions: any[];
  transactionStatus: Record<string, string>;
  transactionCount: string | null;
  currentAccount: string;
  formData: {
    addressTo: string;
    amount: string;
    keyword: string;
    message: string;
  };
  error: string | null;

  // Store setters
  setSafeAddress: (safeAddress: string) => void;
  setOwnersAddress: (ownersAddress: string[]) => void;
  setSafeContractAddress: (safeContractAddress: string) => void;
  setIsPendingSafeCreation: (isPendingSafeCreation: boolean) => void;
  setPendingSafeData: (pendingSafeData: any) => void;
  setIsPendingAddOwner: (isPendingAddOwner: boolean) => void;
  setPendingAddOwnerData: (pendingAddOwnerData: any) => void;
  setSafeStore: (safeStore: any) => void;

  // Wallet and connection
  connectWallet: () => Promise<void>;
  checkIfWalletIsConnect: () => Promise<void>;
  checkIfTransactionsExists: () => Promise<void>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>, name: string) => void;

  // Safe setup and management
  setUpMultiSigSafeAddress: (address: string) => Promise<string>;
  addAddressToSafe: (safeAddress: string, newAddress: string) => Promise<string[]>;
  addOwner: (newOwner: string) => Promise<any>;
  removeOwner: (ownerToRemove: string) => Promise<any>;
  updateThreshold: (newThreshold: number) => Promise<any>;
  userAddToSafe: (userAddress?: string) => Promise<any>;
  
  // Safe info and details
  getSafeInfo: (safeInfoParam: SafeInfoParam) => Promise<any>;
  getSafeDetails: () => { safeAddress: string; ownersAddress: string[]; safeContractAddress: string; };
  getPendingSafeData: () => any;
  getPendingAddOwnerData: () => any;
  getSafeInfoUsed: () => Promise<any>;
  getOwners: (params: { safeAddress: string }) => Promise<any>;
  getOwnerDetails: (params: { safeAddress: string; owner: string }) => Promise<any>;
  getTransactionCount: (params: { safeAddress: string }) => Promise<any>;
  getUserTransactions: (params: { safeAddress: string; user: string }) => Promise<any>;
  getSafeOwners: (params: { safeAddress: string }) => Promise<any>;
  isOwnerAddress: (params: { safeAddress: string; owner: string }) => Promise<boolean>;
  getTotalWeight: (params: { safeAddress: string }) => Promise<any>;
  getThreshold: (params: { safeAddress: string }) => Promise<any>;
  
  // Transaction related
  getAllSafeTransactions: () => Promise<void>;
  getAllTransactions: (safeInfoParam: SafeInfoParam) => Promise<any>;
  getTransactionDetails: (params: { safeAddress: string; transactionId: number }) => Promise<any>;
  sendSafeTransaction: (transactionData: any) => Promise<void>;
  checkIsSigned: (transactionHash: string) => Promise<void>;
  checkIfTxnExecutable: (transaction: PaymentTransactions) => Promise<boolean>;
  proposeTransaction: (safeAddress: string, transaction: PaymentTransactions, executeTransParam: executeTransParam) => Promise<any>;
  approveTransfer: (transaction: PaymentTransactions) => Promise<any>;
  rejectTransfer: (transaction: PaymentTransactions) => Promise<any>;
  executeTransaction: (executeTransParam: executeTransParam) => Promise<any>;
  executeSafeTransaction: (transaction: PaymentTransactions) => Promise<any>;
  updateTransactionStatus: (transaction: PaymentTransactions, status: string) => Promise<void>;
  updateTransactionStatusHere: (params: { safeAddress: string; transactionHash: string; status: string }) => Promise<any>;
  
  // Utility functions
  setPendingAddOwnerData: (params: { safeAddress: string; owner: string; timestamp: number }) => Promise<any>;
  setIsPendingAddOwnerOfSafe: (owner: string, status: boolean) => Promise<any>;
}

// Create the context
const SafeContext = createContext<SafeContextType | null>(null);

// Contract configuration 
const contractABI: ethers.ContractInterface = [
  // Add proper ABI entries here
];

const contractBytecode: string = '0x...'; // Replace with actual bytecode

// Provider Component
export const SafeProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  // Get store values using useSafeStore hook
  const safeAddress = useSafeStore((state) => state.safeAddress);
  const ownersAddress = useSafeStore((state) => state.ownersAddress);
  const safeContractAddress = useSafeStore((state) => state.safeContractAddress);
  const isPendingSafeCreation = useSafeStore((state) => state.isPendingSafeCreation);
  const pendingSafeData = useSafeStore((state) => state.pendingSafeData);
  const isPendingAddOwner = useSafeStore((state) => state.isPendingAddOwner);
  const pendingAddOwnerData = useSafeStore((state) => state.pendingAddOwnerData);
  
  // Get store setters using useSafeStore hook
  const setSafeAddress = useSafeStore((state) => state.setSafeAddress);
  const setOwnersAddress = useSafeStore((state) => state.setOwnersAddress);
  const setSafeContractAddress = useSafeStore((state) => state.setSafeContractAddress);
  const setIsPendingSafeCreation = useSafeStore((state) => state.setIsPendingSafeCreation);
  const setPendingSafeData = useSafeStore((state) => state.setPendingSafeData);
  const setIsPendingAddOwner = useSafeStore((state) => state.setIsPendingAddOwner);
  const setPendingAddOwnerData = useSafeStore((state) => state.setPendingAddOwnerData);
  const setSafeStore = useSafeStore((state) => state.setSafeStore);
  
  // Get ethers store values
  const chainId = useEthersStore((state) => state.chainId);
  const setAddress = useEthersStore((state) => state.setAddress);
  
  // Get wallet store values
  const signer = useWalletStore((state) => state.signer);
  const accounts = useWalletStore((state) => state.accounts);
  const provider = useWalletStore((state) => state.provider);
  const hasMetamask = useWalletStore((state) => state.hasMetamask);
  const isLoggedIn = useWalletStore((state) => state.isLoggedIn);
  const walletAddress = useWalletStore((state) => state.address);
  
  // Component state
  const [allSafeTransactions, setAllSafeTransactions] = useState<any[]>([]);
  const [safeTransaction, setSafeTransaction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    addressTo: "", 
    amount: "", 
    keyword: "", 
    message: "" 
  });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    typeof window !== "undefined" ? localStorage.getItem("transactionCount") : null
  );
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [safe, setSafe] = useState<any | null>(null);
  const [isCurrentUserAlreadySigned, setIsUserAlreadySigned] = useState<boolean>(false);
  const [hasReachedThreshold, setHasReachedThreshold] = useState<boolean>(false);
  const [userAddresses, setUserAddresses] = useState<any>({});
  const [usedSafeAddress, setUsedSafeAddress] = useState<string | undefined>(undefined);
  const [transaction, setTransaction] = useState<PaymentTransactions>({
    data: null,
    username: '',
    address: '',
    amount: 0,
    comment: '',
    timestamp: new Date(),
    receipient: '',
    receipients: [],
    txhash: '',
    USDprice: 0,
    paymenthash: '',
    owneraddress: '',
  });
  const [transactionStatus, setTransactionStatus] = useState<Record<string, string>>({});

  // Get ethereum object safely
  const getEthereum = () => {
    if (typeof window !== "undefined") {
      return (window as any).ethereum;
    }
    return undefined;
  };

  const ethereum = getEthereum();

  // Get provider
  const getProvider = useCallback((): Web3Provider => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      return new ethers.providers.Web3Provider((window as any).ethereum);
    }
    throw new Error("Ethereum provider not available");
  }, []);

  // Create Ethereum contract
  const createEthereumContract = useCallback(async (contractAddress: string) => {
    if (!ethereum) throw new Error("Ethereum object not found");
    
    const provider = getProvider();
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    return contract;
  }, [ethereum, getProvider]);

  // Form change handler
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  }, []);

  // Check if wallet is connected
  const checkIfWalletIsConnect = useCallback(async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  }, [ethereum]);

  // Check if transactions exist
  const checkIfTransactionsExists = useCallback(async () => {
    try {
      if (ethereum && safeContractAddress) {
        const transactionsContract = await createEthereumContract(safeContractAddress);
        const currentTransactionCount = await transactionsContract.getTransactionCount();
        
        if (typeof window !== "undefined") {
          window.localStorage.setItem("transactionCount", currentTransactionCount);
        }
      }
    } catch (error) {
      console.error("Error checking transactions:", error);
      throw new Error("No ethereum object");
    }
  }, [ethereum, safeContractAddress, createEthereumContract]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw new Error("No ethereum object");
    }
  }, [ethereum]);

  // Get all safe transactions
  const getAllSafeTransactions = useCallback(async () => {
    try {
      if (!ethereum || !safeContractAddress) return;
      
      const provider = getProvider();
      const contract = new ethers.Contract(safeContractAddress, contractABI, provider);
  
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
    } catch (error: any) {
      setError(error.message);
    }
  }, [ethereum, safeContractAddress, getProvider]);

  // Send safe transaction
  const sendSafeTransaction = useCallback(async (transactionData: any) => {
    try {
      const response = await fetch('/api/send-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      const data = await response.json();
      setSafeTransaction(data);
      return data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Get safe details
  const getSafeDetails = useCallback(() => {
    return {
      safeAddress,
      ownersAddress,
      safeContractAddress,
    };
  }, [safeAddress, ownersAddress, safeContractAddress]);

  // Get pending safe data
  const getPendingSafeData = useCallback(() => {
    return pendingSafeData;
  }, [pendingSafeData]);

  // Get pending add owner data
  const getPendingAddOwnerData = useCallback(() => {
    return pendingAddOwnerData;
  }, [pendingAddOwnerData]);

  // Setup multi-sig safe address
  const setUpMultiSigSafeAddress = useCallback(async (address: string) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const signer = provider.getSigner();
      const safeFactory = new ethers.ContractFactory(contractABI, contractBytecode, signer);
      const safeContract = await safeFactory.deploy(address);
      await safeContract.deployed();
      const deployedAddress = safeContract.address;
      setSafeAddress(deployedAddress);
      setIsLoading(false);
      return deployedAddress;
    } catch (error) {
      setIsLoading(false);
      console.error("Error setting up multi-sig safe:", error);
      throw error;
    }
  }, [getProvider, setSafeAddress]);

  // Add address to safe
  const addAddressToSafe = useCallback(async (safeAddress: string, newAddress: string) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const signer = provider.getSigner();
      const safeContract = new ethers.Contract(safeAddress, contractABI, signer);
      const tx = await safeContract.addOwner(newAddress);
      await tx.wait();
      
      // Update owners list in store
      const updatedOwners = [...ownersAddress, newAddress];
      setOwnersAddress(updatedOwners);
      
      setIsLoading(false);
      return updatedOwners;
    } catch (error) {
      setIsLoading(false);
      console.error("Error adding address to safe:", error);
      throw error;
    }
  }, [getProvider, ownersAddress, setOwnersAddress]);

  // Add owner
  const addOwner = useCallback(async (newOwner: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/add-owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newOwner, safeAddress }),
      });
      const data = await response.json();
      
      // Update owners list
      setOwnersAddress([...ownersAddress, newOwner]);
      
      setIsLoading(false);
      return data;
    } catch (error: any) {
      setIsLoading(false);
      setError(error.message);
      throw error;
    }
  }, [safeAddress, ownersAddress, setOwnersAddress]);

  // Remove owner
  const removeOwner = useCallback(async (ownerToRemove: string) => {
    try {
      setIsLoading(true);
      
      const provider = getProvider();
      const signer = provider.getSigner();
      const safeContract = new ethers.Contract(safeAddress, contractABI, signer);
      const tx = await safeContract.removeOwner(ownerToRemove);
      await tx.wait();
      
      // Update owners list in store
      const filteredOwners = ownersAddress.filter((owner) => owner !== ownerToRemove);
      setOwnersAddress(filteredOwners);
      
      setIsLoading(false);
      return tx;
    } catch (error) {
      setIsLoading(false);
      console.error("Error removing owner:", error);
      throw error;
    }
  }, [getProvider, safeAddress, ownersAddress, setOwnersAddress]);

  // Update threshold
  const updateThreshold = useCallback(async (newThreshold: number) => {
    try {
      setIsLoading(true);
      
      const provider = getProvider();
      const signer = provider.getSigner();
      const safeContract = new ethers.Contract(safeAddress, contractABI, signer);
      const tx = await safeContract.updateThreshold(newThreshold);
      await tx.wait();
      
      setIsLoading(false);
      return tx;
    } catch (error) {
      setIsLoading(false);
      console.error("Error updating threshold:", error);
      throw error;
    }
  }, [getProvider, safeAddress]);

  // Get safe info
  const getSafeInfo = useCallback(async (safeInfoParam: SafeInfoParam) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const safeContract = new ethers.Contract(safeInfoParam.safeAddress, contractABI, provider);
      const tx = await safeContract.getModules();
      setIsLoading(false);
      return tx;
    } catch (error) {
      setIsLoading(false);
      console.error("Error getting safe info:", error);
      throw error;
    }
  }, [getProvider]);

  // Get all transactions
  const getAllTransactions = useCallback(async (safeInfoParam: SafeInfoParam) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const safeContract = new ethers.Contract(safeInfoParam.safeAddress, contractABI, provider);
      const transactions = await safeContract.getMultiSigTransactions();
      setIsLoading(false);
      return transactions;
    } catch (error) {
      setIsLoading(false);
      console.error("Error getting all transactions:", error);
      throw error;
    }
  }, [getProvider]);

  // Check if transaction is executable
  const checkIfTxnExecutable = useCallback(async (transaction: PaymentTransactions) => {
    try {
      setIsLoading(true);
      setTransaction(transaction);
      
      const provider = getProvider();
      const safeContract = new ethers.Contract(safeAddress, contractABI, provider);
      const executable = await safeContract.isTransactionExecutable(transaction.txhash || "");
      
      setIsLoading(false);
      return executable;
    } catch (error) {
      setIsLoading(false);
      console.error("Error checking if transaction is executable:", error);
      return false;
    }
  }, [getProvider, safeAddress]);

  // Propose transaction
  const proposeTransaction = useCallback(async (safeAddress: string, transaction: PaymentTransactions, executeTransParam: executeTransParam) => {
    try {
      setIsLoading(true);
      
      const provider = getProvider();
      const signer = provider.getSigner();
      const safeContract = new ethers.Contract(safeAddress, contractABI, signer);
      
      // Prepare transaction data
      const transactionData = {
        to: transaction.receipient,
        value: ethers.utils.parseEther(transaction.amount.toString()),
        data: transaction.data || "0x",
        description: transaction.comment || "",
      };
      
      const tx = await safeContract.proposeTransaction(transactionData);
      await tx.wait();
      
      setIsLoading(false);
      return tx;
    } catch (error) {
      setIsLoading(false);
      console.error("Error proposing transaction:", error);
      throw error;
    }
  }, [getProvider]);

  // Approve transfer
  const approveTransfer = useCallback(async (transaction: PaymentTransactions) => {
    try {
      setIsLoading(true);
      setTransaction(transaction);
      
      const provider = getProvider();
      const signer = provider.getSigner();
      const safeContract = new ethers.Contract(safeAddress, contractABI, signer);
      const tx = await safeContract.approveTransaction(transaction.txhash || "");
      await tx.wait();
      
      setIsLoading(false);
      return tx;
    } catch (error) {
      setIsLoading(false);
      console.error("Error approving transfer:", error);
      throw error;
    }
  }, [getProvider, safeAddress]);

  // Reject transfer
  const rejectTransfer = useCallback(async (transaction: PaymentTransactions) => {
    try {
      setIsLoading(true);
      setTransaction(transaction);
      
      const provider = getProvider();
      const signer = provider.getSigner();
      const safeContract = new ethers.Contract(safeAddress, contractABI, signer);
      const tx = await safeContract.rejectTransaction(transaction.txhash || "");
      await tx.wait();
      
      setIsLoading(false);
      return tx;
    } catch (error) {
      setIsLoading(false);
      console.error("Error rejecting transfer:", error);
      throw error;
    }
  }, [getProvider, safeAddress]);

  // Check if transaction is signed
  const checkIsSigned = useCallback(async (transactionHash: string) => {
    try {
      setIsLoading(true);
      
      if (!safeAddress || !transactionHash) {
        setIsLoading(false);
        return;
      }
      
      const safeInfoParam: SafeInfoParam = {
        ownersAddress: ['ownerAddress'],
        safeContractAddress: 'safeContractAddress',
        threshold: 1,
        ownerInfo: [],
        safeAddress: safeAddress,
      };
      
      const txs = await getAllTransactions(safeInfoParam);
      const retrievedTransaction = txs.results?.find((tx: any) => tx.data?.hash === transactionHash);
      const isSigned = retrievedTransaction?.isSigned || false;
      
      setIsUserAlreadySigned(isSigned);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error checking if transaction is signed:", error);
    }
  }, [safeAddress, getAllTransactions]);

  // Execute safe transaction
  const executeSafeTransaction = useCallback(async (transaction: PaymentTransactions) => {
    try {
      setIsLoading(true);
      setTransaction(transaction);
      
      const executable = await checkIfTxnExecutable(transaction);
      
      if (executable) {
        // Propose the transaction
        await proposeTransaction(safeAddress, transaction, {
          safeAddress,
          transaction,
          ownersAddress: [],
          safeContractAddress: '',
          threshold: 0,
          ownerInfo: []
        });
        
        // Approve the transaction
        await approveTransfer(transaction);
        
        // Execute the transaction
        if (provider) {
          const signerAddress = signer ? await signer.getAddress() : undefined;
          
          const executeTransParam: executeTransParam = {
            safeAddress,
            provider: provider as Web3Provider,
            signer: signerAddress,
            transaction,
            hashtxn: transaction.txhash,
            ownersAddress: [],
            safeContractAddress: '',
            threshold: 0,
            ownerInfo: []
          };
          
          const response = await executeTransaction(executeTransParam);
          setTransactionStatus(prevStatus => ({ ...prevStatus, [transaction.txhash]: 'complete' }));
          setIsLoading(false);
          return response;
        } else {
          console.error('Provider is null');
          setIsLoading(false);
          return null;
        }
      } else {
        // Reject the transaction if not executable
        const rejectedTxn = await rejectTransfer(transaction);
        setTransactionStatus(prevStatus => ({ ...prevStatus, [transaction.txhash]: 'rejected' }));
        setIsLoading(false);
        return rejectedTxn;
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error executing safe transaction:", error);
      throw error;
    }
  }, [safeAddress, provider, signer, checkIfTxnExecutable, proposeTransaction, approveTransfer, executeTransaction, rejectTransfer]);

  // Initialize safe context
  useEffect(() => {
    checkIfWalletIsConnect();
    checkIfTransactionsExists();
    
    if (safeAddress) {
      getAllSafeTransactions();
      getSafeInfoUsed();
      checkIsSigned('0x...transactionHash...');
    }
  }, [checkIfWalletIsConnect, checkIfTransactionsExists, safeAddress, getAllSafeTransactions, getSafeInfoUsed, checkIsSigned]);

  // Create context value
  const contextValue: SafeContextType = {
    // Safe state
    safeAddress,
    ownersAddress,
    safeContractAddress,
    isPendingSafeCreation,
    pendingSafeData,
    isPendingAddOwner,
    pendingAddOwnerData,
    isLoading,
    safe,
    isCurrentUserAlreadySigned,
    hasReachedThreshold,
    transactions,
    allSafeTransactions,
    transactionStatus,
    transactionCount,
    currentAccount,
    formData,
    error,

    // Store setters
    setSafeAddress,
    setOwnersAddress,
    setSafeContractAddress,
    setIsPendingSafeCreation,
    setPendingSafeData,
    setIsPendingAddOwner,
    setPendingAddOwnerData,
    setSafeStore,

    // Wallet and connection
    connectWallet,
    checkIfWalletIsConnect,
    checkIfTransactionsExists,
    handleChange,

    // Safe setup and management
    setUpMultiSigSafeAddress,
    addAddressToSafe,
    addOwner,
    removeOwner,
    updateThreshold,
    userAddToSafe,
    
    // Safe info and details
    getSafeInfo,
    getSafeDetails,
    getPendingSafeData,
    getPendingAddOwnerData,
    getSafeInfoUsed,
    getOwners,
    getOwnerDetails,
    getTransactionCount,
    getUserTransactions,
    getSafeOwners,
    isOwnerAddress,
    getTotalWeight,
    getThreshold,
    
    // Transaction related
    getAllSafeTransactions,
    getAllTransactions,
    getTransactionDetails,
    sendSafeTransaction,
    checkIsSigned,
    checkIfTxnExecutable,
    proposeTransaction,
    approveTransfer,
    rejectTransfer,
    executeTransaction,
    executeSafeTransaction,
    updateTransactionStatus,
    updateTransactionStatusHere,
    
    // Utility functions
    setPendingAddOwnerData,
    setIsPendingAddOwnerOfSafe,
  };

  return (
    <SafeContext.Provider value={contextValue}>
      {children}
    </SafeContext.Provider>
  );
};

  // Get safe info used
  const getSafeInfoUsed = useCallback(async () => {
    try {
      setIsLoading(true);
      if (safeAddress) {
        const provider = getProvider();
        const safeContract = new ethers.Contract(safeAddress, contractABI, provider);
        const safeInfoUsed = await safeContract.getSafeInfoUsed();
        setSafe(safeInfoUsed);
        setIsLoading(false);
        return safeInfoUsed;
      }
      setIsLoading(false);
      return null;
    } catch (error) {
      setIsLoading(false);
      console.error("Error getting safe info used:", error);
      throw error;
    }
  }, [getProvider, safeAddress]);

  // Get owners of safe
  const getOwners = useCallback(async ({ safeAddress }: { safeAddress: string }) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const safeContract = new ethers.Contract(safeAddress, contractABI, provider);
      const owners = await safeContract.getOwners();
      setIsLoading(false);
      return owners;
    } catch (error) {
      setIsLoading(false);
      console.error("Error getting owners:", error);
      throw error;
    }
  }, [getProvider]);

  // Get owner details
  const getOwnerDetails = useCallback(async ({ safeAddress, owner }: { safeAddress: string; owner: string }) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const safeContract = new ethers.Contract(safeAddress, contractABI, provider);
      const ownerDetails = await safeContract.getOwnerDetails(owner);
      setIsLoading(false);
      return ownerDetails;
    } catch (error) {
      setIsLoading(false);
      console.error("Error getting owner details:", error);
      throw error;
    }
  }, [getProvider]);

  // Get transaction count
  const getTransactionCount = useCallback(async ({ safeAddress }: { safeAddress: string }) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const safeContract = new ethers.Contract(safeAddress, contractABI, provider);
      const transactionCount = await safeContract.getTransactionCount();
      setIsLoading(false);
      return transactionCount;
    } catch (error) {
      setIsLoading(false);
      console.error("Error getting transaction count:", error);
      throw error;
    }
  }, [getProvider]);

  // Get user transactions
  const getUserTransactions = useCallback(async ({ safeAddress, user }: { safeAddress: string; user: string }) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const safeContract = new ethers.Contract(safeAddress, contractABI, provider);
      const userTransactions = await safeContract.getUserTransactions(user);
      setIsLoading(false);
      return userTransactions;
    } catch (error) {
      setIsLoading(false);
      console.error("Error getting user transactions:", error);
      throw error;
    }
  }, [getProvider]);

  // Set pending add owner data
  const setPendingAddOwnerData = useCallback(async ({ safeAddress, owner, timestamp }: { safeAddress: string; owner: string; timestamp: number }) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const signer = provider.getSigner();
      const safeContract = new ethers.Contract(safeAddress, contractABI, signer);
      const tx = await safeContract.setPendingAddOwnerData(owner, timestamp);
      await tx.wait();
      setIsLoading(false);
      return tx;
    } catch (error) {
      setIsLoading(false);
      console.error("Error setting pending add owner data:", error);
      throw error;
    }
  }, [getProvider]);

  // Set is pending add owner
  const setIsPendingAddOwnerOfSafe = useCallback(async (owner: string, status: boolean) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const signer = provider.getSigner();
      const safeContract = new ethers.Contract(safeAddress, contractABI, signer);
      const tx = await safeContract.setIsPendingAddOwner(owner, status);
      await tx.wait();
      setIsLoading(false);
      return tx;
    } catch (error) {
      setIsLoading(false);
      console.error("Error setting is pending add owner of safe:", error);
      throw error;
    }
  }, [getProvider, safeAddress]);

  // User add to safe
  const userAddToSafe = useCallback(async (userAddress?: string) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const signer = provider.getSigner();
      const safeContract = new ethers.Contract(safeAddress, contractABI, signer);
      
      // Use provided user address or current account
      const addressToAdd = userAddress || currentAccount;
      
      const tx = await safeContract.userAddToSafe(addressToAdd);
      await tx.wait();
      
      // Update user addresses
      setUserAddresses(prevAddresses => ({
        ...prevAddresses,
        [addressToAdd]: true
      }));
      
      setIsLoading(false);
      return tx;
    } catch (error) {
      setIsLoading(false);
      console.error("Error adding user to safe:", error);
      throw error;
    }
  }, [getProvider, safeAddress, currentAccount]);

  // Update transaction status
  const updateTransactionStatusHere = useCallback(async ({ safeAddress, transactionHash, status }: { safeAddress: string; transactionHash: string; status: string }) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const signer = provider.getSigner();
      const safeContract = new ethers.Contract(safeAddress, contractABI, signer);
      const tx = await safeContract.updateTransactionStatus(transactionHash, status);
      await tx.wait();
      setIsLoading(false);
      return tx;
    } catch (error) {
      setIsLoading(false);
      console.error("Error updating transaction status:", error);
      throw error;
    }
  }, [getProvider]);

  // Update transaction status in UI
  const updateTransactionStatus = useCallback(async (transaction: PaymentTransactions, status: string) => {
    try {
      setTransactionStatus((prevStatus) => ({ ...prevStatus, [transaction.txhash]: status }));
      await updateTransactionStatusHere({
        safeAddress,
        transactionHash: transaction.txhash,
        status
      });
    } catch (error) {
      console.error("Error updating transaction status:", error);
    }
  }, [safeAddress, updateTransactionStatusHere]);

  // Get safe owners
  const getSafeOwners = useCallback(async ({ safeAddress }: { safeAddress: string }) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const safeContract = new ethers.Contract(safeAddress, contractABI, provider);
      const safeOwners = await safeContract.getSafeOwners();
      setIsLoading(false);
      return safeOwners;
    } catch (error) {
      setIsLoading(false);
      console.error("Error getting safe owners:", error);
      throw error;
    }
  }, [getProvider]);

  // Get transaction details
  const getTransactionDetails = useCallback(async ({ safeAddress, transactionId }: { safeAddress: string; transactionId: number }) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const safeContract = new ethers.Contract(safeAddress, contractABI, provider);
      const transactionDetails = await safeContract.getTransactionDetails(transactionId);
      setIsLoading(false);
      return transactionDetails;
    } catch (error) {
      setIsLoading(false);
      console.error("Error getting transaction details:", error);
      throw error;
    }
  }, [getProvider]);

  // Check if address is owner
  const isOwnerAddress = useCallback(async ({ safeAddress, owner }: { safeAddress: string; owner: string }) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const safeContract = new ethers.Contract(safeAddress, contractABI, provider);
      const isOwner = await safeContract.isOwnerAddress(owner);
      setIsLoading(false);
      return isOwner;
    } catch (error) {
      setIsLoading(false);
      console.error("Error checking if address is owner:", error);
      throw error;
    }
  }, [getProvider]);

  // Get total weight
  const getTotalWeight = useCallback(async ({ safeAddress }: { safeAddress: string }) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const safeContract = new ethers.Contract(safeAddress, contractABI, provider);
      const totalWeight = await safeContract.getTotalWeight();
      setIsLoading(false);
      return totalWeight;
    } catch (error) {
      setIsLoading(false);
      console.error("Error getting total weight:", error);
      throw error;
    }
  }, [getProvider]);

  // Get threshold
  const getThreshold = useCallback(async ({ safeAddress }: { safeAddress: string }) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const safeContract = new ethers.Contract(safeAddress, contractABI, provider);
      const threshold = await safeContract.getThreshold();
      setIsLoading(false);
      return threshold;
    } catch (error) {
      setIsLoading(false);
      console.error("Error getting threshold:", error);
      throw error;
    }
  }, [getProvider]);

  // Execute transaction
  const executeTransaction = useCallback(async (executeTransParam: executeTransParam) => {
    try {
      setIsLoading(true);
      const localProvider = executeTransParam.provider || getProvider();
      const signerAddress = executeTransParam.signer 
        ? executeTransParam.signer 
        : await localProvider.getSigner().getAddress();
      
      const safeContract = new ethers.Contract(executeTransParam.safeAddress, contractABI, localProvider.getSigner());
      
      const tx = {
        to: executeTransParam.transaction.receipient,
        value: ethers.utils.parseEther(executeTransParam.transaction.amount.toString()),
        data: executeTransParam.transaction.data || "0x",
        gasLimit: ethers.utils.hexlify(1000000),
        nonce: await localProvider.getTransactionCount(signerAddress),
      };
      
      const receipt = await localProvider.getSigner().sendTransaction(tx);
      await receipt.wait();
      
      // Store transaction in the contract
      await safeContract.storeTransaction(
        executeTransParam.safeAddress,
        Math.floor(Date.now() / 1000), // Current timestamp in seconds
        executeTransParam.transaction.data || "0x",
        true,
        receipt.hash
      );
      
      setIsLoading(false);
      return receipt;
    } catch (error) {
      setIsLoading(false);
      console.error("Error executing transaction:", error);
      throw error;
    }
  }, [getProvider]);

  // Get all transactions
  const getAllTransactions = useCallback(async (safeInfoParam: SafeInfoParam) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const safeContract = new ethers.Contract(safeInfoParam.safeAddress, contractABI, provider);
      const transactions = await safeContract.getMultiSigTransactions();
      setIsLoading(false);
      return transactions;
    } catch (error) {
      setIsLoading(false);
      console.error("Error getting all transactions:", error);
      throw error;
    }
  }, [getProvider]);

  // Check if transaction is executable
  const checkIfTxnExecutable = useCallback(async (transaction: PaymentTransactions) => {
    try {
      setIsLoading(true);
      setTransaction(transaction);
      
      const provider = getProvider();
      const safeContract = new ethers.Contract(safeAddress, contractABI, provider);
      const executable = await safeContract.isTransactionExecutable(transaction.txhash || "");
      
      setIsLoading(false);
      return executable;
    } catch (error) {
      setIsLoading(false);
      console.error("Error checking if transaction is executable:", error);
      return false;
    }
  }, [getProvider, safeAddress]);

  // Propose transaction
  const proposeTransaction = useCallback(async (safeAddress: string, transaction: PaymentTransactions, executeTransParam: executeTransParam) => {
    try {
      setIsLoading(true);
      
      const provider = getProvider();
      const signer = provider.getSigner();
      const safeContract = new ethers.Contract(safeAddress, contractABI, signer);
      
      // Prepare transaction data
      const transactionData = {
        to: transaction.receipient,
        value: ethers.utils.parseEther(transaction.amount.toString()),
        data: transaction.data || "0x",
        description: transaction.comment || "",
      };
      
      const tx = await safeContract.proposeTransaction(transactionData);
      await tx.wait();
      
      setIsLoading(false);
      return tx;
    } catch (error) {
      setIsLoading(false);
      console.error("Error proposing transaction:", error);
      throw error;
    }
  }, [getProvider]);

  // Approve transfer
  const approveTransfer = useCallback(async (transaction: PaymentTransactions) => {
    try {
      setIsLoading(true);
      setTransaction(transaction);
      
      const provider = getProvider();
      const signer = provider.getSigner();
      const safeContract = new ethers.Contract(safeAddress, contractABI, signer);
      const tx = await safeContract.approveTransaction(transaction.txhash || "");
      await tx.wait();
      
      setIsLoading(false);
      return tx;
    } catch (error) {
      setIsLoading(false);
      console.error("Error approving transfer:", error);
      throw error;
    }
  }, [getProvider, safeAddress]);

  // Reject transfer
  const rejectTransfer = useCallback(async (transaction: PaymentTransactions) => {
    try {
      setIsLoading(true);
      setTransaction(transaction);
      
      const provider = getProvider();
      const signer = provider.getSigner();
      const safeContract = new ethers.Contract(safeAddress, contractABI, signer);
      const tx = await safeContract.rejectTransaction(transaction.txhash || "");
      await tx.wait();
      
      setIsLoading(false);
      return tx;
    } catch (error) {
      setIsLoading(false);
      console.error("Error rejecting transfer:", error);
      throw error;
    }
  }, [getProvider, safeAddress]);

  // Check if transaction is signed
  const checkIsSigned = useCallback(async (transactionHash: string) => {
    try {
      setIsLoading(true);
      
      if (!safeAddress || !transactionHash) {
        setIsLoading(false);
        return;
      }
      
      const safeInfoParam: SafeInfoParam = {
        ownersAddress: ['ownerAddress'],
        safeContractAddress: 'safeContractAddress',
        threshold: 1,
        ownerInfo: [],
        safeAddress: safeAddress,
      };
      
      const txs = await getAllTransactions(safeInfoParam);
      const retrievedTransaction = txs.results?.find((tx: any) => tx.data?.hash === transactionHash);
      const isSigned = retrievedTransaction?.isSigned || false;
      
      setIsUserAlreadySigned(isSigned);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error checking if transaction is signed:", error);
    }
  }, [safeAddress, getAllTransactions]);

  // Execute safe transaction
  const executeSafeTransaction = useCallback(async (transaction: PaymentTransactions) => {
    try {
      setIsLoading(true);
      setTransaction(transaction);
      
      const executable = await checkIfTxnExecutable(transaction);
      
      if (executable) {
        // Propose the transaction
        await proposeTransaction(safeAddress, transaction, {
          safeAddress,
          transaction,
          ownersAddress: [],
          safeContractAddress: '',
          threshold: 0,
          ownerInfo: []
        });
        
        // Approve the transaction
        await approveTransfer(transaction);
        
        // Execute the transaction
        if (provider) {
          const signerAddress = signer ? await signer.getAddress() : undefined;
          
          const executeTransParam: executeTransParam = {
            safeAddress,
            provider: provider as Web3Provider,
            signer: signerAddress,
            transaction,
            hashtxn: transaction.txhash,
            ownersAddress: [],
            safeContractAddress: '',
            threshold: 0,
            ownerInfo: []
          };
          
          const response = await executeTransaction(executeTransParam);
          setTransactionStatus(prevStatus => ({ ...prevStatus, [transaction.txhash]: 'complete' }));
          setIsLoading(false);
          return response;
        } else {
          console.error('Provider is null');
          setIsLoading(false);
          return null;
        }
      } else {
        // Reject the transaction if not executable
        const rejectedTxn = await rejectTransfer(transaction);
        setTransactionStatus(prevStatus => ({ ...prevStatus, [transaction.txhash]: 'rejected' }));
        setIsLoading(false);
        return rejectedTxn;
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error executing safe transaction:", error);
      throw error;
    }
  }, [safeAddress, provider, signer, checkIfTxnExecutable, proposeTransaction, approveTransfer, executeTransaction, rejectTransfer]);

  // Initialize safe context
  useEffect(() => {
    checkIfWalletIsConnect();
    checkIfTransactionsExists();
    
    if (safeAddress) {
      getAllSafeTransactions();
      getSafeInfoUsed();
      checkIsSigned('0x...transactionHash...');
    }
  }, [checkIfWalletIsConnect, checkIfTransactionsExists, safeAddress, getAllSafeTransactions, getSafeInfoUsed, checkIsSigned]);

  // Create context value
  const contextValue: SafeContextType = {
    // Safe state
    safeAddress,
    ownersAddress,
    safeContractAddress,
    isPendingSafeCreation,
    pendingSafeData,
    isPendingAddOwner,
    pendingAddOwnerData,
    isLoading,
    safe,
    isCurrentUserAlreadySigned,
    hasReachedThreshold,
    transactions,
    allSafeTransactions,
    transactionStatus,
    transactionCount,
    currentAccount,
    formData,
    error,

    // Store setters
    setSafeAddress,
    setOwnersAddress,
    setSafeContractAddress,
    setIsPendingSafeCreation,
    setPendingSafeData,
    setIsPendingAddOwner,
    setPendingAddOwnerData,
    setSafeStore,

    // Wallet and connection
    connectWallet,
    checkIfWalletIsConnect,
    checkIfTransactionsExists,
    handleChange,

    // Safe setup and management
    setUpMultiSigSafeAddress,
    addAddressToSafe,
    addOwner,
    removeOwner,
    updateThreshold,
    userAddToSafe,
    
    // Safe info and details
    getSafeInfo,
    getSafeDetails,
    getPendingSafeData,
    getPendingAddOwnerData,
    getSafeInfoUsed,
    getOwners,
    getOwnerDetails,
    getTransactionCount,
    getUserTransactions,
    getSafeOwners,
    isOwnerAddress,
    getTotalWeight,
    getThreshold,
    
    // Transaction related
    getAllSafeTransactions,
    getAllTransactions,
    getTransactionDetails,
    sendSafeTransaction,
    checkIsSigned,
    checkIfTxnExecutable,
    proposeTransaction,
    approveTransfer,
    rejectTransfer,
    executeTransaction,
    executeSafeTransaction,
    updateTransactionStatus,
    updateTransactionStatusHere,
    
    // Utility functions
    setPendingAddOwnerData,
    setIsPendingAddOwnerOfSafe,
  };
  return (
    <SafeContext.Provider value={contextValue}>
      {children}
    </SafeContext.Provider>
  );
};

// Create a custom hook to use the safe context
export const useSafeContext = () => {
  const context = useContext(SafeContext);
  
  if (!context) {
    throw new Error("useSafeContext must be used within a SafeProvider");
  }
  
  return context;
};

export default SafeProvider;