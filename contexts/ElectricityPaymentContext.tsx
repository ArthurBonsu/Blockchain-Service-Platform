import React, { useState, useEffect, createContext, ReactNode, useCallback, useContext } from 'react';
import { ethers } from 'ethers';

// ABI imports
import ElectricityPaymentContractABI from '../constants/abis/ElectricityPaymentContract.json';
import ERC20ABI from '../constants/abis/ERC20.json';

// Types
interface ElectricityFormData {
  houseId: string;
  billId: string;
  amount: string;
  meterReading: string;
  dueDate: string;
}

interface Payment {
  houseId: string;
  payer: string;
  amount: string;
  timestamp: string;
  meterReading: string;
  isPaid: boolean;
  paymentHash: string;
}

interface Bill {
  billId: string;
  houseId: string;
  amount: string;
  dueDate: string;
  creationDate: string;
  isPaid: boolean;
  meterReadingStart: string;
  meterReadingEnd: string;
}

interface ElectricityPaymentContextType {
  connectWallet: () => Promise<void>;
  currentAccount: string;
  isConnected: boolean;
  isLoading: boolean;
  electricityFormData: ElectricityFormData;
  setElectricityFormData: React.Dispatch<React.SetStateAction<ElectricityFormData>>;
  payBill: (billId: string, meterReading: string) => Promise<void>;
  billDetails: Bill | null;
  paymentHistory: Payment[];
  fetchBillDetails: (billId: string) => Promise<void>;
  fetchPaymentHistory: (houseId: string) => Promise<void>;
  approveTokenSpending: (amount: string) => Promise<void>;
  isApproved: boolean;
  errorMessage: string;
  clearError: () => void;
}

// Create context
export const ElectricityPaymentContext = createContext<ElectricityPaymentContextType | undefined>(undefined);

