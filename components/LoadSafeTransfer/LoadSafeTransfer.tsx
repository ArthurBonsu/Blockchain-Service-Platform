import { Button, ButtonProps, Flex, useDisclosure } from '@chakra-ui/react';
import AppModal from 'components/AppModal';
import { useSafeContext } from '../../contexts/useSafeContext';
import React, { useEffect, useState } from "react";
import { useSafeStore } from '../../stores/safeStore';

interface ExecuteTransferProps {
  colorScheme?: string;
  variant?: string;
  isDisabled?: boolean;
  safeTxHash: string;
  safeRejectTxHash: string | null;
  threshold: string | number | undefined;
  nonce: number;
  hashTxn?: string;
}

// Define a more complete transaction type that includes all the properties we need
interface ExtendedTransaction {
  data: any;
  username: string;
  address: string;
  amount: number;
  comment: string;
  timestamp: Date;
  receipient: string;
  receipients: string[];
  txhash: string;
  USDprice: number;
  paymenthash: string;
  owneraddress: string;
  status?: 'pending' | 'approved' | 'rejected' | 'complete';
  // Additional properties that are not in PaymentTransactions but needed for context functions
  safeAddress?: string;
  transaction?: any;
  execTxn?: boolean;
  hashtxn?: string;
  nonce?: number;
}

const LoadSafeTransfer: React.FC<ExecuteTransferProps> = ({
  safeTxHash,
  safeRejectTxHash,
  threshold,
  nonce,
  hashTxn,
  ...rest
}) => {
  const [approveExeIsLoading, setApproveExeIsLoading] = useState(false);
  const [rejectExeIsLoading, setRejectExeIsLoading] = useState(false);
  const [isApprovalExecutable, setIsApprovalExecutable] = useState(false);
  const [isRejectionExecutable, setIsRejectionExecutable] = useState(false);
  const localDisclosure = useDisclosure();

  // Get safeAddress from store
  const safeAddress = useSafeStore((state) => state.safeAddress);
  const ownersAddress = useSafeStore((state) => state.ownersAddress);

  // Use SafeContext methods
  const { 
    checkIfTxnExecutable, 
    approveTransfer, 
    rejectTransfer 
  } = useSafeContext();

  // Create a base transaction object with all required fields
  const createBaseTransaction = (txHash: string): ExtendedTransaction => ({
    data: null,
    username: Array.isArray(ownersAddress) ? ownersAddress[0] : '',
    address: safeAddress,
    amount: 0,
    comment: '',
    timestamp: new Date(),
    receipient: '',
    receipients: [],
    txhash: txHash,
    USDprice: 0,
    paymenthash: '',
    owneraddress: Array.isArray(ownersAddress) ? ownersAddress[0] : ''
  });

  // Check transaction executability
  useEffect(() => {
    const getExecutables = async () => {
      try {
        if (safeTxHash && threshold) {
          // We use our helper function and cast to PaymentTransactions to satisfy TypeScript
          const approvalTx = await checkIfTxnExecutable(createBaseTransaction(safeTxHash));
          if (approvalTx) {
            setIsApprovalExecutable(true);
          }
        }
        
        if (safeRejectTxHash) {
          // We use our helper function and cast to PaymentTransactions to satisfy TypeScript
          const rejectionTx = await checkIfTxnExecutable(createBaseTransaction(safeRejectTxHash));
          if (rejectionTx) {
            setIsRejectionExecutable(true);
          }
        }
      } catch (error) {
        console.error('Error checking transaction executability:', error);
      }
    };
    
    getExecutables();
  }, [checkIfTxnExecutable, safeRejectTxHash, safeTxHash, threshold, safeAddress, ownersAddress]);

  const handleApproveTransfer = async () => {
    try {
      setApproveExeIsLoading(true);
      
      // Create a standard transaction object
      const txData = createBaseTransaction(safeTxHash);
      
      // Call the function with the standard transaction object
      // The context function needs to handle the execTxn and hashtxn properties
      await approveTransfer(txData);
      
    } catch (error) {
      console.error('Error approving transfer:', error);
    } finally {
      setApproveExeIsLoading(false);
      localDisclosure.onClose();
    }
  };

  const handleRejectTransfer = async () => {
    try {
      setRejectExeIsLoading(true);
      
      // Create a standard transaction object
      const txData = createBaseTransaction(safeRejectTxHash || '');
      
      // Call the function with the standard transaction object
      // The context function needs to handle the execTxn, hashtxn, and nonce properties
      await rejectTransfer(txData);
      
    } catch (error) {
      console.error('Error rejecting transfer:', error);
    } finally {
      setRejectExeIsLoading(false);
      localDisclosure.onClose();
    }
  };

  return (
    <div>
      <Button {...rest} onClick={localDisclosure.onOpen}>
        Execute
      </Button>
      <AppModal
        disclosure={localDisclosure}
        title="Execute Transaction"
        modalSize="sm"
      >
        <Flex
          justify="space-between"
          py={6}
          alignItems="center"
          flexDirection="row"
        >
          {isApprovalExecutable && (
            <Button
              isLoading={approveExeIsLoading}
              isDisabled={approveExeIsLoading}
              onClick={handleApproveTransfer}
            >
              Execute Approval
            </Button>
          )}
          {isRejectionExecutable && (
            <Button
              isLoading={rejectExeIsLoading}
              isDisabled={rejectExeIsLoading}
              onClick={handleRejectTransfer}
            >
              Execute Rejection
            </Button>
          )}
        </Flex>
      </AppModal>
    </div>
  );
};

export default LoadSafeTransfer;