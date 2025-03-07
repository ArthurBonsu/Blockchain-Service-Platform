import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Interfaces for type safety
interface LandDetails {
  landId: number;
  landOwner: string;
  landLocation: string;
  landSize: number;
  landPrice: number;
  geohash?: string;
  isActive?: boolean;
}

interface PriceRecord {
  price: number;
  timestamp: number;
  recorder: string;
}

interface LandOwnershipContextType {
  // Wallet and Connection
  currentAccount: string | null;
  connectWallet: () => Promise<void>;
  
  // Land Operations
  registerLand: (landDetails: LandDetails) => Promise<string>;
  transferLand: (landId: number, newOwner: string) => Promise<string>;
  updateLandPrice: (landId: number, newPrice: number) => Promise<string>;
  buyLand: (landId: number, price: number) => Promise<string>;
  deregisterLand: (landId: number, reason: string) => Promise<string>;
  
  // Retrieval Methods
  getLandDetails: (landId: number) => Promise<LandDetails>;
  getAllLands: () => Promise<LandDetails[]>;
  
  // Price and Royalty Features
  getLandPriceHistory: (landId: number) => Promise<PriceRecord[]>;
  getRoyaltyBalance: () => Promise<number>;
  claimRoyalties: () => Promise<string>;
  
  // State and Utility
  landRegistry: LandDetails[];
  landPriceHistory: PriceRecord[];
  royaltyBalance: number;
  isLoading: boolean;
  transactions: any[];
}

// Create context
const LandOwnershipContext = createContext<LandOwnershipContextType | undefined>(undefined);

