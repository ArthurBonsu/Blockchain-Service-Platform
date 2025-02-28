import { Button, ButtonProps, Flex, useDisclosure } from '@chakra-ui/react';
import AppModal from '@components/AppModal';

import useLoadSafe from '../../hooks/useLoadSafe';
import React, { useEffect, useState , useContext} from "react";
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
  const { checkIfTxnExecutable, approveTransfer, rejectTransfer } = useLoadSafe({
    safeAddress: safeTxHash,
    userAddress: '', // You might need to pass the user address here
  });
      // You might need to pass the user address here 
  useEffect(() => {
    const getExecutables = async () => {
      if (safeTxHash && threshold) {
        const approvalTx = await checkIfTxnExecutable(safeTxHash);
        if (approvalTx) {
          setIsApprovalExecutable(true);
        }
      }
      if (safeRejectTxHash) {
        const rejectionTx = await checkIfTxnExecutable(safeRejectTxHash);
        if (rejectionTx) {
          setIsRejectionExecutable(true);
        }
      }
    };
    getExecutables();
  }, [checkIfTxnExecutable, safeRejectTxHash, safeTxHash, threshold]);
 // safeTxHash, safeRejectTxHash, threshold , nonce
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
                setApproveExeIsLoading(true);
                await approveTransfer({
                  safeTxHash,
                  execTxn: true,
                  hashTxn: hashTxn || '',
                });
                setApproveExeIsLoading(false);
                localDisclosure.onClose();
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
                setRejectExeIsLoading(true);
                await rejectTransfer({
                  safeTxHash: safeRejectTxHash,
                  execTxn: true,
                  hashTxn: hashTxn || '',
                  nonce,
                });
                setRejectExeIsLoading(false);
                localDisclosure.onClose();
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