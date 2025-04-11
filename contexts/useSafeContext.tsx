import React, { 
  createContext, 
  useContext,
  useState, 
  useEffect,
  useCallback, 
  PropsWithChildren 
} from "react";
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { BlockchainTransaction } from "types/ethers";
import { PaymentTransactions } from "types";
import { useSafeStore } from 'stores/safeStore';
import { useEthersStore } from "stores/ethersStore";
import { useWalletStore } from 'stores/ContextStores/walletStore';

// Interfaces
export interface SafeInfoParam {
  ownersAddress: string[];
  safeContractAddress: string;
  threshold: number;
  ownerInfo: any[];
  safeAddress: string;
  provider?: Web3Provider;
  signer?: string;
}

export interface ExecuteTransParam {
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

// SafeContext type definition
interface SafeContextType {
  // State
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

  // Setters
  setSafeAddress: (safeAddress: string) => void;
  setOwnersAddress: (ownersAddress: string[]) => void;
  setSafeContractAddress: (safeContractAddress: string) => void;
  setIsPendingSafeCreation: (isPendingSafeCreation: boolean) => void;
  setPendingSafeData: (pendingSafeData: any) => void;
  setIsPendingAddOwner: (isPendingAddOwner: boolean) => void;
  setPendingAddOwnerData: (pendingAddOwnerData: any) => void;

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
  proposeTransaction: (transaction: PaymentTransactions) => Promise<any>;
  approveTransfer: (transaction: PaymentTransactions) => Promise<any>;
  rejectTransfer: (transaction: PaymentTransactions) => Promise<any>;
  executeTransaction: (executeTransParam: ExecuteTransParam) => Promise<any>;
  executeSafeTransaction: (transaction: PaymentTransactions) => Promise<any>;
  updateTransactionStatus: (transaction: PaymentTransactions, status: string) => Promise<void>;
  updateTransactionStatusHere: (params: { safeAddress: string; transactionHash: string; status: string }) => Promise<any>;
}

// Create context
const SafeContext = createContext<SafeContextType | null>(null);

// Custom hook to use the SafeContext
export const useSafeContext = () => {
  const context = useContext(SafeContext);
  if (context === null) {
    throw new Error('useSafeContext must be used within a SafeContextProvider');
  }
  return context;
};

// Contract configuration (placeholders)
const contractABI: ethers.ContractInterface = [
  // Add proper ABI entries here
];

const contractBytecode: string = '0x...'; // Replace with actual bytecode

// Provider Component
export const SafeContextProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  // Store state hooks
  const safeAddress = useSafeStore((state) => state.safeAddress);
  const ownersAddress = useSafeStore((state) => state.ownersAddress);
  const safeContractAddress = useSafeStore((state) => state.safeContractAddress);
  const isPendingSafeCreation = useSafeStore((state) => state.isPendingSafeCreation);
  const pendingSafeData = useSafeStore((state) => state.pendingSafeData);
  const isPendingAddOwner = useSafeStore((state) => state.isPendingAddOwner);
  const pendingAddOwnerData = useSafeStore((state) => state.pendingAddOwnerData);
  
  // Store setters
  const setSafeAddress = useSafeStore((state) => state.setSafeAddress);
  const setOwnersAddress = useSafeStore((state) => state.setOwnersAddress);
  const setSafeContractAddress = useSafeStore((state) => state.setSafeContractAddress);
  const setIsPendingSafeCreation = useSafeStore((state) => state.setIsPendingSafeCreation);
  const setPendingSafeData = useSafeStore((state) => state.setPendingSafeData);
  const setIsPendingAddOwner = useSafeStore((state) => state.setIsPendingAddOwner);
  const setPendingAddOwnerData = useSafeStore((state) => state.setPendingAddOwnerData);
  const setSafeStore = useSafeStore((state) => state.setSafeStore);
  
  // Ethers store values
  const chainId = useEthersStore((state) => state.chainId);
  const setAddress = useEthersStore((state) => state.setAddress);
  
  // Wallet store values
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


