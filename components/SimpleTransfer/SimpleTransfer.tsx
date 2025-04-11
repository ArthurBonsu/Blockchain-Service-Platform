import { FC, useState, useEffect } from 'react';
import { TransactionsCardProps } from 'types/ethers';
import { shortenAddress } from "../../constants/shortenAddress";
import useFetch from 'hooks/useFetch';
import { 
  Image, Stack, Box, Text, Heading, 
  Button, FormControl, FormLabel, Input, 
  FormErrorMessage, useToast
} from "@chakra-ui/react";
import React from 'react';
import useTransactionContext from 'contexts/useTransactionContext';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { PaymentTransactions } from 'types';

// Define the transaction type based on the usage in the code
interface Transaction {
  receipient?: string;
  address?: string;
  timestamp?: number | string;
  comment?: string;
  amount?: number | string;
}

interface SimpleTransferFormData {
  to: string;
  amount: string;
  message?: string;
  keyword?: string;
}

// TransactionsCard component to display transaction details
const TransactionsCard: FC<TransactionsCardProps> = ({ 
  addressTo, 
  addressFrom, 
  timestamp, 
  message, 
  keyword, 
  amount, 
  url 
}) => {
  const gifUrl = useFetch({ keyword });

  return (
    <Box 
      bg="gray.800"
      m={4}
      flex="1"
      borderRadius="md"
      p={3}
      _hover={{ boxShadow: "xl" }}
      minW={{ base: "full", sm: "270px", xl: "450px" }}
      maxW={{ sm: "300px", xl: "500px" }}
    >
      <Stack spacing={3}>
        <Stack spacing={2} w="full" mb={6} p={2}>
          <Box as="a" 
            href={`https://etherscan.io/address/${addressFrom}`} 
            target="_blank" 
            rel="noreferrer"
          >
            <Text color="white">From: {shortenAddress(addressFrom)}</Text>
          </Box>
          
          <Box as="a" 
            href={`https://etherscan.io/address/${addressTo}`} 
            target="_blank" 
            rel="noreferrer"
          >
            <Text color="white">To: {shortenAddress(addressTo)}</Text>
          </Box>
          
          <Text color="white">Amount: {amount} ETH</Text>
          
          {message && (
            <Text color="white" mt={2}>Message: {message}</Text>
          )}
        </Stack>
        
        <Image
          src={gifUrl || url}
          alt="transaction gif"
          rounded="md"
          shadow="lg"
          objectFit="cover"
          h="64"
          w="full"
        />
        
        <Box 
          bg="black" 
          p={3} 
          px={5} 
          w="max" 
          rounded="3xl" 
          mt="-5" 
          shadow="xl"
        >
          <Text color="cyan.400" fontWeight="bold">{timestamp}</Text>
        </Box>
      </Stack>
    </Box>
  );
};

