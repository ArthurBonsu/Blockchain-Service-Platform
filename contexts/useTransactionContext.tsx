import React, { createContext, useContext, useEffect, useState, useCallback, PropsWithChildren } from "react";
import { ethers, Signer, BigNumberish, Contract } from "ethers";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Web3Provider } from "@ethersproject/providers";
import { BigNumber } from 'ethers';

// Types
export interface BlockchainTransaction {
  receiver: string;
  sender: string;
  addressTo: string;
  addressFrom: string;
  timestamp: BigNumber;
  message: string;
  keyword: string;
  amount: number | string;
}

export interface Transaction {
  id?: string;
  city?: string;
  date?: string;
  sector?: string;
  ktCO2?: string;
  timestamp?: number;
  blockchainResults?: {
    parsedMetadata?: string;
    speculativeTx?: string;
    zkProof?: string;
    clusterProcessing?: string;
    relayCrossChain?: string;
  };
  processingTime?: number;
}

export interface PaymentTransactions {
  data?: any;
  username?: string;
  address: string;
  amount: number;
  comment?: string;
  timestamp: Date;
  receipient: string;
  receipients?: Array<string>;
  txhash: string;
  USDprice?: number;
  paymenthash?: string;
  owneraddress: string;
  safeAddress?: string;
}

export interface SwapTokenTransaction {
  amount: number;
  tokentxhash: string;
  tokenname: string;
  symbol: string;
  signer: string;
  txdata: string;
  logoUri: string;
}

export interface SwapTransactionType {
  nonce: number;
  amount: number;
  tokenname: string;
  symbol: string;
  logoUri: string;
}

interface SendTransactionProps {
  signer: Signer;
  provider: Web3Provider;
  transactionObject?: PaymentTransactions;
  transactionRequest?: TransactionRequest;
  newcontract?: Contract;
}

// Context Type Definition
interface TransactionContextType {
  // General transaction state
  transactions: Transaction[];
  blockchainTransactions: BlockchainTransaction[];
  currentAccount: string;
  isLoading: boolean;
  transactionCount: string;
  
  // Form data
  formData: {
    addressTo: string;
    amount: string;
    keyword: string;
    message: string;
  };
  PaymentformData: PaymentTransactions;
  transferformData: PaymentTransactions;
  
  // Transaction receipts and status
  paymentTransactionReceipt: any;
  transferTransaction: any;
  tokenTxReceipt: any;
  isPaid: boolean;
  transferredTokenAmount: number;
  paidTokenAmount: number;
  ourUSDPrice: number;
  
  // Token transaction state
  tokentxhash: string;
  
  // Methods
  handleChange: (e: React.ChangeEvent<HTMLInputElement>, name: string) => void;
  connectWallet: () => Promise<string[]>;
  sendTransaction: (params: SendTransactionProps) => Promise<void>;
  sendTokenTransaction: (params: SwapTransactionType) => Promise<SwapTokenTransaction>;
  sendPayment: (transaction: PaymentTransactions) => Promise<any>;
  sendSimpleTransfer: (transaction: PaymentTransactions) => Promise<any>;
  getAllTransactions: () => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  clearTransactions: () => void;
}

// Contract configuration
const getContractConfig = () => {
  // Base contract config
  const transactionContractABI = [
    // Add transaction contract ABI here
  ];
  const transactionContractAddress = process.env.NEXT_PUBLIC_TRANSACTION_CONTRACT_ADDRESS || "";
  
  // Token swap contract config
  const tokenSwapContractABI = [
    // Add token swap contract ABI here
  ];
  const tokenSwapContractAddress = process.env.NEXT_PUBLIC_TOKEN_SWAP_CONTRACT_ADDRESS || "";
  
  return {
    transactionContractABI,
    transactionContractAddress,
    tokenSwapContractABI,
    tokenSwapContractAddress
  };
};

// Create Context
const TransactionContext = createContext<TransactionContextType | null>(null);