// Provider Component
export const LandOwnershipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State Variables
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [landRegistry, setLandRegistry] = useState<LandDetails[]>([]);
  const [landPriceHistory, setLandPriceHistory] = useState<PriceRecord[]>([]);
  const [royaltyBalance, setRoyaltyBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Ethereum Contract Setup
  const createEthereumContract = async () => {
    const { ethereum } = window;
    if (!ethereum) throw new Error('Ethereum object not found');

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    
    // TODO: Replace with actual contract ABI and address
    const contractABI = []; // Your contract ABI
    const contractAddress = ''; // Your contract address
    
    return new ethers.Contract(contractAddress, contractABI, signer);
  };

  // Wallet Connection
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.error(error);
      throw new Error('No ethereum object');
    }
  };

  // Land Registration
  const registerLand = async (landDetails: LandDetails): Promise<string> => {
    try {
      setIsLoading(true);
      const contract = await createEthereumContract();

      const tx = await contract.registerLand(
        landDetails.landLocation,
        landDetails.landSize,
        ethers.utils.parseEther(landDetails.landPrice.toString()),
        landDetails.geohash || ''
      );

      await tx.wait();
      setIsLoading(false);
      await getAllLands(); // Refresh land registry
      return tx.hash;
    } catch (error) {
      setIsLoading(false);
      console.error('Land registration error:', error);
      throw error;
    }
  };

  // Land Transfer
  const transferLand = async (landId: number, newOwner: string): Promise<string> => {
    try {
      setIsLoading(true);
      const contract = await createEthereumContract();

      const tx = await contract.transferLand(landId, newOwner);
      await tx.wait();
      setIsLoading(false);
      await getAllLands(); // Refresh land registry
      return tx.hash;
    } catch (error) {
      setIsLoading(false);
      console.error('Land transfer error:', error);
      throw error;
    }
  };

  // Update Land Price
  const updateLandPrice = async (landId: number, newPrice: number): Promise<string> => {
    try {
      setIsLoading(true);
      const contract = await createEthereumContract();

      const tx = await contract.updateLandPrice(
        landId, 
        ethers.utils.parseEther(newPrice.toString())
      );
      await tx.wait();
      setIsLoading(false);
      await getAllLands(); // Refresh land registry
      return tx.hash;
    } catch (error) {
      setIsLoading(false);
      console.error('Price update error:', error);
      throw error;
    }
  };

  // Buy Land
  const buyLand = async (landId: number, price: number): Promise<string> => {
    try {
      setIsLoading(true);
      const contract = await createEthereumContract();

      const tx = await contract.buyLand(landId, {
        value: ethers.utils.parseEther(price.toString())
      });
      await tx.wait();
      setIsLoading(false);
      await getAllLands(); // Refresh land registry
      return tx.hash;
    } catch (error) {
      setIsLoading(false);
      console.error('Land purchase error:', error);
      throw error;
    }
  };

  // Deregister Land
  const deregisterLand = async (landId: number, reason: string): Promise<string> => {
    try {
      setIsLoading(true);
      const contract = await createEthereumContract();

      const tx = await contract.deregisterLand(landId, reason);
      await tx.wait();
      setIsLoading(false);
      await getAllLands(); // Refresh land registry
      return tx.hash;
    } catch (error) {
      setIsLoading(false);
      console.error('Land deregistration error:', error);
      throw error;
    }
  };

  // Get Land Details
  const getLandDetails = async (landId: number): Promise<LandDetails> => {
    try {
      const contract = await createEthereumContract();
      const details = await contract.getLandDetails(landId);
      
      return {
        landId,
        landOwner: details.owner,
        landLocation: details.location,
        landSize: details.size.toNumber(),
        landPrice: parseFloat(ethers.utils.formatEther(details.price)),
        geohash: details.geohash,
        isActive: details.isActive
      };
    } catch (error) {
      console.error('Get land details error:', error);
      throw error;
    }
  };

  // Get All Lands
  const getAllLands = async (): Promise<LandDetails[]> => {
    try {
      const contract = await createEthereumContract();
      const landCount = await contract.getLandCount();
      
      const lands: LandDetails[] = [];
      for (let i = 1; i <= landCount; i++) {
        const land = await getLandDetails(i);
        lands.push(land);
      }
      
      setLandRegistry(lands);
      return lands;
    } catch (error) {
      console.error('Get all lands error:', error);
      throw error;
    }
  };

  // Get Land Price History
  const getLandPriceHistory = async (landId: number): Promise<PriceRecord[]> => {
    try {
      const contract = await createEthereumContract();
      const history = await contract.getLandPriceHistory(landId);
      
      const formattedHistory: PriceRecord[] = history.map((record: any) => ({
        price: parseFloat(ethers.utils.formatEther(record.price)),
        timestamp: record.timestamp.toNumber(),
        recorder: record.recorder
      }));
      
      setLandPriceHistory(formattedHistory);
      return formattedHistory;
    } catch (error) {
      console.error('Get land price history error:', error);
      throw error;
    }
  };

  // Get Royalty Balance
  const getRoyaltyBalance = async (): Promise<number> => {
    try {
      if (!currentAccount) throw new Error('No account connected');
      
      const contract = await createEthereumContract();
      const balance = await contract.getRoyaltyBalance(currentAccount);
      
      const balanceInEther = parseFloat(ethers.utils.formatEther(balance));
      setRoyaltyBalance(balanceInEther);
      return balanceInEther;
    } catch (error) {
      console.error('Get royalty balance error:', error);
      throw error;
    }
  };

  // Claim Royalties
  const claimRoyalties = async (): Promise<string> => {
    try {
      setIsLoading(true);
      const contract = await createEthereumContract();
      
      const tx = await contract.claimRoyalties();
      await tx.wait();
      
      // Refresh royalty balance
      await getRoyaltyBalance();
      
      setIsLoading(false);
      return tx.hash;
    } catch (error) {
      setIsLoading(false);
      console.error('Claim royalties error:', error);
      throw error;
    }
  };

  // Initialize Wallet Connection
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const { ethereum } = window;
        if (!ethereum) return;

        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length) {
          setCurrentAccount(accounts[0]);
          await getAllLands();
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkWalletConnection();
  }, []);

  // Context Value
  const contextValue: LandOwnershipContextType = {
    currentAccount,
    connectWallet,
    registerLand,
    transferLand,
    updateLandPrice,
    buyLand,
    deregisterLand,
    getLandDetails,
    getAllLands,
    getLandPriceHistory,
    getRoyaltyBalance,
    claimRoyalties,
    landRegistry,
    landPriceHistory,
    royaltyBalance,
    isLoading,
    transactions
  };

  return (
    <LandOwnershipContext.Provider value={contextValue}>
      {children}
    </LandOwnershipContext.Provider>
  );
};

// Custom Hook for using the context
export const useLandOwnership = () => {
  const context = useContext(LandOwnershipContext);
  if (context === undefined) {
    throw new Error('useLandOwnership must be used within a LandOwnershipProvider');
  }
  return context;
};

export default LandOwnershipProvider;