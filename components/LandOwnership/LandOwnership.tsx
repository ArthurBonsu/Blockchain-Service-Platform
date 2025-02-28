
// LandOwnership.tsx
import {
  Button,
  ButtonProps,
  Flex,
  useDisclosure,
} from '@chakra-ui/react';
import {
  useEffect,
  useState,
  useCallback,
  useContext,
} from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import AppModal from '../AppModal/AppModal';
import useLandOwnershipContext from 'context/useLandOwnership';
import useLoadSafe from 'hooks/useLoadSafe';
import useTransactions from 'hooks/useTokenTransactions';
import useSafeDetailsAndSetup from 'hooks/useSafeDetails.ts';

export interface LandOwnershipProps {
  landId: number;
  landOwner: string;
  landLocation: string;
  landSize: number;
  landPrice: number;
}


// Maintaining stores state  here for every page 
  const chainId = useEthersStore((state) => state.chainId);
  const walletaddress = useEthersStore((state) => state.setAddress);
  const safeAddress = useSafeStore((state) => state.safeAddress);
  const ownersAddress = useSafeStore((state) => state.ownersAddress);
  const contractAddress = useSafeStore((state) => state.contractAddress);
  const isPendingSafeCreation = useSafeStore((state) => state.isPendingSafeCreation);
  const pendingSafeData = useSafeStore((state) => state.pendingSafeData);
  const isPendingAddOwner = useSafeStore((state) => state.isPendingAddOwner);
  const pendingAddOwnerData = useSafeStore((state) => state.pendingAddOwnerData);
  const transaction = useTransactionStore((state) => state.transaction);
  const txhash = useTransactionStore((state) => state.txhash);
  const txdata = useTransactionStore((state) => state.txdata);
  const txamount = useTransactionStore((state) => state.txamount);
  const txname = useTransactionStore((state) => state.txname);
  const  isPendingProposal = useTransactionStore((state) => state.isPendingProposal);
  const pendingProposalData = useTransactionStore((state) => state.pendingProposalData);  
  

export const LandOwnership: React.FC<LandOwnershipProps> = ({
  landId,
  landOwner,
  landLocation,
  landSize,
  landPrice,
  ...rest
}) => {
  const router = useRouter();
  const disclosure = useDisclosure();
  const { data: session } = useSession();
  const { isLoading, safe, checkIsSigned, executeSafeTransaction } =
    useLoadSafe({
      safeAddress: '0x...',
      userAddress: session?.user?.address,
    });
  const { sendTransaction, handleChange, formData } = useLandOwnershipContext();
  const {
    setUpMultiSigSafeAddress,
    addAddressToSafe,
    getSafeInfo,
    executeTransaction,
    getAllTransactions,
    isTxnExecutable,
    proposeTransaction,
    approveTransfer,
    rejectTransfer,
  } = useSafeDetailsAndSetup;

  const [isLandOwner, setIsLandOwner] = useState(false);
  const [isLandAvailable, setIsLandAvailable] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  useEffect(() => {
    if (landOwner === '0x...') {
      setIsLandOwner(true);
    }
    if (landPrice > 0) {
      setIsLandAvailable(true);
    }
  }, [landOwner, landPrice]);

  const registerLand = async () => {
    try {
      const landId = await setUpMultiSigSafeAddress('0x...');
      console.log(`Land registered with ID: ${landId}`);
    } catch (error) {
      console.error('Error registering land:', error);
    }
  };

  const buyLand = async () => {
    try {
      const transaction = await executeSafeTransaction({
        landId,
        landOwner,
        landLocation,
        landSize,
        landPrice,
      });
      setTransactionHash(transaction.txhash);
      console.log(`Land purchased with transaction hash: ${transactionHash}`);
    } catch (error) {
      console.error('Error buying land:', error);
    }
  };

  const transferLand = async () => {
    try {
      const newOwner = '0x...';
      await addAddressToSafe(landId, newOwner);
      console.log(`Land transferred to new owner: ${newOwner}`);
    } catch (error) {
      console.error('Error transferring land:', error);
    }
  };

  const updateLandPrice = async () => {
    try {
      const newPrice = 100;
      await executeTransaction({
        landId,
        landOwner,
        landLocation,
        landSize,
        landPrice: newPrice,
      });
      console.log(`Land price updated to: ${newPrice}`);
    } catch (error) {
      console.error('Error updating land price:', error);
    }
  };

  return (
    <div>
      <Button {...rest} onClick={disclosure.onOpen}>
        View Land Details
      </Button>
      <AppModal disclosure={disclosure} title="Land Details" modalSize="sm">
        <Flex justify="space-between" py={6} alignItems="center" flexDirection="row">
          {isLandOwner && (
            <Button
              isLoading={false}
              isDisabled={false}
              onClick={async () => {
                await transferLand();
                disclosure.onClose();
              }}
            >
              Transfer Land
            </Button>
          )}
          {isLandAvailable && (
            <Button
              isLoading={false}
              isDisabled={false}
              onClick={async () => {
                await buyLand();
                disclosure.onClose();
              }}
            >
              Buy Land
            </Button>
          )}
          <Button
            isLoading={false}
            isDisabled={false}
            onClick={async () => {
              await updateLandPrice();
              disclosure.onClose();
            }}
          >
            Update Land Price
          </Button>
         <Button
          isLoading={false}
          isDisabled={false}
          onClick={async () => {
            await registerLand();
            disclosure.onClose();
          }}
        >
          Register Land
        </Button>
        <Button
          isLoading={false}
          isDisabled={false}
          onClick={async () => {
            await sendTransaction();
            disclosure.onClose();
          }}
        >
          Send Transaction
        </Button>
      </Flex>
      <Flex justify="space-between" py={6} alignItems="center" flexDirection="row">
        <input
          type="text"
          value={formData.landAddress}
          onChange={(e) => handleChange(e, 'landAddress')}
          placeholder="Land Address"
        />
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => handleChange(e, 'amount')}
          placeholder="Amount"
        />
        <input
          type="text"
          value={formData.message}
          onChange={(e) => handleChange(e, 'message')}
          placeholder="Message"
        />
      </Flex>
    </AppModal>
  </div>
  
  );
  };
  
  export default LandOwnership;