import create, { State } from 'zustand';
import { Web3Provider } from '@ethersproject/providers/lib';
import { SwapNewTokenTransaction } from 'types/ethers';
import { Signer } from 'ethers';

export interface WalletStore extends State {
  signer:  string | undefined;
  accounts: Array<String>;
  provider: Web3Provider | undefined;
  swaphash: SwapNewTokenTransaction['swaphash'];
  hasMetamask: boolean;
  isLoggedIn: boolean;
  address: string | null;
  setHasMetamask: (val: boolean) => void;
  setIsLoggedIn: (val: boolean) => void;
  setAddress: (val: string | null) => void;
  setSigner: (signer: Signer | null) => void;
  setProvider: (provider: Web3Provider | undefined) => void; // Update this line
  setAccounts: (accounts: Array<String>) => void;
  setSwapTransactionHash: (swaptransaction: SwapNewTokenTransaction['swaphash']) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  signer: null,
  accounts: [],
  provider: undefined,
  swaphash: '',
  hasMetamask: false,
  isLoggedIn: false,
  address: '',
  setHasMetamask: (hasMetamask) => set((state) => ({ ...state, hasMetamask })),
  setIsLoggedIn: (isLoggedIn) => set((state) => ({ ...state, isLoggedIn })),
  setAddress: (address) => set((state) => ({ ...state, address })),
  setSigner: (signer) => set((state) => ({ ...state, signer })),
  setProvider: (provider) => set((state) => ({ ...state, provider })),
  setAccounts: (accounts) => set((state) => ({ ...state, accounts })),
  setSwapTransactionHash: (swapHash) => set((state) => ({ ...state, swaphash: swapHash })),
}));
