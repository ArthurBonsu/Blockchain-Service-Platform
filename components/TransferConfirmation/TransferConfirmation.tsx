import { FC,useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { Button, Flex, Heading, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from '@chakra-ui/react';
import { useTransactionStore } from 'stores/transactionStore';
import { useEthersStore } from 'stores/ethersStore';
import { useSafeStore } from 'stores/safeStore';
import { useLoadSafe } from 'hooks/useLoadSafe';
import { PaymentTransactions } from 'types';

interface TransferConfirmationProps {
  transaction: PaymentTransactions;
}

const TransferConfirmation: FC<TransferConfirmationProps> = ({ transaction }) => {
  const router = useRouter();
  const { address, provider, chainId } = useEthersStore();
  const { safeAddress, ownersAddress, contractAddress } = useSafeStore();
  const { getSafeInfoUsed } = useLoadSafe({ safeAddress, userAddress: address });
   
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = async () => {
    setIsModalOpen(true);

    const transactionDetails = await getSafeInfoUsed();

    
    console.log(transactionDetails);
  };

  return (
    <Flex direction="column" align="center" justify="center" h="100vh">
      <Heading as="h1" size="lg" mb={4}>
        Transfer Confirmation
      </Heading>
      <Text mb={4}>Transaction has been executed successfully.</Text>
      <Button colorScheme="blue" onClick={() => router.push('/')}>
        Back to Homepage
      </Button>
      <Button colorScheme="blue" onClick={handleViewDetails}>
        View Transaction Details
      </Button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transaction Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              <strong>Transaction Hash:</strong> {transaction.txhash}
            </Text>
            <Text>
              <strong>Timestamp:</strong> {transaction.timestamp.toString()}
            </Text>
            <Text>
              <strong>Username:</strong> {transaction.username}
            </Text>
            <Text>
              <strong>Address:</strong> {transaction.address}
            </Text>
            <Text>
              <strong>Amount:</strong> {transaction.amount}
            </Text>
            <Text>
              <strong>Comment:</strong> {transaction.comment}
            </Text>
            <Text>
              <strong>Recipient:</strong> {transaction.receipient}
            </Text>
            <Text>
              <strong>USD Price:</strong> {transaction.USDprice}
            </Text>
            <Text>
              <strong>Payment Hash:</strong> {transaction.paymenthash}
            </Text>
            <Text>
              <strong>Owner Address:</strong> {transaction.owneraddress}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default TransferConfirmation;