import { FC, useContext } from 'react';
import { useRouter } from 'next/router';
import { PaymentTransactions } from 'types';
import { Box, Button, Flex, Heading, List, ListItem, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from '@chakra-ui/react';
import { useSafeContext } from 'contexts/useSafeContext';
import { useTransactionStore } from 'stores/transactionStore';
import { useEthersStore } from 'stores/ethersStore';
import { useSafeStore } from 'stores/safeStore';
import { useState, useEffect } from 'react';

interface ExecuteTransferProps {
  transaction?: PaymentTransactions;
}

const ExecuteTransfer: FC<ExecuteTransferProps> = ({ transaction: propTransaction }) => {
  const router = useRouter();
  const { transaction: storeTransaction, setTransaction } = useTransactionStore();
  const { address } = useEthersStore();
  const { safeAddress } = useSafeStore();
  const { 
    executeSafeTransaction, 
    updateTransactionStatus,
    approveTransfer,
    rejectTransfer 
  } = useSafeContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  
  // Use transaction from props or from store
  const transaction = propTransaction || storeTransaction;

  useEffect(() => {
    // If no transaction in props or store, redirect to propose page
    if (!transaction) {
      router.push('/ProposeTransfer');
    }
  }, [transaction, router]);

  const handleExecute = async () => {
    setIsModalOpen(true);
  };
  
  const handleConfirm = async () => {
    if (!transaction) return;
    
    try {
      await executeSafeTransaction(transaction);
      setTransaction(transaction);
      setIsApproved(true);
      await updateTransactionStatus(transaction, 'complete');
      router.push('/TransferConfirmation');
    } catch (error) {
      console.error('Error executing transaction:', error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleReject = async () => {
    if (!transaction) return;
    
    try {
      setIsRejected(true);
      await updateTransactionStatus(transaction, 'rejected');
      router.push('/');
    } catch (error) {
      console.error('Error rejecting transaction:', error);
    }
  };

  if (!transaction) {
    return (
      <Box p={4}>
        <Heading as="h1" size="lg" mb={4}>
          No Transaction Found
        </Heading>
        <Text mb={4}>
          No transaction details available. Please propose a transaction first.
        </Text>
        <Button colorScheme="blue" onClick={() => router.push('/ProposeTransfer')}>
          Go to Propose Transaction
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4}>
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
        <ListItem>
          <Text>
            <strong>Status:</strong> {transaction.status || 'pending'}
          </Text>
        </ListItem>
      </List>
      <Flex justify="space-between" mt={4}>
        <Button colorScheme="blue" onClick={() => router.push('/ProposeTransfer')}>
          Back to Propose Transaction
        </Button>
        <Button colorScheme="blue" onClick={() => router.push('/')}>
          Back to Homepage
        </Button>
        <Button colorScheme="blue" onClick={handleExecute}>
          Execute Transaction
        </Button>
      </Flex>
      
      {(isApproved || isRejected) && (
        <Box mt={4} p={3} borderWidth="1px" borderRadius="md" bg={isApproved ? "green.50" : "red.50"}>
          <Heading as="h2" size="md" mb={2}>
            Transaction Status
          </Heading>
          {isApproved ? (
            <Text color="green.500">Transaction approved successfully.</Text>
          ) : (
            <Text color="red.500">Transaction rejected.</Text>
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