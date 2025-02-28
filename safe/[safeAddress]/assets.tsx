// ./app/safe/[safeAddress]/assets.tsx

import { Box, Spinner, Table, Thead, Th, Tbody, Tr, Td } from '@chakra-ui/react';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';

import React, { ReactNode, useEffect,useCallback, useContext } from 'react';
import PageSelection from '@components/PageSelection';
import { getLayout } from '../../components/Layout/Layout';
import queries from 'services/queries';
import { limitDecimals } from 'utils/tokenUtils';
import { ErrorType, AssetType } from 'types'; // Import the ErrorType and AssetType interfaces

export type WithPageLayout = React.FC & {
  getLayout?: (title: string) => (pageProps: { page: ReactNode }) => ReactNode;
};

const Assets: WithPageLayout = () => {
  const { query } = useRouter();
  const safeAddress = typeof query.safeAddress === 'string' ? query.safeAddress : '';
  const { data, isLoading, isError, error } = useQuery<AssetType[]>(
    `${safeAddress}-assets`,
    () => queries.getAssets(safeAddress)(),
    {
      enabled: !!safeAddress,
      retry: 2,
      onError: (err: unknown) => {
        console.error(err); // Log the error for debugging purposes
        // No need to return anything here
      },
    }
  );

  if (isError) {
    // Check if error is an object with a 'message' property
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return <span>Error: {(error as ErrorType).message}</span>;
    } else {
      // Fallback message if 'message' property is not available
      return <span>Error: An unexpected error occurred</span>;
    }
  }

  return isLoading ? (
    <Box minH="calc(100vh - 64px)" alignItems="center" justifyContent="center">
      <Spinner />
    </Box>
  ) : (
    <Box py={6}>
      <PageSelection value="assets" />
      <Table>
        <Thead bg="gray.100">
          <Tr>
            <Th>Asset</Th>
            <Th isNumeric>Balance</Th>
            <Th isNumeric>Balance (USD)</Th>
          </Tr>
        </Thead>
        <Tbody>
          {(data || []).map((t) => {
            const token =
              t.token && t.tokenAddress
                ? {
                    ...t.token,
                    tokenAddress: t.tokenAddress,
                  }
                : {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                    logoUri: '',
                    tokenAddress: '',
                  };
            const tokenBalance = Math.pow(10, -token.decimals!) * t.balance;
            return (
              <Tr key={t.timestamp}>
                <Td>
                  {token.name} ({token.symbol})
                </Td>
                <Td isNumeric>{limitDecimals(tokenBalance)}</Td>
                <Td isNumeric>$ {Number(t.fiatBalance)?.toLocaleString()}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

Assets.getLayout = function (title: string) {
  return getLayout(title);
};

export default Assets;
