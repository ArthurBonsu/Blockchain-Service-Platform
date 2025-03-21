import React, { FC, useState, useEffect } from 'react';
import { 
  Text, Heading, Image, Stack, 
  Button, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, 
  ModalCloseButton, ModalBody, ModalFooter, Box, SimpleGrid,
  Badge
} from "@chakra-ui/react";
import { useRouter } from 'next/router';
import { shortenAddress } from "../../constants/shortenAddress";
import dummyData from "../../constants/dummyData";
import useTransactionContext from 'contexts/useTransactionContext';
import useFetch from 'hooks/useFetch';
import { PaymentTransactions } from 'types';
import ApproveTransfer from 'components/ApproveTransfer';
import RejectTransfer from 'components/RejectTransfer';
import { useEthersStore } from 'stores/ethersStore';
import { useSafeStore } from 'stores/safeStore';

// TransactionsCard Component
type TransactionsCardProps = {
  addressTo: string;
  addressFrom: string;
  timestamp: string;
  message: string;
  keyword: string;
  amount: number;
  url: string;
  status?: string;
  paymentHash?: string;
  onViewDetails?: (transaction: any) => void;
};

const TransactionsCard: React.FC<TransactionsCardProps> = ({ 
  addressTo, 
  addressFrom, 
  timestamp, 
  message, 
  keyword, 
  amount, 
  url,
  status,
  paymentHash,
  onViewDetails 
}) => {
  const gifUrl = useFetch({ keyword });

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails({
        addressTo, 
        addressFrom, 
        timestamp, 
        message, 
        keyword, 
        amount, 
        url,
        status,
        paymentHash
      });
    }
  };

  // Determine badge color based on status
  const getBadgeColor = () => {
    switch (status) {
      case 'complete':
        return 'green';
      case 'approved':
        return 'blue';
      case 'rejected':
        return 'red';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <Box 
      bg="gray.800"
      m={4}
      flex="1"
      borderRadius="md"
      p={3}
      _hover={{ boxShadow: "xl", transform: "translateY(-5px)" }}
      transition="all 0.3s"
      minW={{ base: "full", sm: "270px", xl: "450px" }}
      maxW={{ sm: "300px", xl: "500px" }}
    >
      <Stack spacing={3}>
        <Flex justify="space-between" align="center">
          <Heading size="md" color="white" noOfLines={1}>
            Transfer
          </Heading>
          {status && (
            <Badge colorScheme={getBadgeColor()} fontSize="0.8em" px={2} py={1} borderRadius="full">
              {status}
            </Badge>
          )}
        </Flex>
        
        <Stack spacing={2} w="full" p={2}>
          <Text color="white">
            <strong>From:</strong> {shortenAddress(addressFrom)}
          </Text>
          <Text color="white">
            <strong>To:</strong> {shortenAddress(addressTo)}
          </Text>
          <Text color="white">
            <strong>Amount:</strong> {amount} ETH
          </Text>
          {message && (
            <Text color="white">
              <strong>Message:</strong> {message}
            </Text>
          )}
          <Text color="white">
            <strong>Date:</strong> {timestamp}
          </Text>
          {paymentHash && (
            <Text color="white" noOfLines={1}>
              <strong>Hash:</strong> {shortenAddress(paymentHash)}
            </Text>
          )}
        </Stack>
        
        <Image
          src={gifUrl || url || "https://media.giphy.com/media/L1R1tvI9svkIWwpVYr/giphy.gif"}
          alt="transaction gif"
          rounded="md"
          shadow="lg"
          objectFit="cover"
          h="48"
          w="full"
        />
        
        <Button 
          colorScheme="blue" 
          onClick={handleViewDetails}
          size="sm"
          mt={2}
        >
          View Details
        </Button>
      </Stack>
    </Box>
  );
};

