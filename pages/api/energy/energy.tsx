import React, { useEffect } from 'react';
import { 
  Box, 
  Container, 
  VStack, 
  Heading, 
  Text, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  Grid, 
  GridItem,
  Button
} from '@chakra-ui/react';
import { NextPage } from 'next';
import TokenManagement from '../../components/TokenManagement';
import { useTokenContext } from '../../contexts/TokenContext';
import { useSafeContext } from '../../contexts/useSafeContext';

const EnergyPage: NextPage = () => {
  const { tokenBalance, stakedBalance } = useTokenContext();
  
  // Use SafeContext for wallet connection and account management
  const { 
    currentAccount, 
    connectWallet, 
    checkIfWalletIsConnect 
  } = useSafeContext();

  // Check wallet connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await checkIfWalletIsConnect();
      } catch (error) {
        console.error('Wallet connection check failed', error);
      }
    };

    checkConnection();
  }, [checkIfWalletIsConnect]);

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={4}>
            BlockChain Services (BCS) Token
          </Heading>
          <Text maxW="600px" mx="auto">
            Our native platform token enables governance, staking, and platform-wide utility across 
            climate monitoring, crowd sourcing, DAO interactions, and more.
          </Text>
        </Box>

        {currentAccount ? (
          <Grid templateColumns={['1fr', 'repeat(2, 1fr)']} gap={6}>
            <GridItem>
              <Stat 
                p={6} 
                borderWidth={1} 
                borderRadius="lg" 
                bg="gray.50"
              >
                <StatLabel>Total Token Balance</StatLabel>
                <StatNumber>{tokenBalance} BCS</StatNumber>
                <StatHelpText>Available in your wallet</StatHelpText>
              </Stat>
            </GridItem>

            <GridItem>
              <Stat 
                p={6} 
                borderWidth={1} 
                borderRadius="lg" 
                bg="gray.50"
              >
                <StatLabel>Staked Balance</StatLabel>
                <StatNumber>{stakedBalance} BCS</StatNumber>
                <StatHelpText>Tokens staked for governance</StatHelpText>
              </Stat>
            </GridItem>

            <GridItem colSpan={2}>
              <TokenManagement />
            </GridItem>

            <GridItem>
              <Box 
                p={6} 
                borderWidth={1} 
                borderRadius="lg" 
                bg="white"
              >
                <Heading size="md" mb={4}>Token Utility</Heading>
                <VStack align="start" spacing={3}>
                  <Text>
                    🌍 Governance: Participate in platform decision-making
                  </Text>
                  <Text>
                    🔐 Staking: Earn rewards and secure the network
                  </Text>
                  <Text>
                    💱 Transaction Fees: Use BCS for platform transactions
                  </Text>
                  <Text>
                    🏆 Rewards: Earn tokens for platform contributions
                  </Text>
                </VStack>
              </Box>
            </GridItem>

            <GridItem>
              <Box 
                p={6} 
                borderWidth={1} 
                borderRadius="lg" 
                bg="white"
              >
                <Heading size="md" mb={4}>Tokenomics</Heading>
                <VStack align="start" spacing={3}>
                  <Text>
                    <strong>Total Supply:</strong> 1,000,000,000 BCS
                  </Text>
                  <Text>
                    <strong>Initial Distribution:</strong> 200,000,000 BCS
                  </Text>
                  <Text>
                    <strong>Staking Rewards:</strong> 5% Annual Rate
                  </Text>
                  <Text>
                    <strong>Governance Weight:</strong> Proportional to staked tokens
                  </Text>
                </VStack>
              </Box>
            </GridItem>
          </Grid>
        ) : (
          <Box 
            textAlign="center" 
            p={10} 
            borderWidth={1} 
            borderRadius="lg"
          >
            <Heading size="lg" mb={4}>Connect Wallet to View Token Details</Heading>
            <Text mb={4}>
              Please connect your Ethereum wallet to interact with BCS tokens
            </Text>
            <Button 
              colorScheme="blue" 
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default EnergyPage;