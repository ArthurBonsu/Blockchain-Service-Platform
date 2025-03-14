import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useEthersStore } from 'stores/ethersStore';
import { useWalletStore } from 'stores/ContextStores/walletStore';

// Import the ABI for the BlockchainServicesToken contract
import BlockchainServicesTokenABI from 'constants/abi/BlockchainServicesToken.json';

// Token contract address (to be replaced with actual deployed contract address)
const TOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS;

// Define the context type
interface TokenContextType {
  // Token balance
  tokenBalance: string;
  stakedBalance: string;
  
  // Token actions
  stakeTokens: (amount: string) => Promise<void>;
  unstakeTokens: (amount: string) => Promise<void>;
  transferTokens: (recipient: string, amount: string) => Promise<void>;
  
  // Governance actions
  governanceVote: (proposalId: number) => Promise<void>;
  
  // Utility functions
  fetchTokenBalance: () => Promise<void>;
  calculateRewards: (amount: string, stakingDuration: number) => Promise<string>;
}

// Create the context
const TokenContext = createContext<TokenContextType | null>(null);

// Provider component
export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Access wallet and ethers store
  const { provider, signer } = useWalletStore();
  const { address } = useEthersStore();

  // State variables
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [stakedBalance, setStakedBalance] = useState<string>('0');

  // Get token contract
  const getTokenContract = useCallback(() => {
    if (!provider || !signer) {
      throw new Error('Provider or signer not available');
    }
    return new ethers.Contract(TOKEN_CONTRACT_ADDRESS, BlockchainServicesTokenABI, signer);
  }, [provider, signer]);

  // Fetch token balance
  const fetchTokenBalance = useCallback(async () => {
    if (!address || !provider) return;

    try {
      const contract = getTokenContract();
      
      // Fetch token balance
      const balance = await contract.balanceOf(address);
      setTokenBalance(ethers.utils.formatUnits(balance, 18));

      // Fetch staked balance
      const stakedBalance = await contract.stakingBalances(address);
      setStakedBalance(ethers.utils.formatUnits(stakedBalance, 18));
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  }, [address, provider, getTokenContract]);

  // Stake tokens
  const stakeTokens = useCallback(async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');

    try {
      const contract = getTokenContract();
      const parsedAmount = ethers.utils.parseUnits(amount, 18);
      
      // Approve and stake
      const approveTx = await contract.approve(TOKEN_CONTRACT_ADDRESS, parsedAmount);
      await approveTx.wait();

      const stakeTx = await contract.stakeTokens(parsedAmount);
      await stakeTx.wait();

      // Refresh balances
      await fetchTokenBalance();
    } catch (error) {
      console.error('Error staking tokens:', error);
      throw error;
    }
  }, [address, getTokenContract, fetchTokenBalance]);

  // Unstake tokens
  const unstakeTokens = useCallback(async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');

    try {
      const contract = getTokenContract();
      const parsedAmount = ethers.utils.parseUnits(amount, 18);

      const unstakeTx = await contract.unstakeTokens(parsedAmount);
      await unstakeTx.wait();

      // Refresh balances
      await fetchTokenBalance();
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      throw error;
    }
  }, [address, getTokenContract, fetchTokenBalance]);

  // Transfer tokens
  const transferTokens = useCallback(async (recipient: string, amount: string) => {
    if (!address) throw new Error('Wallet not connected');

    try {
      const contract = getTokenContract();
      const parsedAmount = ethers.utils.parseUnits(amount, 18);

      const transferTx = await contract.transfer(recipient, parsedAmount);
      await transferTx.wait();

      // Refresh balances
      await fetchTokenBalance();
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw error;
    }
  }, [address, getTokenContract, fetchTokenBalance]);

  // Governance vote
  const governanceVote = useCallback(async (proposalId: number) => {
    if (!address) throw new Error('Wallet not connected');

    try {
      const contract = getTokenContract();
      const voteTx = await contract.governanceVote(proposalId);
      await voteTx.wait();
    } catch (error) {
      console.error('Error voting:', error);
      throw error;
    }
  }, [address, getTokenContract]);

  // Calculate rewards
  const calculateRewards = useCallback(async (amount: string, stakingDuration: number) => {
    try {
      const contract = getTokenContract();
      const parsedAmount = ethers.utils.parseUnits(amount, 18);
      
      const rewards = await contract.calculateRewards(parsedAmount, stakingDuration);
      return ethers.utils.formatUnits(rewards, 18);
    } catch (error) {
      console.error('Error calculating rewards:', error);
      return '0';
    }
  }, [getTokenContract]);

  // Fetch balance on address or provider change
  useEffect(() => {
    fetchTokenBalance();
  }, [address, provider, fetchTokenBalance]);

  // Context value
  const contextValue: TokenContextType = {
    tokenBalance,
    stakedBalance,
    stakeTokens,
    unstakeTokens,
    transferTokens,
    governanceVote,
    fetchTokenBalance,
    calculateRewards,
  };

  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  );
};

// Custom hook to use token context
export const useTokenContext = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useTokenContext must be used within a TokenProvider');
  }
  return context;
};