// Main Transaction Component
const Transaction: FC = () => {
  const router = useRouter();
  const { transactions, getTransactions, currentAccount } = useTransactionContext();
  const { address } = useEthersStore();
  const { safeAddress } = useSafeStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

  useEffect(() => {
    const loadTransactions = async () => {
      if (currentAccount) {
        const txns = await getTransactions();
        setAllTransactions([...dummyData, ...(txns || [])]);
      } else {
        setAllTransactions([...dummyData]);
      }
    };
    
    loadTransactions();
  }, [currentAccount, getTransactions]);

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };
  
  const formatTimestamp = (timestamp: string | number | Date) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return String(timestamp);
    }
  };

  return (
    <Box p={6}>
      <Stack spacing={8}>
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={2}>
            Transaction History
          </Heading>
          <Text fontSize="lg" color="gray.600">
            {currentAccount 
              ? 'View all your transactions on the blockchain'
              : 'Connect your account to see your transactions'}
          </Text>
        </Box>
        
        <SimpleGrid 
          columns={{ base: 1, md: 2, lg: 3 }} 
          spacing={6} 
          justifyItems="center"
        >
          {allTransactions.length > 0 ? (
            allTransactions.map((transaction, i) => {
              // Format transaction data for display
              const formattedTransaction = {
                addressTo: transaction.receipient || transaction.addressTo || '',
                addressFrom: transaction.address || transaction.addressFrom || '',
                timestamp: formatTimestamp(transaction.timestamp),
                message: transaction.comment || transaction.message || '',
                keyword: transaction.comment || transaction.message || 'ethereum',
                amount: parseFloat(transaction.amount.toString()),
                url: '',
                status: transaction.status || 'complete',
                paymentHash: transaction.paymenthash || transaction.txhash || '',
                onViewDetails: handleViewDetails
              };
              
              return <TransactionsCard key={i} {...formattedTransaction} />;
            })
          ) : (
            <Text gridColumn="span 3" textAlign="center" fontSize="lg" color="gray.500">
              No transactions found. Start by making a transfer!
            </Text>
          )}
        </SimpleGrid>
        
        <Flex justify="center" mt={4}>
          <Button 
            colorScheme="blue" 
            onClick={() => router.push('/SimpleTransfer')}
            mr={4}
          >
            Make Simple Transfer
          </Button>
          <Button 
            colorScheme="teal"
            onClick={() => router.push('/ProposeTransfer')}
          >
            Propose Multi-Sig Transfer
          </Button>
        </Flex>
      </Stack>

      {/* Transaction Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transaction Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTransaction && (
              <Stack spacing={4}>
                <Box p={4} borderWidth="1px" borderRadius="md">
                  <Text>
                    <strong>From:</strong> {selectedTransaction.addressFrom}
                  </Text>
                  <Text>
                    <strong>To:</strong> {selectedTransaction.addressTo}
                  </Text>
                  <Text>
                    <strong>Amount:</strong> {selectedTransaction.amount} ETH
                  </Text>
                  <Text>
                    <strong>Timestamp:</strong> {selectedTransaction.timestamp}
                  </Text>
                  {selectedTransaction.message && (
                    <Text>
                      <strong>Message:</strong> {selectedTransaction.message}
                    </Text>
                  )}
                  {selectedTransaction.paymentHash && (
                    <Text>
                      <strong>Payment Hash:</strong> {selectedTransaction.paymentHash}
                    </Text>
                  )}
                  <Text>
                    <strong>Status:</strong>{' '}
                    <Badge colorScheme={
                      selectedTransaction.status === 'complete' ? 'green' :
                      selectedTransaction.status === 'approved' ? 'blue' :
                      selectedTransaction.status === 'rejected' ? 'red' :
                      selectedTransaction.status === 'pending' ? 'yellow' : 'gray'
                    }>
                      {selectedTransaction.status || 'Unknown'}
                    </Badge>
                  </Text>
                </Box>
                
                {/* Approval/Rejection actions for pending transactions */}
                {selectedTransaction.status === 'pending' && (
                  <Flex mt={4} justify="space-between">
                    <ApproveTransfer 
                      transaction={selectedTransaction}
                      safeAddress={safeAddress}
                      userAddress={address}
                      onApprovalComplete={() => {
                        setIsModalOpen(false);
                        getTransactions();
                      }}
                    />
                    <RejectTransfer 
                      transaction={selectedTransaction}
                      safeAddress={safeAddress}
                      userAddress={address}
                      onRejectionComplete={() => {
                        setIsModalOpen(false);
                        getTransactions();
                      }}
                    />
                  </Flex>
                )}
              </Stack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="gray" 
              mr={3} 
              onClick={() => router.push('/')}
            >
              Back to Homepage
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Transaction;