// Provider component
export const ElectricityPaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [electricityPaymentContract, setElectricityPaymentContract] = useState<ethers.Contract | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [billDetails, setBillDetails] = useState<Bill | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Contracts configuration
  const electricityPaymentContractAddress = process.env.NEXT_PUBLIC_ELECTRICITY_PAYMENT_CONTRACT_ADDRESS || '';
  const tokenContractAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '';
  
  // Form data
  const [electricityFormData, setElectricityFormData] = useState<ElectricityFormData>({
    houseId: '',
    billId: '',
    amount: '',
    meterReading: '',
    dueDate: ''
  });
  
  // Function to connect wallet
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      
      // Check if MetaMask is installed
      const { ethereum } = window as any;
      
      if (!ethereum) {
        alert('Please install MetaMask to use this application');
        return;
      }
      
      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        alert('No accounts found. Please connect to MetaMask');
        return;
      }
      
      const account = accounts[0];
      setCurrentAccount(account);
      setIsConnected(true);
      
      // Initialize provider and contracts
      const web3Provider = new ethers.providers.Web3Provider(ethereum);
      setProvider(web3Provider);
      
      const signer = web3Provider.getSigner();
      
      const electricityContract = new ethers.Contract(
        electricityPaymentContractAddress,
        ElectricityPaymentContractABI.abi,
        signer
      );
      setElectricityPaymentContract(electricityContract);
      
      const erc20Contract = new ethers.Contract(
        tokenContractAddress,
        ERC20ABI.abi,
        signer
      );
      setTokenContract(erc20Contract);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setErrorMessage('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if token spending is approved
  const checkAllowance = useCallback(async () => {
    if (!tokenContract || !currentAccount) return;
    
    try {
      const allowance = await tokenContract.allowance(
        currentAccount,
        electricityPaymentContractAddress
      );
      
      // If allowance is greater than 0, we consider it approved
      setIsApproved(allowance.gt(0));
    } catch (error) {
      console.error('Error checking allowance:', error);
    }
  }, [tokenContract, currentAccount, electricityPaymentContractAddress]);
  
  // Approve token spending
  const approveTokenSpending = async (amount: string) => {
    if (!tokenContract) return;
    
    try {
      setIsLoading(true);
      
      // Convert amount to wei (considering 18 decimals)
      const amountInWei = ethers.utils.parseUnits(amount, 18);
      
      // Approve spending
      const tx = await tokenContract.approve(
        electricityPaymentContractAddress,
        amountInWei
      );
      
      // Wait for transaction to be mined
      await tx.wait();
      
      setIsApproved(true);
    } catch (error) {
      console.error('Error approving token spending:', error);
      setErrorMessage('Failed to approve token spending. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Pay electricity bill
  const payBill = async (billId: string, meterReading: string) => {
    if (!electricityPaymentContract) return;
    
    try {
      setIsLoading(true);
      
      // Pay bill
      const tx = await electricityPaymentContract.payBill(billId, meterReading);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Refresh bill details
      await fetchBillDetails(billId);
    } catch (error) {
      console.error('Error paying bill:', error);
      setErrorMessage('Failed to pay bill. Please make sure you have enough tokens and try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch bill details
  const fetchBillDetails = async (billId: string) => {
    if (!electricityPaymentContract) return;
    
    try {
      setIsLoading(true);
      
      // Get bill details
      const bill = await electricityPaymentContract.bills(billId);
      
      // Format bill data
      const formattedBill: Bill = {
        billId: bill.billId,
        houseId: bill.houseId,
        amount: bill.amount.toString(),
        dueDate: bill.dueDate.toString(),
        creationDate: bill.creationDate.toString(),
        isPaid: bill.isPaid,
        meterReadingStart: bill.meterReadingStart,
        meterReadingEnd: bill.meterReadingEnd
      };
      
      setBillDetails(formattedBill);
    } catch (error) {
      console.error('Error fetching bill details:', error);
      setErrorMessage('Failed to fetch bill details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch payment history
  const fetchPaymentHistory = async (houseId: string) => {
    if (!electricityPaymentContract) return;
    
    try {
      setIsLoading(true);
      
      // Get payments for house
      const payments = await electricityPaymentContract.getHousePayments(houseId);
      
      // Format payments
      const formattedPayments: Payment[] = payments.map((payment: any) => ({
        houseId: payment.houseId,
        payer: payment.payer,
        amount: payment.amount.toString(),
        timestamp: payment.timestamp.toString(),
        meterReading: payment.meterReading,
        isPaid: payment.isPaid,
        paymentHash: payment.paymentHash
      }));
      
      setPaymentHistory(formattedPayments);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setErrorMessage('Failed to fetch payment history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear error message
  const clearError = () => {
    setErrorMessage('');
  };
  
  // Check wallet connection on load
  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      try {
        const { ethereum } = window as any;
        
        if (!ethereum) {
          console.log('Make sure you have MetaMask installed');
          return;
        }
        
        // Check if we're authorized to access the user's wallet
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        
        if (accounts.length !== 0) {
          const account = accounts[0];
          setCurrentAccount(account);
          setIsConnected(true);
          await connectWallet();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };
    
    checkIfWalletIsConnected();
  }, []);
  
  // Check allowance when account or contracts change
  useEffect(() => {
    if (tokenContract && currentAccount) {
      checkAllowance();
    }
  }, [tokenContract, currentAccount, checkAllowance]);
  
  // Listen for account changes
  useEffect(() => {
    const { ethereum } = window as any;
    
    if (ethereum) {
      ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
        } else {
          setCurrentAccount('');
          setIsConnected(false);
        }
      });
      
      ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
    
    return () => {
      if (ethereum) {
        ethereum.removeAllListeners('accountsChanged');
        ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);
  
  const contextValue: ElectricityPaymentContextType = {
    connectWallet,
    currentAccount,
    isConnected,
    isLoading,
    electricityFormData,
    setElectricityFormData,
    payBill,
    billDetails,
    paymentHistory,
    fetchBillDetails,
    fetchPaymentHistory,
    approveTokenSpending,
    isApproved,
    errorMessage,
    clearError
  };
  
  return (
    <ElectricityPaymentContext.Provider value={contextValue}>
      {children}
    </ElectricityPaymentContext.Provider>
  );
};