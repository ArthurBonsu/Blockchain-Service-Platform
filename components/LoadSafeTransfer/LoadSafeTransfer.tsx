import { Button, ButtonProps, Flex, useDisclosure } from '@chakra-ui/react';
import AppModal from 'components/AppModal';
import { useSafeContext } from '../../contexts/useSafeContext';
import React, { useEffect, useState } from "react";

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

  // Use SafeContext methods
  const { 
    checkIfTxnExecutable, 
    approveTransfer, 
    rejectTransfer 
  } = useSafeContext();

  // Check transaction executability
  useEffect(() => {
    const getExecutables = async () => {
      try {
        if (safeTxHash && threshold) {
          const approvalTx = await checkIfTxnExecutable({
            safeAddress: safeTxHash,
            transaction: {} // You might need to pass the full transaction object
          });
          if (approvalTx) {
            setIsApprovalExecutable(true);
          }
        }
        
        if (safeRejectTxHash) {
          const rejectionTx = await checkIfTxnExecutable({
            safeAddress: safeRejectTxHash,
            transaction: {} // You might need to pass the full transaction object
          });
          if (rejectionTx) {
            setIsRejectionExecutable(true);
          }
        }
      } catch (error) {
        console.error('Error checking transaction executability:', error);
      }
    };
    
    getExecutables();
  }, [checkIfTxnExecutable, safeRejectTxHash, safeTxHash, threshold]);

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
              onClick={async () => {
                try {
                  setApproveExeIsLoading(true);
                  await approveTransfer({
                    safeAddress: safeTxHash,
                    transaction: {}, // You might need to pass the full transaction object
                    execTxn: true,
                    hashtxn: hashTxn || '',
                  });
                } catch (error) {
                  console.error('Error approving transfer:', error);
                } finally {
                  setApproveExeIsLoading(false);
                  localDisclosure.onClose();
                }
              }}
            >
              Execute Approval
            </Button>
          )}
          {isRejectionExecutable && (
            <Button
              isLoading={rejectExeIsLoading}
              isDisabled={rejectExeIsLoading}
              onClick={async () => {
                try {
                  setRejectExeIsLoading(true);
                  await rejectTransfer({
                    safeAddress: safeRejectTxHash,
                    transaction: {}, // You might need to pass the full transaction object
                    execTxn: true,
                    hashtxn: hashTxn || '',
                    nonce,
                  });
                } catch (error) {
                  console.error('Error rejecting transfer:', error);
                } finally {
                  setRejectExeIsLoading(false);
                  localDisclosure.onClose();
                }
              }}
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