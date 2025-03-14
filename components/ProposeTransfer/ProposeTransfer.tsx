import { FC, useState } from 'react';
import { useEthersStore } from 'stores/ethersStore';
import { useSafeStore } from 'stores/safeStore';
import { useLoadSafe, useSafeDetailsAndSetup } from '../../context/useLoadContext';
import { PaymentTransactions } from 'types';
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, FormControl, FormLabel, Input, NumberInput, NumberInputField, FormErrorMessage, Stack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useEthers } from 'hooks';
import { useRouter } from 'next/router';
import { useTransactionStore } from 'stores/transactionStore';
import React, { useEffect, useContext} from 'react'

const ProposeTransfer: FC = () => {
  const router = useRouter();
  const { onConnect, onDisconnect, isConnected, walletaddress } = useEthers();
  const { address } = useEthersStore();
  const { safeAddress, ownersAddress } = useSafeStore();
  const { proposeTransaction, approveTransfer, rejectTransfer } = useLoadSafe({ safeAddress: '0x...', userAddress: '0x...' });
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentTransactions>();
  const [isProposed, setIsProposed] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

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
      setTransaction(data);
      setPendingProposalData(data);
      await proposeTransaction(data);
      setIsProposed(true);
      router.push('/ExecuteTransfer');
    } catch (error) {
      console.error(error);
    } finally {
      setIsPendingProposal(false);
    }
  };

  const handleApprove = async () => {
    await approveTransfer(transaction);
    setIsApproved(true);
    router.push('/ExecuteTransfer');
  };

  const handleReject = async () => {
    await rejectTransfer(transaction);
    setIsApproved(false);
  };

  return (
    <div>
      {!isConnected ? (
        <Button onClick={onConnect}>Connect Wallet</Button>
      ) : (
        <Button onClick={onDisconnect}>Disconnect Wallet</Button>
      )}
      {address && ownersAddress.includes(address) && (
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
              <Input {...register('txhash', { required: 'Transaction Hash is required' })} />
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
            <Button type="submit">Propose Transaction</Button>
          </Stack>
        </form>
      )}
      {isPendingProposal && (
        <p>Proposal pending...</p>
      )}
      {isProposed && (
        <Modal isOpen={true} onClose={onDisconnect}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Transaction Proposed</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <p>Transaction has been proposed successfully.</p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={handleApprove}>Approve</Button>
              <Button onClick={handleReject}>Reject</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default ProposeTransfer;