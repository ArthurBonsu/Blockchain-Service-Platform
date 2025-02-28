import { FC ,useContext} from 'react';
import { useRouter } from 'next/router';
import { PaymentTransactions } from 'types';
import { Box, Button, Flex, Heading, List, ListItem, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from '@chakra-ui/react';
import { useLoadSafe } from 'hooks/useLoadSafe';
import { useTransactionStore } from 'stores/transactionStore';
import { useEthersStore } from 'stores/ethersStore';
import { useSafeStore } from 'stores/safeStore';
import { useState } from 'react';

interface ExecuteTransferProps {
  transaction: PaymentTransactions;
}

const ExecuteTransfer: FC<ExecuteTransferProps> = ({ transaction }) => {
  const router = useRouter();
  const { setTransaction } = useTransactionStore();
  const { address, provider, chainId } = useEthersStore();
  const { safeAddress, ownersAddress, contractAddress } = useSafeStore();
  const { executeSafeTransaction, updateTransactionStatus } = useLoadSafe({ safeAddress, userAddress: address });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  const handleExecute = async () => {
    setIsModalOpen(true);
  };
  const handleConfirm = async () => {
    await executeSafeTransaction(transaction);
    setTransaction(transaction);
    // Update the transaction details
    router.push('/TransferConfirmation');
    setIsApproved(true);
    handleUpdateStatus(); // Call handleUpdateStatus after approval
  };
  

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleReject = async () => {
    setIsRejected(true);
    // Update the transaction details
    handleUpdateStatus(); // Call handleUpdateStatus after rejection
  };

  const handleUpdateStatus = async () => {
    if (isApproved) {
      // Update the transaction status to "complete"
      await updateTransactionStatus(transaction, 'complete');
    } else if (isRejected) {
      // Update the transaction status to "rejected"
      await updateTransactionStatus(transaction, 'rejected');
    }
  };

  return (
    <Box>
      <Heading as="h1" size="lg" mb={4}>
        Execute Transfer
      </Heading>
      <Text mb={4}>
        Transaction Details:
      </Text>
      <List spacing={2}>
        <ListItem>
          <Text>
            <strong>Username:</strong> {transaction.username}
          </Text>
        </ListItem>
        <ListItem>
          <Text>
            <strong>Address:</strong> {transaction.address}
          </Text>
        </ListItem>
        <ListItem>
          <Text>
            <strong>Amount:</strong> {transaction.amount}
          </Text>
        </ListItem>
        <ListItem>
          <Text>
            <strong>Comment:</strong> {transaction.comment}
          </Text>
        </ListItem>
        <ListItem>
          <Text>
            <strong>Timestamp:</strong> {transaction.timestamp.toString()}
          </Text>
        </ListItem>
        <ListItem>
          <Text>
            <strong>Recipient:</strong> {transaction.receipient}
          </Text>
        </ListItem>
        <ListItem>
          <Text>
            <strong>USD Price:</strong> {transaction.USDprice}
          </Text>
        </ListItem>
        <ListItem>
          <Text>
            <strong>Payment Hash:</strong> {transaction.paymenthash}
          </Text>
        </ListItem>
        <ListItem>
          <Text>
            <strong>Owner Address:</strong> {transaction.owneraddress}
          </Text>
        </ListItem>
      </List>
      <Flex justify="space-between" mt={4}>
        <Button colorScheme="blue" onClick={() => router.push('/ProposeTransaction')}>
          Back to Propose Transaction
        </Button>
        <Button colorScheme="blue" onClick={() => router.push('/')}>
          Back to Homepage
        </Button>
        <Button colorScheme="blue" onClick={handleExecute}>
          Execute Transaction
        </Button>
      </Flex>
      {transaction && (
        <Box mt={4}>
          <Heading as="h2" size="md" mb={2}>
            Transaction Status
          </Heading>
          {isApproved ? (
            <Text>Transaction approved successfully.</Text>
          ) : isRejected ? (
            <Text>Transaction rejected.</Text>
          ) : (
            <Text>Transaction pending...</Text>
          )}
        </Box>
      )}
      <Modal isOpen={isModalOpen} onClose={handleCancel}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Execution</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to execute this transaction?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleReject}>
              Reject
            </Button>
            <Button colorScheme="blue" onClick={handleConfirm}>
              Approve
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ExecuteTransfer;