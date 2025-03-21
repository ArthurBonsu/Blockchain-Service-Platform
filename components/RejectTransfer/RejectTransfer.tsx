import { Button, ButtonProps, useDisclosure } from '@chakra-ui/react';
import AppAlertDialog from '../../components/AppAlertDialog';
import { useSafeContext } from '../../contexts/useSafeContext';
import React, { FC, useCallback, useState } from 'react';
import { PaymentTransactions } from "types";
import { useTransactionStore } from 'stores/transactionStore';

interface RejectTransferProps extends ButtonProps {
  transaction: PaymentTransactions;
  safeAddress: string;
  userAddress: string;
  onRejectionComplete?: () => void;
}

const RejectTransfer: FC<RejectTransferProps> = ({
  transaction,
  safeAddress,
  userAddress,
  onRejectionComplete,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const localDisclosure = useDisclosure();
  
  // Use SafeContext methods
  const { 
    rejectTransfer, 
    updateTransactionStatus 
  } = useSafeContext();

  const { setTransaction } = useTransactionStore();

  const handleSubmit = useCallback(async () => {
    if (!transaction) return;
    
    setIsLoading(true);
    try {
      // Call reject transfer method from SafeContext
      await rejectTransfer({
        safeAddress,
        transaction,
        // Add any additional parameters required by the context method
        userAddress
      });
      
      // Update transaction status
      const updatedTransaction = {
        ...transaction,
        status: 'rejected'
      };
      
      // Update in global store
      setTransaction(updatedTransaction);
      
      // Update status in backend/blockchain
      await updateTransactionStatus(transaction, 'rejected');
      
      // If callback provided, call it
      if (onRejectionComplete) {
        onRejectionComplete();
      }
    } catch (error) {
      console.error('Error rejecting transfer:', error);
    } finally {
      setIsLoading(false);
      localDisclosure.onClose();
    }
  }, [
    transaction, 
    safeAddress, 
    userAddress, 
    rejectTransfer, 
    updateTransactionStatus, 
    setTransaction, 
    onRejectionComplete, 
    localDisclosure
  ]);

  return (
    <>
      <Button 
        colorScheme="red" 
        onClick={localDisclosure.onOpen} 
        isDisabled={transaction.status === 'rejected' || transaction.status === 'complete'}
        {...props}
      >
        {transaction.status === 'rejected' ? 'Rejected' : 'Reject'}
      </Button>
      <AppAlertDialog
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        header="Reject Transaction"
        body="This action will reject this transaction. A separate transaction will be performed to submit the rejection."
        disclosure={localDisclosure}
        customOnClose={() => {
          localDisclosure.onClose();
          setIsLoading(false);
        }}
      />
    </>
  );
};

export default RejectTransfer;