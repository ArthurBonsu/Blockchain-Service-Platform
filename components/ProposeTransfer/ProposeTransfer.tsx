import { FC, useState, useEffect, useContext } from 'react';
import { useEthersStore } from 'stores/ethersStore';
import { useSafeStore } from 'stores/safeStore';
import { useSafeContext } from 'contexts/useSafeContext';
import { PaymentTransactions } from 'types';
import { 
  Button, Modal, ModalBody, ModalCloseButton, ModalContent, 
  ModalFooter, ModalHeader, ModalOverlay, FormControl, 
  FormLabel, Input, NumberInput, NumberInputField, FormErrorMessage, 
  Stack, Box, Heading, Text, useToast
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import useEthers from 'hooks/useEthers';
import { useRouter } from 'next/router';
import { useTransactionStore } from 'stores/transactionStore';
import ApproveTransfer from 'components/ApproveTransfer';
import RejectTransfer from 'components/RejectTransfer';

const ProposeTransfer: FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { onConnect, onDisconnect, isConnected } = useEthers();
  const { address } = useEthersStore();
  const { safeAddress, ownersAddress } = useSafeStore();
  const { proposeTransaction } = useSafeContext();
  
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentTransactions>();
  
  const [isProposed, setIsProposed] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  const {
    transaction,
    isPendingProposal,
    pendingProposalData,
    setTransaction,
    setIsPendingProposal,
    setPendingProposalData,
  } = useTransactionStore();

  const handlePropose = async (data: PaymentTransactions) => {
    setIsPendingProposal(true);
    try {
      // Add timestamp if it's a string (from form)
      if (typeof data.timestamp === 'string') {
        data.timestamp = new Date(data.timestamp);
      }
      
      // Convert receipients string to array if needed
      if (typeof data.receipients === 'string') {
        data.receipients = (data.receipients as unknown as string).split(',').map(r => r.trim());
      }
      
      // Set initial status
      const transactionWithStatus: PaymentTransactions = {
        ...data,
        status: 'pending'
      };
      
      // Save to store
      setTransaction(transactionWithStatus);
      setPendingProposalData(transactionWithStatus);
      
      // Send to blockchain/backend
      await proposeTransaction(transactionWithStatus);
      
      setIsProposed(true);
      
      toast({
        title: "Transaction proposed",
        description: "Your transaction has been successfully proposed.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to propose transaction. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsPendingProposal(false);
    }
  };

  const handleApprovalComplete = () => {
    setIsApproved(true);
    setIsProposed(false);
    router.push('/ExecuteTransfer');
  };

  const handleRejectionComplete = () => {
    setIsRejected(true);
    setIsProposed(false);
    router.push('/');
  };

  const handleCloseModal = () => {
    setIsProposed(false);
  };

  return (
    <Box p={4}>
      <Heading as="h1" size="lg" mb={4}>Propose New Transfer</Heading>
      
      {!isConnected ? (
        <Box mb={4}>
          <Text mb={4}>Please connect your wallet to propose a transaction.</Text>
          <Button colorScheme="blue" onClick={onConnect}>Connect Wallet</Button>
        </Box>
      ) : (
        <>
          {!address || !ownersAddress.includes(address) ? (
            <Box>
              <Text mb={4}>Only safe owners can propose transactions.</Text>
              <Button colorScheme="blue" onClick={onDisconnect}>Disconnect Wallet</Button>
            </Box>
          ) : (
            <>
              <Text mb={4}>Fill out the form below to propose a new transaction:</Text>
              <form onSubmit={handleSubmit(handlePropose)}>
                <Stack spacing={4}>
                  <FormControl isInvalid={!!errors.username}>
                    <FormLabel>Username:</FormLabel>
                    <Input {...register('username', { required: 'Username is required' })} />
                    {errors.username && (
                      <FormErrorMessage>{errors.username.message}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <FormControl isInvalid={!!errors.address}>
                    <FormLabel>Address:</FormLabel>
                    <Input {...register('address', { required: 'Address is required' })} />
                    {errors.address && (
                      <FormErrorMessage>{errors.address.message}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <FormControl isInvalid={!!errors.amount}>
                    <FormLabel>Amount:</FormLabel>
                    <NumberInput>
                      <NumberInputField {...register('amount', { required: 'Amount is required' })} />
                    </NumberInput>
                    {errors.amount && (
                      <FormErrorMessage>{errors.amount.message}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Comment:</FormLabel>
                    <Input {...register('comment')} />
                    {errors.comment && (
                      <FormErrorMessage>{errors.comment.message}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <FormControl isInvalid={!!errors.timestamp}>
                    <FormLabel>Timestamp:</FormLabel>
                    <Input type="date" {...register('timestamp', { required: 'Timestamp is required' })} />
                    {errors.timestamp && (
                      <FormErrorMessage>{errors.timestamp.message}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <FormControl isInvalid={!!errors.receipient}>
                    <FormLabel>Recipient:</FormLabel>
                    <Input {...register('receipient', { required: 'Recipient is required' })} />
                    {errors.receipient && (
                      <FormErrorMessage>{errors.receipient.message}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Recipients (comma-separated):</FormLabel>
                    <Input {...register('receipients')} />
                    {errors.receipients && (
                      <FormErrorMessage>{errors.receipients.message}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <FormControl isInvalid={!!errors.txhash}>
                    <FormLabel>Transaction Hash:</FormLabel>
                    <Input {...register('txhash')} />
                    {errors.txhash && (
                      <FormErrorMessage>{errors.txhash.message}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <FormControl isInvalid={!!errors.USDprice}>
                    <FormLabel>USD Price:</FormLabel>
                    <NumberInput>
                      <NumberInputField {...register('USDprice', { required: 'USD Price is required' })} />
                    </NumberInput>
                    {errors.USDprice && (
                      <FormErrorMessage>{errors.USDprice.message}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <FormControl isInvalid={!!errors.paymenthash}>
                    <FormLabel>Payment Hash:</FormLabel>
                    <Input {...register('paymenthash', { required: 'Payment Hash is required' })} />
                    {errors.paymenthash && (
                      <FormErrorMessage>{errors.paymenthash.message}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <FormControl isInvalid={!!errors.owneraddress}>
                    <FormLabel>Owner Address:</FormLabel>
                    <Input {...register('owneraddress', { required: 'Owner Address is required' })} />
                    {errors.owneraddress && (
                      <FormErrorMessage>{errors.owneraddress.message}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <Button 
                    type="submit" 
                    colorScheme="blue" 
                    isLoading={isPendingProposal}
                    loadingText="Proposing..."
                  >
                    Propose Transaction
                  </Button>
                </Stack>
              </form>
            </>
          )}
        </>
      )}
      
      {isPendingProposal && (
        <Box mt={4} p={3} borderWidth="1px" borderRadius="md" bg="blue.50">
          <Text>Proposal pending... Please wait.</Text>
        </Box>
      )}
      
      {isProposed && pendingProposalData && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Transaction Proposed</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text mb={4}>Transaction has been proposed successfully.</Text>
              <Text>Would you like to approve this transaction now?</Text>
            </ModalBody>
            <ModalFooter>
              <RejectTransfer 
                transaction={pendingProposalData} 
                safeAddress={safeAddress} 
                userAddress={address}
                onRejectionComplete={handleRejectionComplete}
                mr={3}
              />
              <ApproveTransfer 
                transaction={pendingProposalData} 
                safeAddress={safeAddress} 
                userAddress={address}
                onApprovalComplete={handleApprovalComplete}
              />
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default ProposeTransfer;