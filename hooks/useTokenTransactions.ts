// hooks/useTransactions.ts
import { useCallback, useState, useEffect } from 'react';
import Web3 from 'web3';
import useEthers from 'hooks/useEthers';
import { useEthersStore } from 'stores/ethersStore';
import { SwapTokenTransaction } from 'types/ethers';
import { TokenDepositvalue, TokenType, TokenTypesDetails, SwapTransactionType } from 'types/index';
import { useSafeStore } from 'stores/safeStore';
import useLoadSafe from 'hooks/useLoadSafe';
import { BigNumber } from 'ethers'; // Import BigNumber from ethers

// Import useLoadSafe
const TokenSwapcontractABI: any[] = []; // Define ABI placeholder
const TokenSwapcontractAddress = ""; // Initialize Web3 provider
let web3: Web3 | null = null;

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  web3 = new Web3(window.ethereum);
}

async function requestAccount() {
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  } catch (error) {
    console.error('Error requesting account access:', error);
  }
}

async function getSigner() {
  if (!web3) return null;
  if (!window.ethereum.selectedAddress) {
    await requestAccount();
  }
  return web3.eth.getAccounts();
}

interface useTransactionProps {
  nonce: number;
  amount: number;
  tokenname: string;
  symbol: string;
  logoUri: string;
}

// useTransactions is for token sending
const useTokenTransactions = async ({ nonce, amount, tokenname, symbol, logoUri }: SwapTransactionType) => {
 
  const [tokentxhash, settokentxhash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const address = useEthersStore((state) => state.address);
  const setAddress = useEthersStore((state) => state.setAddress);
  const setEtherStore = useEthersStore((state) => state.setEtherStore);
  const { onConnect, onDisconnect } = useEthers();

  // Use useLoadSafe instead of useSafeSdk
  const { approveTransfer, rejectTransfer, isLoading: safeLoading, } = useLoadSafe({ safeAddress: TokenSwapcontractAddress, userAddress: address });

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await onConnect();
      if (!web3) return;
      const accounts = await getSigner();
      if (accounts && accounts.length > 0) {
        const userAddress = accounts[0];
        setAddress(userAddress);
        // Update ABI type
        // functions under Swap Contract
        const SwapContract = new web3.eth.Contract(TokenSwapcontractABI as any, TokenSwapcontractAddress);
        const swapTXA = {}
        const depositAmount = BigNumber.from(amount); // Update this line
        try {
          const swapTx = await SwapContract.methods.swapTKA(depositAmount).send({ from: userAddress });
          const txData = swapTx.transactionHash;
          const swapTransaction: SwapTokenTransaction = {
            amount,
            tokentxhash: txData,
            tokenname,
            symbol,
            signer: userAddress,
            txdata: swapTx.logs[0].data,
            logoUri,
          };
          settokentxhash(txData);
          setIsLoading(false);
          return {
            amount,
            tokentxhash: txData,
            tokenname,
            symbol,
            signer: userAddress,
            txdata: swapTx.logs[0].data,
            logoUri,
            swapTransaction,
          };
        } catch (error) {
          console.error('Error during transaction:', error);
          setIsLoading(false);
        }
      } else {
        console.error('No accounts found');
        setIsLoading(false);
      }
    };
    init();
  }, [
    amount,
    tokenname,
    symbol,
    logoUri,
    onConnect,
    setAddress,
    TokenSwapcontractAddress,
    address,
  ]);

  return {
    amount,
    tokentxhash,
    tokenname,
    symbol,
    signer: address,
    txdata: '',
    logoUri,
  };
};

export default useTokenTransactions;