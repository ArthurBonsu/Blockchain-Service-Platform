import { Button, ButtonProps, useDisclosure } from '@chakra-ui/react';
import AppAlertDialog from '../../components/AppAlertDialog';
import { useSafeContext } from '../../contexts/useSafeContext';
import React, { FC, useCallback, useState } from 'react';
import { PaymentTransactions } from "types";
import { useTransactionStore } from 'stores/transactionStore';

interface ApproveTransferProps extends ButtonProps {
  transaction: PaymentTransactions;
  safeAddress: string;
  userAddress: string;
  onApprovalComplete?: () => void;
}

const ApproveTransfer: FC<ApproveTransferProps> = ({
  transaction,
  safeAddress,
  userAddress,
  onApprovalComplete,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const localDisclosure = useDisclosure();
  
  // Use SafeContext methods
  const { 
    approveTransfer, 
    updateTransactionStatus 
  } = useSafeContext();

  const { setTransaction } = useTransactionStore();

  const handleSubmit = useCallback(
    async () => {
      if (!transaction) return;
      
      setIsLoading(true);
      try {
        // Call approve transfer method from SafeContext
        await approveTransfer(transaction);
        
        // Update transaction status - ensure it matches the type definition
        const updatedTransaction: PaymentTransactions = {
          ...transaction,
          status: 'approved'
        };
        
        // Update in global store
        setTransaction(updatedTransaction);
        
        // Update status in backend/blockchain
        await updateTransactionStatus(transaction, 'approved');
        
        // If callback provided, call it
        if (onApprovalComplete) {
          onApprovalComplete();
        }
      } catch (error) {
        console.error('Error approving transfer:', error);
      } finally {
        setIsLoading(false);
        localDisclosure.onClose();
      }
    },
    [
      transaction, 
      safeAddress, 
      userAddress, 
      approveTransfer, 
      updateTransactionStatus, 
      setTransaction, 
      onApprovalComplete, 
      localDisclosure
    ]
  );

  return (
    <>
      <Button 
        colorScheme="blue"
        onClick={localDisclosure.onOpen}
        isDisabled={transaction.status === 'approved' || transaction.status === 'complete'}
        {...props}
      >
        {transaction.status === 'approved' ? 'Approved' : 'Approve'}
      </Button>
      <AppAlertDialog
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        header="Approve Transaction"
        body="This action will approve this transaction. A separate transaction will be performed to submit the approval."
        disclosure={localDisclosure}
        customOnClose={() => {
          localDisclosure.onClose();
          setIsLoading(false);
        }}
      />
    </>
  );
};

export default ApproveTransfer;