// Main SimpleTransfer component
const SimpleTransfer: FC = () => {
  const [transactions, setTransactions] = useState<TransactionsCardProps[]>([]);
  const { sendSimpleTransfer, currentAccount, getTransactions } = useTransactionContext();
  const toast = useToast();
  const router = useRouter();
  
  // Form validation schema
  const schema = yup.object({
    to: yup.string().required('Recipient address is required'),
    amount: yup.string().required('Amount is required'),
    message: yup.string(),
    keyword: yup.string(),
  }).required();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SimpleTransferFormData>({
    resolver: yupResolver(schema),
  });
  
  // Load user's transactions on component mount
  useEffect(() => {
    const loadTransactions = async () => {
      if (currentAccount) {
        try {
          // Use getTransactions instead of getAllTransactions
          const txns = await getTransactions();
          
          // Now txns is an array, so we can directly map it
          const formattedTxns: TransactionsCardProps[] = txns.map((t, index) => ({
            addressTo: t.receipient,
            addressFrom: t.address,
            timestamp: t.timestamp instanceof Date ? t.timestamp.toLocaleString() : new Date(t.timestamp).toLocaleString(),
            message: t.comment || '', // Ensure message is always a string
            keyword: t.comment || '', // Ensure keyword is always a string
            amount: t.amount,
            key: index,
            url: 'https://example.com/some-default-url.jpg'
          }))
          
          
          setTransactions(formattedTxns);
        

        } catch (error) {
          console.error('Error loading transactions:', error);
          toast({
            title: 'Error',
            description: 'Failed to load transactions',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };
    
    loadTransactions();
  }, [currentAccount, getTransactions, toast]);
  
  // Handle form submission
  const handleTransferSubmit = async (data: SimpleTransferFormData) => {
    try {
      // Convert form data to transaction format
      const { to, amount, message, keyword } = data;
      
      // Prepare transaction data
      const transactionData: PaymentTransactions = {
        data: null,
        username: '', // Optional: you could pull this from user context if available
        address: currentAccount,
        amount: parseFloat(amount),
        comment: message || '',
        timestamp: new Date(),
        receipient: to,
        receipients: [to], // Adding to receipients array
        txhash: '', // This will be generated by the contract
        USDprice: 0, // Optional: you might want to fetch current ETH price
        paymenthash: '', // This will be generated by the contract
        owneraddress: currentAccount,
        status: 'pending' // Initial status
      };
      
      // Call transaction context's sendSimpleTransfer method
      const result = await sendSimpleTransfer(transactionData);
      
      if (result) {
        toast({
          title: 'Transaction sent',
          description: 'Your transaction has been sent successfully!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Reset form and refresh transactions
        reset();
        
        // Reload transactions after successful send
        try {
          const txns = await getTransactions();
          const formattedTxns: TransactionsCardProps[] = txns.map((t, index) => ({
            addressTo: t.receipient,
            addressFrom: t.address,
            timestamp: t.timestamp instanceof Date ? t.timestamp.toLocaleString() : new Date(t.timestamp).toLocaleString(),
            message: t.comment || '', // Ensure message is always a string
            keyword: t.comment || '', // Ensure keyword is always a string
            amount: t.amount,
            key: index,
            url: 'https://example.com/some-default-url.jpg'
          }))
          
          setTransactions(formattedTxns);
        } catch (error) {
          console.error('Error reloading transactions:', error);
        }
      }
    } catch (error) {
      console.error('Error sending transaction:', error);
      toast({
        title: 'Transaction failed',
        description: 'There was an error sending your transaction.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  return (
    <Box w="full" p={4}>
      <Stack spacing={8}>
        {/* Simple Transfer Form */}
        <Box maxW="md" mx="auto" mb={8} p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
          <Heading as="h2" size="lg" mb={4}>
            Simple Transfer
          </Heading>
          
          <form onSubmit={handleSubmit(handleTransferSubmit)}>
            <Stack spacing={4}>
              <FormControl isInvalid={!!errors.to}>
                <FormLabel>Recipient Address</FormLabel>
                <Input {...register('to')} placeholder="0x..." />
                {errors.to && (
                  <FormErrorMessage>{errors.to.message}</FormErrorMessage>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!errors.amount}>
                <FormLabel>Amount (ETH)</FormLabel>
                <Input {...register('amount')} placeholder="0.01" type="number" step="0.001" />
                {errors.amount && (
                  <FormErrorMessage>{errors.amount.message}</FormErrorMessage>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!errors.message}>
                <FormLabel>Message (optional)</FormLabel>
                <Input {...register('message')} placeholder="Enter a message" />
                {errors.message && (
                  <FormErrorMessage>{errors.message.message}</FormErrorMessage>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!errors.keyword}>
                <FormLabel>Keyword for GIF (optional)</FormLabel>
                <Input {...register('keyword')} placeholder="e.g., ethereum" />
                {errors.keyword && (
                  <FormErrorMessage>{errors.keyword.message}</FormErrorMessage>
                )}
              </FormControl>
              
              <Button
                colorScheme="blue"
                isLoading={isSubmitting}
                type="submit"
                w="full"
                mt={2}
              >
                Send ETH
              </Button>
              
              <Button
                variant="outline"
                colorScheme="blue"
                onClick={() => router.push('/PaymentTransfer')}
                w="full"
              >
                Payment Transfer
              </Button>
            </Stack>
          </form>
        </Box>
      
        {/* Transactions List */}
        <Box bg="gray.900" w="full" py={12} px={4}>
          <Stack spacing={4} maxW="container.xl" mx="auto">
            <Heading color="white" textAlign="center" mb={2}>
              Latest Transactions
            </Heading>
            
            <Box display="flex" flexWrap="wrap" justifyContent="center">
              {transactions.length > 0 ? (
                transactions.map((transactionData, i) => (
                  <TransactionsCard 
                    key={i} 
                    {...transactionData}
                  />
                ))
              ) : (
                <Text color="white" textAlign="center">
                  No transactions found. Make your first transfer!
                </Text>
              )}
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default SimpleTransfer;