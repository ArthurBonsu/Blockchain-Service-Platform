"use client";
import React, { FC, useEffect, useCallback, useState, Suspense } from 'react';
import { 
  Button, 
  ButtonProps, 
  useDisclosure, 
  useToast,
  Tooltip
} from '@chakra-ui/react';
import AppAlertDialog from '../../components/AppAlertDialog';
import { useSafeContext } from '../../contexts/useSafeContext';
import { useSwapContext } from 'contexts/useSwapContext';

interface SecuredSwapProps extends ButtonProps {
  safeTxHash: string | null;
  safeAddress: string;
  userAddress: string;
  isDisabled?: boolean;
  threshold: number;
  execTxn: boolean;
  nonce: number;
  hashTxn?: string;
  onRejectComplete?: () => void;
}

const SecuredSwap: FC<SecuredSwapProps> = ({
  safeTxHash,
  safeAddress,
  userAddress,
  threshold,
  execTxn,
  nonce,
  hashTxn,
  onRejectComplete,
  children = "Reject",
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const localDisclosure = useDisclosure();
  const toast = useToast();
  
  // Get the safe context functions
  const { 
    rejectTransfer, 
    checkIfWalletIsConnect,
    connectWallet 
  } = useSafeContext();
  
  // Use swap context to ensure wallet connection
  const { currentAccount } = useSwapContext();

  // Check wallet connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (!currentAccount) {
          await connectWallet();
        }
      } catch (err) {
        console.error("Failed to connect wallet:", err);
        setError("Wallet connection failed. Please connect manually.");
      }
    };

    checkConnection();
  }, [currentAccount, connectWallet]);

  const handleSubmit = useCallback(
    async () => {
      if (!safeTxHash) {
        toast({
          title: "Error",
          description: "Transaction hash is missing",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        await rejectTransfer({
          safeAddress,
          transaction: {
            // Populate with necessary transaction details
            // This might need adjustment based on your specific context implementation
            txhash: safeTxHash,
            nonce,
            hashtxn: hashTxn || ''
          },
          execTxn,
          nonce,
          hashtxn: hashTxn || ''
        });
        
        toast({
          title: "Transaction Rejected",
          description: "The transaction has been successfully rejected",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        if (onRejectComplete) {
          onRejectComplete();
        }
      } catch (err) {
        console.error("Error rejecting transfer:", err);
        setError("Failed to reject the transaction. Please try again.");
        
        toast({
          title: "Rejection Failed",
          description: "There was an error rejecting the transaction",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
        localDisclosure.onClose();
      }
    },
    [
      rejectTransfer, 
      safeAddress,
      safeTxHash, 
      execTxn, 
      nonce, 
      localDisclosure, 
      hashTxn, 
      toast, 
      onRejectComplete
    ]
  );

  const isButtonDisabled = rest.isDisabled || !safeTxHash || !currentAccount;
  
  return (
    <Suspense fallback={<Button isLoading {...rest}>Loading...</Button>}>
      <Tooltip 
        label={isButtonDisabled ? "Cannot reject: Missing transaction hash or wallet not connected" : "Reject this transaction"}
        isDisabled={!isButtonDisabled}
      >
        <span>
          <Button 
            onClick={localDisclosure.onOpen} 
            isDisabled={isButtonDisabled}
            colorScheme="red" 
            variant="outline"
            {...rest}
          >
            {children}
          </Button>
        </span>
      </Tooltip>
      
      <AppAlertDialog
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        header="Reject Transaction"
        body={
          <>
            This action will reject transaction #{nonce}. 
            A separate transaction will be performed to submit the rejection.
            {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
          </>
        }
        disclosure={localDisclosure}
        customOnClose={() => {
          localDisclosure.onClose();
          setIsLoading(false);
          setError(null);
        }}
      />
    </Suspense>
  );
};

export default SecuredSwap;