// Provider Component
export const TransactionProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { 
    transactionContractABI, 
    transactionContractAddress,
    tokenSwapContractABI,
    tokenSwapContractAddress
  } = getContractConfig();

  // Check for ethereum object
  const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : undefined;

  // Transaction state
  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transactionCount, setTransactionCount] = useState<string>(
    typeof window !== 'undefined' ? localStorage.getItem("transactionCount") || "0" : "0"
  );
  
  // Transaction lists
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [blockchainTransactions, setBlockchainTransactions] = useState<BlockchainTransaction[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  
  const [PaymentformData, setPaymentFormData] = useState<PaymentTransactions>({
    username: "",
    address: "",
    amount: 0,
    comment: "",
    timestamp: new Date(),
    receipient: "",
    receipients: [],
    txhash: "",
    USDprice: 0,
    paymenthash: "",
    owneraddress: ""
  });

  const [transferformData, setTransferFormData] = useState<PaymentTransactions>({
    username: "",
    address: "",
    amount: 0,
    comment: "",
    timestamp: new Date(),
    receipient: "",
    receipients: ["0x"],
    txhash: "",
    USDprice: 0,
    paymenthash: "",
    owneraddress: ""
  });

  // Transaction receipts and status
  const [paymentTransactionReceipt, setPaymentTransactionReceipt] = useState<any>({});
  const [transferTransaction, setTransferTransaction] = useState<any>({});
  const [tokenTxReceipt, setTokenTxReceipt] = useState<any>({});
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [transferredTokenAmount, setTransferredTokenAmount] = useState<number>(0);
  const [paidTokenAmount, setPaidTokenAmount] = useState<number>(0);
  const [ourUSDPrice, setUSDPrice] = useState<number>(0);
  
  // Token transaction state
  const [tokentxhash, setTokenTxHash] = useState<string>("");
  const [accountsProvided, setAccountsProvided] = useState<string[]>([]);

  // Create Ethereum contract
  const createEthereumContract = useCallback(async () => {
    if (!ethereum) throw new Error("Ethereum object not found");
    
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(
      transactionContractAddress, 
      transactionContractABI, 
      signer
    );
    
    return { 
      transactionContract, 
      signer, 
      provider 
    };
  }, [ethereum, transactionContractABI, transactionContractAddress]);

  // Create Token Swap contract
  const createTokenSwapContract = useCallback(async () => {
    if (!ethereum) throw new Error("Ethereum object not found");
    
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const swapContract = new ethers.Contract(
      tokenSwapContractAddress, 
      tokenSwapContractABI, 
      signer
    );
    
    return { 
      swapContract, 
      signer, 
      provider 
    };
  }, [ethereum, tokenSwapContractABI, tokenSwapContractAddress]);
  
  // Request account access
  const requestAccount = useCallback(async () => {
    try {
      if (!ethereum) throw new Error("Ethereum object not found");
      await ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      console.error('Error requesting account access:', error);
      throw error;
    }
  }, [ethereum]);

  // Handle form change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    setFormData(prevState => ({ ...prevState, [name]: e.target.value }));
    setPaymentFormData(prevState => ({ ...prevState, [name]: e.target.value }));
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      if (!ethereum) {
        alert("Please install MetaMask");
        return [];
      }
      
      await requestAccount();
      const accounts = await ethereum.request({ method: "eth_accounts" });
      
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
        setAccountsProvided(accounts);
        return accounts;
      } else {
        console.log("No accounts found");
        return [];
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  }, [ethereum, requestAccount]);

  // Check if wallet is connected
  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      if (!ethereum) {
        console.log("Please install MetaMask");
        return;
      }
      
      const accounts = await ethereum.request({ method: "eth_accounts" });
      
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
        await getAllTransactions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  }, [ethereum]);

  // Check if transactions exist
  const checkIfTransactionsExist = useCallback(async () => {
    try {
      if (!ethereum || !currentAccount) return;
      
      const { transactionContract } = await createEthereumContract();
      const count = await transactionContract.getTransactionCount();
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem("transactionCount", count.toString());
        setTransactionCount(count.toString());
      }
    } catch (error) {
      console.error("Error checking transactions:", error);
    }
  }, [ethereum, currentAccount, createEthereumContract]);

  // Get all transactions from blockchain
  const getAllTransactions = useCallback(async () => {
    try {
      if (!ethereum || !currentAccount) return;
      
      const { transactionContract } = await createEthereumContract();
      
      // This would need to be adapted to your specific contract implementation
      const availableTransactions = await transactionContract.getAllTransactions();
      
      const structuredTransactions = availableTransactions.map((transaction: any) => ({
        receiver: transaction.receiver,
        sender: transaction.sender,
        addressTo: transaction.receiver,
        addressFrom: transaction.sender,
        timestamp: transaction.timestamp,
        message: transaction.message,
        keyword: transaction.keyword,
        amount: ethers.utils.formatEther(transaction.amount),
      }));
      
      setBlockchainTransactions(structuredTransactions);
    } catch (error) {
      console.error("Error getting all transactions:", error);
    }
  }, [ethereum, currentAccount, createEthereumContract]);

  // Add transaction (for UI tracking)
  const addTransaction = useCallback((transaction: Transaction) => {
    const newTransaction = {
      ...transaction,
      id: `tx-${Date.now()}`,
      timestamp: Date.now()
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
  }, []);

  // Clear transactions (for UI tracking)
  const clearTransactions = useCallback(() => {
    setTransactions([]);
  }, []);

  // Send regular transaction
  const sendTransaction = useCallback(async ({ 
    signer, 
    provider, 
    transactionObject, 
    transactionRequest, 
    newcontract 
  }: SendTransactionProps) => {
    try {
      if (!ethereum) throw new Error("Ethereum object not found");
      
      setIsLoading(true);
      
      // Connect wallet if not connected
      if (!currentAccount) {
        await connectWallet();
      }
      
      // Send transaction using the provided request
      if (transactionRequest) {
        const tx = await signer.sendTransaction(transactionRequest);
        await tx.wait();
        
        // Update transaction count if contract provided
        if (newcontract) {
          const count = await newcontract.getTransactionCount();
          setTransactionCount(count.toString());
          
          if (typeof window !== 'undefined') {
            window.localStorage.setItem("transactionCount", count.toString());
          }
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error sending transaction:", error);
      throw error;
    }
  }, [ethereum, currentAccount, connectWallet]);

  // Send payment transaction
  const sendPayment = useCallback(async (transactionData: PaymentTransactions) => {
    try {
      if (!ethereum || !currentAccount) throw new Error("Ethereum object not found or wallet not connected");
      
      setIsLoading(true);
      
      const { transactionContract, signer, provider } = await createEthereumContract();
      const { address, amount, comment, receipient } = transactionData;
      
      // Parse amount to ether
      const parsedAmount = ethers.utils.parseEther(amount.toString());
      
      // Calculate payment fee if applicable
      const paymentFee = await transactionContract.calculateFee(parsedAmount);
      const totalAmount = parsedAmount.add(paymentFee);
      
      // Create transaction request
      const transactionRequest = {
        from: currentAccount,
        to: receipient,
        value: totalAmount,
        gasLimit: ethers.utils.hexlify(250000),
      };
      
      // Send transaction
      const tx = await signer.sendTransaction(transactionRequest);
      const receipt = await tx.wait();
      
      // Record payment in contract
      const paymentTx = await transactionContract.recordPayment(
        receipient,
        parsedAmount,
        comment || "",
        "payment"
      );
      
      await paymentTx.wait();
      
      // Update state
      setPaymentTransactionReceipt(receipt);
      setIsPaid(true);
      setPaidTokenAmount(Number(ethers.utils.formatEther(parsedAmount)));
      
      // Update transaction count
      const count = await transactionContract.getTransactionCount();
      setTransactionCount(count.toString());
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem("transactionCount", count.toString());
      }
      
      setIsLoading(false);
      return receipt;
    } catch (error) {
      setIsLoading(false);
      console.error("Error sending payment:", error);
      throw error;
    }
  }, [ethereum, currentAccount, createEthereumContract]);

  // Send simple transfer
  const sendSimpleTransfer = useCallback(async (transactionData: PaymentTransactions) => {
    try {
      if (!ethereum || !currentAccount) throw new Error("Ethereum object not found or wallet not connected");
      
      setIsLoading(true);
      
      const { transactionContract, signer, provider } = await createEthereumContract();
      const { address, amount, comment, receipient } = transactionData;
      
      // Parse amount to ether
      const parsedAmount = ethers.utils.parseEther(amount.toString());
      
      // Create transaction request
      const transactionRequest = {
        from: currentAccount,
        to: receipient,
        value: parsedAmount,
        gasLimit: ethers.utils.hexlify(250000),
      };
      
      // Send transaction
      const tx = await signer.sendTransaction(transactionRequest);
      const receipt = await tx.wait();
      
      // Record transfer in contract
      const transferTx = await transactionContract.recordTransfer(
        receipient,
        parsedAmount,
        comment || "",
        "transfer"
      );
      
      await transferTx.wait();
      
      // Update state
      setTransferTransaction(receipt);
      setTransferredTokenAmount(Number(ethers.utils.formatEther(parsedAmount)));
      
      // Update transaction count
      const count = await transactionContract.getTransactionCount();
      setTransactionCount(count.toString());
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem("transactionCount", count.toString());
      }
      
      setIsLoading(false);
      return receipt;
    } catch (error) {
      setIsLoading(false);
      console.error("Error sending simple transfer:", error);
      throw error;
    }
  }, [ethereum, currentAccount, createEthereumContract]);

  // Send token transaction
  const sendTokenTransaction = useCallback(async ({ 
    nonce, 
    amount, 
    tokenname, 
    symbol, 
    logoUri 
  }: SwapTransactionType): Promise<SwapTokenTransaction> => {
    try {
      if (!ethereum || !currentAccount) throw new Error("Ethereum object not found or wallet not connected");
      
      setIsLoading(true);
      
      const { swapContract, signer, provider } = await createTokenSwapContract();
      
      // Convert amount to BigNumber
      const depositAmount = BigNumber.from(amount);
      
      // Execute swap transaction
      const swapTx = await swapContract.swapTKA(depositAmount, { from: currentAccount });
      await swapTx.wait();
      
      const txData = swapTx.hash;
      
      // Create token transaction object
      const tokenTransaction: SwapTokenTransaction = {
        amount,
        tokentxhash: txData,
        tokenname,
        symbol,
        signer: currentAccount,
        txdata: swapTx.logs?.[0]?.data || "",
        logoUri,
      };
      
      // Update state
      setTokenTxHash(txData);
      setTokenTxReceipt(swapTx);
      
      setIsLoading(false);
      return tokenTransaction;
    } catch (error) {
      setIsLoading(false);
      console.error("Error sending token transaction:", error);
      throw error;
    }
  }, [ethereum, currentAccount, createTokenSwapContract]);

  // Initialize
  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExist();
  }, [checkIfWalletIsConnected, checkIfTransactionsExist]);

  // Context value
  const value = {
    transactions,
    blockchainTransactions,
    currentAccount,
    isLoading,
    transactionCount,
    formData,
    PaymentformData,
    transferformData,
    paymentTransactionReceipt,
    transferTransaction,
    tokenTxReceipt,
    isPaid,
    transferredTokenAmount,
    paidTokenAmount,
    ourUSDPrice,
    tokentxhash,
    handleChange,
    connectWallet,
    sendTransaction,
    sendTokenTransaction,
    sendPayment,
    sendSimpleTransfer,
    getAllTransactions,
    addTransaction,
    clearTransactions
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

// Use Transaction Context Hook
export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  
  if (!context) {
    throw new Error("useTransactionContext must be used within a TransactionProvider");
  }
  
  return context;
};

export default useTransactionContext;