
// CrowdSource.tsx
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
import useLoadSafe from 'hooks/useLoadSafe';
import { PaymentTransactions } from 'types';

export interface CrowdsourceTransferProps {
  transaction: PaymentTransactions;
  safeAddress: string;
  userAddress: string;
}

export const CrowdSource: React.FC<CrowdsourceTransferProps> = ({
  transaction,
  safeAddress,
  userAddress,
  ...rest
}) => {
  const router = useRouter();
  const disclosure = useDisclosure();
  const [isBrowser, setIsBrowser] = useState(false);
  const [approveExeIsLoading, setApproveExeIsLoading] = useState(false);
  const [rejectExeIsLoading, setRejectExeIsLoading] = useState(false);
  const [isApprovalExecutable, setIsApprovalExecutable] = useState(false);
  const [isRejectionExecutable, setIsRejectionExecutable] = useState(false);

  const {
    proposeTransaction,
    approveTransfer,
    rejectTransfer,
    checkIfTxnExecutable,
    isLoading,
    safe,
    checkIsSigned,
  } = useLoadSafe({
    safeAddress,
    userAddress,
  });

  const isTxnExecutable = useCallback(
    async (transaction: PaymentTransactions) => {
      try {
        const approvalTx = await checkIfTxnExecutable(transaction);
        return approvalTx;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [checkIfTxnExecutable]
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsBrowser(true);
    }
  }, []);

  useEffect(() => {
    const getExecutables = async () => {
      if (transaction) {
        const approvalTx = await isTxnExecutable(transaction);
        if (approvalTx) {
          setIsApprovalExecutable(true);
        }
      }
    };
    getExecutables();
  }, [transaction, isTxnExecutable]);

  const approveTransfers = async (transaction: PaymentTransactions) => {
    setApproveExeIsLoading(true);
    await approveTransfer(transaction);
    setApproveExeIsLoading(false);
  };

  const rejectTransfers = async (transaction: PaymentTransactions) => {
    setRejectExeIsLoading(true);
    await rejectTransfer(transaction);
    setRejectExeIsLoading(false);
  };

  if (!isBrowser) return null;

  return (
    <div>
      <Button {...rest} onClick={disclosure.onOpen}>
        Execute
      </Button>
      <AppModal
        disclosure={disclosure}
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
                await approveTransfers(transaction);
                disclosure.onClose();
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
                await rejectTransfers(transaction);
                disclosure.onClose();
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

export default CrowdSource;