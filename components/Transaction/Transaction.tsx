import React, { FC, useState, useEffect } from 'react';
import { 
  InputGroup, Text, Input, InputRightAddon, Heading, Image, Stack, 
  Button, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, 
  ModalCloseButton, ModalBody, ModalFooter 
} from "@chakra-ui/react";
import { useRouter } from 'next/router';
import { shortenAddress } from "../../constants/shortenAddress";
import dummyData from "../../constants/dummyData";

// Stores
import { useSwapStore } from 'stores/ContextStores/walletStore';
import { useEthersStore } from 'stores/ethersStore';
import { useSafeStore } from 'stores/safeStore';
import { useTransactionStore } from 'stores/transactionStore';
import { useUserStore } from 'stores/userStore';

// Hooks
import useEthers from 'hooks/useEthers';
import useFetch from 'hooks/useFetch';
import { useLoadSafe } from 'hooks/useLoadSafe';

// Contexts
import useTransferContext from 'context/usegetAllTransactionsContext';
import { PaymentTransactions } from 'types';

// TransactionsCard Component
type TransactionsCardProps = {
  addressTo: string;
  addressFrom: string;
  timestamp: string;
  message: string;
  keyword: string;
  amount: number;
  url: string;
  onViewDetails?: (transaction: TransactionsCardProps) => void;
};

const TransactionsCard: React.FC<TransactionsCardProps> = ({ 
  addressTo, 
  addressFrom, 
  timestamp, 
  message, 
  keyword, 
  amount, 
  url,
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
        url
      });
    }
  };

  return (
    <div className="bg-[#181918] m-4 flex flex-1
      2xl:min-w-[450px]
      2xl:max-w-[500px]
      sm:min-w-[270px]
      sm:max-w-[300px]
      min-w-full
      flex-col p-3 rounded-md hover:shadow-2xl"
    >
      <div className="flex flex-col items-center w-full mt-3">
        <div className="display-flex justify-start w-full mb-6 p-2">
          <a href={`https://ropsten.etherscan.io/address/${addressFrom}`} target="_blank" rel="noreferrer">
            <p className="text-white text-base">From: {shortenAddress(addressFrom)}</p>
          </a>
          <a href={`https://ropsten.etherscan.io/address/${addressTo}`} target="_blank" rel="noreferrer">
            <p className="text-white text-base">To: {shortenAddress(addressTo)}</p>
          </a>
          <p className="text-white text-base">Amount: {amount} ETH</p>
          {message && (
            <>
              <br />
              <p className="text-white text-base">Message: {message}</p>
            </>
          )}
        </div>
        <Image
          src={gifUrl || url}
          alt="nature"
          className="w-full h-64 2xl:h-96 rounded-md shadow-lg object-cover"
        />
        <div className="bg-black p-3 px-5 w-max rounded-3xl -mt-5 shadow-2xl">
          <p className="text-[#37c7da] font-bold">{timestamp}</p>
        </div>
        <Button 
          colorScheme="blue" 
          mt={2} 
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

// Main Transaction Component
const Transaction: FC = () => {
  const router = useRouter();
  const { transactions, currentAccount } = useTransferContext();
  const { getSafeInfoUsed } = useLoadSafe();
   
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionsCardProps | null>(null);

  const handleViewDetails = (transaction: TransactionsCardProps) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  return (
    <Stack spacing={6}>
      <div className="flex w-full justify-center items-center 2xl:px-20 gradient-bg-transactions">
        <div className="flex flex-col md:p-12 py-12 px-4">
          {currentAccount ? (
            <h3 className="text-white text-3xl text-center my-2">
              Latest Transactions
            </h3>
          ) : (
            <h3 className="text-white text-3xl text-center my-2">
              Connect your account to see the latest transactions
            </h3>
          )}
          <div className="flex flex-wrap justify-center items-center mt-10">
            {[...dummyData, ...transactions].reverse().map((transaction, i) => {
              const transactionWithKeyword: TransactionsCardProps = { 
                ...transaction, 
                keyword: transaction.message || 'default', 
                amount: parseFloat(transaction.amount.toString()), 
                addressTo: transaction.receipient || '', 
                addressFrom: transaction.address || '',
                url: '',
                timestamp: transaction.timestamp.toString(),
                onViewDetails: handleViewDetails
              };
              return <TransactionsCard key={i} {...transactionWithKeyword} />
            })}
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transaction Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTransaction && (
              <>
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
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="blue" 
              mr={3} 
              onClick={() => router.push('/')}
            >
              Back to Homepage
            </Button>
            <Button 
              colorScheme="red" 
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
};

export default Transaction;