  // Update transaction status
  const updateTransactionStatus = useCallback(async (transaction: PaymentTransactions, status: string) => {
    try {
      setIsLoading(true);
      
      // Update status in local state
      setTransactionStatus(prev => ({
        ...prev,
        [transaction.txhash]: status
      }));
      
      // In a real implementation, you would update the status on-chain here
      console.log(`Updating transaction ${transaction.txhash} status to ${status}`);
      
      // Return success
      return { success: true, status };
    } catch (error) {
      console.error('Error updating transaction status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update transaction status');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Propose transaction implementation
  const proposeTransaction = useCallback(async (transaction: PaymentTransactions) => {
    try {
      setIsLoading(true);
      
      // Log the transaction
      console.log('Proposing transaction:', transaction);
      
      // In a real implementation, you would make a blockchain call here
      // For now, we'll simulate a successful transaction proposal
      
      // Update transaction with a pending status if not already set
      const transactionWithStatus = {
        ...transaction,
        status: transaction.status || 'pending'
      };
      
      // Add to transactions list
      setTransactions(prev => [...prev, transactionWithStatus as unknown as BlockchainTransaction]);
      
      // Update transaction status
      await updateTransactionStatus(transactionWithStatus, 'pending');
      
      return transactionWithStatus;
    } catch (error) {
      console.error('Error proposing transaction:', error);
      setError(error instanceof Error ? error.message : 'Failed to propose transaction');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [updateTransactionStatus]);

  // Approve transfer implementation
  const approveTransfer = useCallback(async (transaction: PaymentTransactions) => {
    try {
      setIsLoading(true);
      
      // Log the transaction
      console.log('Approving transaction:', transaction);
      
      // In a real implementation, you would make a blockchain call here
      // For now, we'll simulate a successful approval
      
      // Update transaction status
      await updateTransactionStatus(transaction, 'approved');
      
      return { success: true, transaction };
    } catch (error) {
      console.error('Error approving transaction:', error);
      setError(error instanceof Error ? error.message : 'Failed to approve transaction');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [updateTransactionStatus]);

  // Reject transfer implementation
  const rejectTransfer = useCallback(async (transaction: PaymentTransactions) => {
    try {
      setIsLoading(true);
      
      // Log the transaction
      console.log('Rejecting transaction:', transaction);
      
      // In a real implementation, you would make a blockchain call here
      // For now, we'll simulate a successful rejection
      
      // Update transaction status
      await updateTransactionStatus(transaction, 'rejected');
      
      return { success: true, transaction };
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      setError(error instanceof Error ? error.message : 'Failed to reject transaction');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [updateTransactionStatus]);

  // Execute transaction implementation
  const executeTransaction = useCallback(async (executeTransParam: ExecuteTransParam) => {
    try {
      setIsLoading(true);
      
      // Log the execution parameters
      console.log('Executing transaction:', executeTransParam);
      
      // In a real implementation, you would make a blockchain call here
      // For now, we'll simulate a successful execution
      
      // Update transaction status
      await updateTransactionStatus(executeTransParam.transaction, 'complete');
      
      return { success: true, transaction: executeTransParam.transaction };
    } catch (error) {
      console.error('Error executing transaction:', error);
      setError(error instanceof Error ? error.message : 'Failed to execute transaction');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [updateTransactionStatus]);

  // Check if transaction is executable
  const checkIfTxnExecutable = useCallback(async (transaction: PaymentTransactions) => {
    try {
      // In a real implementation, you would check if the transaction has enough approvals
      // For now, we'll simulate based on the transaction status
      
      // A transaction is executable if it's approved
      return transaction.status === 'approved';
    } catch (error) {      
      console.error('Error checking if transaction is executable:', error);
      setError(error instanceof Error ? error.message : 'Failed to check if transaction is executable');
      throw error;
    }
  }, []);

  
  // Add owner implementation
  const addOwner = useCallback(async (newOwner: string) => {
    try {
      setIsPendingAddOwner(true);
      setPendingAddOwnerData({
        status: 'Adding owner...',
        progress: {
          currentStep: 1,
          totalSteps: 2
        }
      });

      // TODO: Implement actual blockchain interaction
      console.log(`Adding owner: ${newOwner}`);
      
      // Update owners list
      const updatedOwners = [...ownersAddress, newOwner];
      setOwnersAddress(updatedOwners);

      setPendingAddOwnerData({
        status: 'Owner added successfully',
        progress: {
          currentStep: 2,
          totalSteps: 2
        }
      });

      return { success: true, ownersAddress: updatedOwners };
    } catch (error) {
      console.error('Error adding owner:', error);
      setError(error instanceof Error ? error.message : 'Failed to add owner');
      throw error;
    } finally {
      setIsPendingAddOwner(false);
    }
  }, [ownersAddress, setOwnersAddress, setIsPendingAddOwner, setPendingAddOwnerData]);

  // Get safe info
  const getSafeInfoUsed = useCallback(async () => {
    try {
      // Placeholder implementation
      return {
        safeAddress,
        ownersAddress,
        safeContractAddress
      };
    } catch (error) {
      console.error('Error getting safe info:', error);
      throw error;
    }
  }, [safeAddress, ownersAddress, safeContractAddress]);

  // Prepare context value
  const contextValue: SafeContextType = {
    // State values
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

    // Setters
    setSafeAddress,
    setOwnersAddress,
    setSafeContractAddress,
    setIsPendingSafeCreation,
    setPendingSafeData,
    setIsPendingAddOwner,
    setPendingAddOwnerData,

    // Wallet connection methods
    connectWallet: async () => {
      try {
        if (!ethereum) {
          setError("Please install MetaMask to continue");
          return;
        }

        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        setCurrentAccount(accounts[0]);
        setAddress(accounts[0]);
        
        // Initialize other things as needed
        console.log("Wallet connected:", accounts[0]);
      } catch (error) {
        console.error("Error connecting wallet:", error);
        setError("Failed to connect wallet");
        throw error;
      }
    },
    
    checkIfWalletIsConnect: async () => {
      try {
        if (!ethereum) {
          setError("Please install MetaMask to continue");
          return;
        }

        const accounts = await ethereum.request({ method: "eth_accounts" });
        
        if (accounts.length) {
          setCurrentAccount(accounts[0]);
          setAddress(accounts[0]);
          console.log("Wallet is already connected:", accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
        setError("Failed to check wallet connection");
        throw error;
      }
    },
    
    checkIfTransactionsExists: async () => {
      try {
        if (!ethereum) return;
        
        // In a real implementation, you would check the blockchain for transactions
        console.log("Checking for existing transactions");
      } catch (error) {
        console.error("Error checking transactions:", error);
        throw error;
      }
    },
    
    handleChange: (e, name) => {
      setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
    },

    // Safe management methods
    setUpMultiSigSafeAddress: async (address) => {
      try {
        setIsLoading(true);
        setIsPendingSafeCreation(true);
        setPendingSafeData({
          status: 'Setting up safe...',
          progress: {
            currentStep: 1,
            totalSteps: 3
          }
        });
        
        // In a real implementation, you would create a multi-sig safe contract
        console.log(`Setting up multi-sig safe at address: ${address}`);
        
        // Update safe address
        setSafeAddress(address);
        
        setPendingSafeData({
          status: 'Safe setup complete',
          progress: {
            currentStep: 3,
            totalSteps: 3
          }
        });
        
        return address;
      } catch (error) {
        console.error('Error setting up multi-sig safe:', error);
        setError(error instanceof Error ? error.message : 'Failed to set up multi-sig safe');
        throw error;
      } finally {
        setIsLoading(false);
        setIsPendingSafeCreation(false);
      }
    },
    
    addAddressToSafe: async (safeAddress, newAddress) => {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would add the address to the safe contract
        console.log(`Adding address ${newAddress} to safe ${safeAddress}`);
        
        // Update owners list
        const updatedOwners = [...ownersAddress, newAddress];
        setOwnersAddress(updatedOwners);
        
        return updatedOwners;
      } catch (error) {
        console.error('Error adding address to safe:', error);
        setError(error instanceof Error ? error.message : 'Failed to add address to safe');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    
    addOwner,
    
    removeOwner: async (ownerToRemove) => {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would remove the owner from the safe contract
        console.log(`Removing owner ${ownerToRemove}`);
        
        // Update owners list
        const updatedOwners = ownersAddress.filter(owner => owner !== ownerToRemove);
        setOwnersAddress(updatedOwners);
        
        return { success: true, ownersAddress: updatedOwners };
      } catch (error) {
        console.error('Error removing owner:', error);
        setError(error instanceof Error ? error.message : 'Failed to remove owner');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    
    updateThreshold: async (newThreshold) => {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would update the threshold in the safe contract
        console.log(`Updating threshold to ${newThreshold}`);
        
        return { success: true, threshold: newThreshold };
      } catch (error) {
        console.error('Error updating threshold:', error);
        setError(error instanceof Error ? error.message : 'Failed to update threshold');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    
    userAddToSafe: async (userAddress) => {
      // Placeholder
      return { success: true };
    },

    // Safe info methods
    getSafeInfo: async (safeInfoParam) => {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would get info from the safe contract
        console.log('Getting safe info:', safeInfoParam);
        
        return {
          safeAddress: safeInfoParam.safeAddress,
          ownersAddress: safeInfoParam.ownersAddress,
          threshold: safeInfoParam.threshold,
          ownerInfo: safeInfoParam.ownerInfo
        };
      } catch (error) {
        console.error('Error getting safe info:', error);
        setError(error instanceof Error ? error.message : 'Failed to get safe info');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    
    getSafeDetails: () => ({
      safeAddress,
      ownersAddress,
      safeContractAddress
    }),
    
    getPendingSafeData: () => pendingSafeData,
    getPendingAddOwnerData: () => pendingAddOwnerData,
    getSafeInfoUsed,
    

    
    getOwners: async (params) => {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would get owners from the safe contract
        console.log('Getting owners for safe:', params.safeAddress);
        
        return ownersAddress;
      } catch (error) {
        console.error('Error getting owners:', error);
        setError(error instanceof Error ? error.message : 'Failed to get owners');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    
    getOwnerDetails: async (params) => {
      // Placeholder
      return { address: params.owner };
    },
    
    getTransactionCount: async (params) => {
      // Placeholder
      return transactions.length;
    },
    
    getUserTransactions: async (params) => {
      // Placeholder
      return transactions.filter(tx => 
        (tx as unknown as PaymentTransactions).owneraddress === params.user
      );
    },
    
    getSafeOwners: async (params) => {
      // Placeholder - same as getOwners for now
      return ownersAddress;
    },
    
    isOwnerAddress: async (params) => {
      return ownersAddress.includes(params.owner);
    },
    
    getTotalWeight: async (params) => {
      // Placeholder
      return ownersAddress.length;
    },
    
    getThreshold: async (params) => {
      // Placeholder
      return 1; // Default threshold
    },

    // Transaction methods
    getAllSafeTransactions: async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would fetch transactions from the blockchain
        console.log('Getting all safe transactions');
        
        // For now, just returning the existing transactions
        setAllSafeTransactions(transactions as any[]);
      } catch (error) {
        console.error('Error getting safe transactions:', error);
        setError(error instanceof Error ? error.message : 'Failed to get safe transactions');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    
    getAllTransactions: async (safeInfoParam) => {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would fetch transactions from the blockchain
        console.log('Getting all transactions for safe:', safeInfoParam);
        
        return transactions;
      } catch (error) {
        console.error('Error getting transactions:', error);
        setError(error instanceof Error ? error.message : 'Failed to get transactions');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    
    getTransactionDetails: async (params) => {
      // Placeholder
      return transactions[params.transactionId];
    },
    
    sendSafeTransaction: async (transactionData) => {
      // Placeholder
      console.log('Sending safe transaction:', transactionData);
    },
    
    checkIsSigned: async (transactionHash) => {
      // Placeholder
      setIsUserAlreadySigned(false);
    },
    
    // Implement transaction methods that were defined earlier
    checkIfTxnExecutable,
    proposeTransaction,
    approveTransfer,
    rejectTransfer,
    executeTransaction,
    
    executeSafeTransaction: async (transaction) => {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would execute the safe transaction on the blockchain
        console.log('Executing safe transaction:', transaction);
        
        // Update transaction status
        await updateTransactionStatus(transaction, 'complete');
        
        return { success: true, transaction };
      } catch (error) {
        console.error('Error executing safe transaction:', error);
        setError(error instanceof Error ? error.message : 'Failed to execute safe transaction');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    
    updateTransactionStatus,
    
    updateTransactionStatusHere: async (params) => {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would update the transaction status on the blockchain
        console.log(`Updating transaction ${params.transactionHash} status to ${params.status}`);
        
        // Update status in local state
        setTransactionStatus(prev => ({
          ...prev,
          [params.transactionHash]: params.status
        }));
        
        return { success: true, status: params.status };
      } catch (error) {
        console.error('Error updating transaction status:', error);
        setError(error instanceof Error ? error.message : 'Failed to update transaction status');
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeContext.Provider value={contextValue}>
      {children}
    </SafeContext.Provider>
  );
};

export default SafeContextProvider;