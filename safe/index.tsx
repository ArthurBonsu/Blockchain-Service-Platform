import React, { ReactNode , useCallback, useEffect,useContext} from 'react';
import { Box, Button, Spinner, VStack } from '@chakra-ui/react';
import Router from 'next/router';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { ethers } from 'ethers';
import queries from 'services/queries';
import { getLayout } from '../components/Layout/Layout'; // Adjusted import path
import { useEthersStore, EtherStore } from 'stores/ethersStore';


// Ensure the wallet address is valid before calling utils.getAddress
const walletAddress = '0x1234567890123456789012345678901234567890'; // Replace with your actual wallet address
const walletCheckSumAddress = walletAddress ? ethers.utils.getAddress(walletAddress) : '';
console.log('Checksum address:', walletCheckSumAddress); // Example usage

export type WithPageLayout = React.FC & {
  getLayout?: (title: string) => (page: ReactNode) => ReactNode;
};

const Safe: WithPageLayout = () => {
  const walletAddress = useEthersStore((state: EtherStore) => state.address);
  
  // Ensure the wallet address is valid before calling utils.getAddress
  const walletCheckSumAddress = walletAddress ? ethers.utils.getAddress(walletAddress) : '';

  const [selectedSafe, setSelectedSafe] = useState<string | undefined>();
  const { data, isLoading } = useQuery(`safe-${walletCheckSumAddress}`, queries.getSafe(walletCheckSumAddress), {
    enabled: !!walletAddress,
    cacheTime: 100,
  });

  const onLoadSafe = async () => {
    if (selectedSafe) {
      await Router.push(`safe/${selectedSafe}/transfers`);
    }
  };

  const onCreateSafe = async () => {
    await Router.push(`/create`);
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minH="calc(100vh - 64px)">
      <VStack spacing={4} minW="md">
        <VStack borderRadius="lg" padding="6" bg="gray.100" minW="md" spacing={4} maxH="70vh" overflow="auto">
          {isLoading ? (
            <Spinner />
          ) : data?.safes.length ? (
            data.safes.map((s: string) => (
              <Box
                fontSize="lg"
                fontWeight="semibold"
                cursor="pointer"
                borderRadius="lg"
                key={s}
                p="4"
                bg={selectedSafe === s ? 'gray.300' : 'gray.200'}
                _hover={{ bg: 'gray.300' }}
                onClick={() => setSelectedSafe(s)}
              >
                {s}
              </Box>
            ))
          ) : (
            <Box>No safes found under your wallet</Box>
          )}
        </VStack>
        <Button colorScheme="green" onClick={onLoadSafe} disabled={!selectedSafe}>
          Load Safe
        </Button>
        <Button colorScheme="blue" onClick={onCreateSafe}>
          Create Safe
        </Button>
        
      </VStack>
    </Box>
  );
};

Safe.getLayout = function (title: string) {
  return (page: ReactNode) => getLayout(title)({ page });
};


export default Safe;
