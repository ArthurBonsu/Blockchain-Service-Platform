
import { FC, useState } from 'react';
import { TransactionsCardProps } from 'types/ethers';
import { shortenAddress } from "../../constants/shortenAddress";
import useFetch from 'hooks/useFetch';
import { Image, Stack, InputGroup, Input, InputRightAddon  } from "@chakra-ui/react";
import React, { useEffect,  useCallback, useContext } from 'react';

const TransactionsCard: FC<TransactionsCardProps> = ({ addressTo, addressFrom, timestamp, message, keyword, amount, url }) => {
  const gifUrl = useFetch({ keyword });

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
      </div>
    </div>
  );
};

const SimpleTransfer: FC = () => {
  const [transactions, setTransactions] = useState<TransactionsCardProps[]>([]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implementation of transfer
  }

  return (
    <Stack spacing={6}>
      <div className="flex w-full justify-center items-center 2xl:px-20 gradient-bg-transactions">
        <div className="flex flex-col md:p-12 py-12 px-4">
          <h3 className="text-white text-3xl text-center my-2">
            Latest Transactions
          </h3>
          <div className="flex flex-wrap justify-center items-center mt-10">
            {transactions.map((transactionData, i) => (
              <TransactionsCard 
                key={i} 
                {...transactionData} 
                amount={Number(transactionData.amount)} 
                keyword={transactionData.keyword ? transactionData.keyword : 'defaultKeyword'} 
              />
            ))}
          </div>
        </div>
      </div>
    </Stack>
  );
}

export default SimpleTransfer;