import React, { useState } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Input, 
  Button, 
  Heading, 
  Divider, 
  useToast 
} from '@chakra-ui/react';
import { useTokenContext } from '../../contexts/TokenContext';
import { useEthersStore } from 'stores/ethersStore';

const Energy: React.FC = () => {
  const { 
    tokenBalance, 
    stakedBalance, 
    stakeTokens, 
    unstakeTokens, 
    transferTokens 
  } = useTokenContext();
  const { address } = useEthersStore();
  const toast = useToast();

  // State for input fields
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');

  // Handle staking
  const handleStake = async () => {
    try {
      await stakeTokens(stakeAmount);
      toast({
        title: "Tokens Staked",
        description: `${stakeAmount} tokens staked successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setStakeAmount('');
    } catch (error) {
      toast({
        title: "Staking Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle unstaking
  const handleUnstake = async () => {
    try {
      await unstakeTokens(unstakeAmount);
      toast({
        title: "Tokens Unstaked",
        description: `${unstakeAmount} tokens unstaked successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setUnstakeAmount('');
    } catch (error) {
      toast({
        title: "Unstaking Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle token transfer
  const handleTransfer = async () => {
    try {
      await transferTokens(transferRecipient, transferAmount);
      toast({
        title: "Tokens Transferred",
        description: `${transferAmount} tokens sent to ${transferRecipient}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setTransferAmount('');
      setTransferRecipient('');
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6} borderWidth={1} borderRadius="lg">
      <VStack spacing={6} align="stretch">
        <Heading size="md">BCS Token Management</Heading>
        
        {/* Token Balances */}
        <HStack justify="space-between">
          <VStack align="start">
            <Text fontWeight="bold">Wallet Balance:</Text>
            <Text>{tokenBalance} BCS</Text>
          </VStack>
          <VStack align="start">
            <Text fontWeight="bold">Staked Balance:</Text>
            <Text>{stakedBalance} BCS</Text>
          </VStack>
        </HStack>

        <Divider />

        {/* Staking Section */}
        <VStack spacing={4}>
          <Heading size="sm">Stake Tokens</Heading>
          <HStack width="full">
            <Input 
              placeholder="Amount to stake" 
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              type="number"
            />
            <Button 
              colorScheme="blue" 
              onClick={handleStake}
              isDisabled={!address || !stakeAmount}
            >
              Stake
            </Button>
          </HStack>
        </VStack>

        <Divider />

        {/* Unstaking Section */}
        <VStack spacing={4}>
          <Heading size="sm">Unstake Tokens</Heading>
          <HStack width="full">
            <Input 
              placeholder="Amount to unstake" 
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
              type="number"
            />
            <Button 
              colorScheme="red" 
              onClick={handleUnstake}
              isDisabled={!address || !unstakeAmount}
            >
              Unstake
            </Button>
          </HStack>
        </VStack>

        <Divider />

        {/* Transfer Section */}
        <VStack spacing={4}>
          <Heading size="sm">Transfer Tokens</Heading>
          <HStack width="full">
            <Input 
              placeholder="Recipient Address" 
              value={transferRecipient}
              onChange={(e) => setTransferRecipient(e.target.value)}
            />
            <Input 
              placeholder="Amount" 
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              type="number"
            />
            <Button 
              colorScheme="green" 
              onClick={handleTransfer}
              isDisabled={!address || !transferRecipient || !transferAmount}
            >
              Transfer
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
};

export default Energy;