"use client";
import React, { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { ethers } from 'ethers';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSwapContext } from '@/contexts/useSwapContext';
import { useEthersStore } from '@/stores/ethersStore';

// Dynamic imports to avoid server-side rendering issues
const Button = dynamic(() => import('@chakra-ui/react').then((module) => module.Button), { ssr: false });
const Input = dynamic(() => import('@chakra-ui/react').then((module) => module.Input), { ssr: false });
const Flex = dynamic(() => import('@chakra-ui/react').then((module) => module.Flex), { ssr: false });
const Box = dynamic(() => import('@chakra-ui/react').then((module) => module.Box), { ssr: false });
const Heading = dynamic(() => import('@chakra-ui/react').then((module) => module.Heading), { ssr: false });
const VStack = dynamic(() => import('@chakra-ui/react').then((module) => module.VStack), { ssr: false });
const HStack = dynamic(() => import('@chakra-ui/react').then((module) => module.HStack), { ssr: false });
const Center = dynamic(() => import('@chakra-ui/react').then((module) => module.Center), { ssr: false });
const FormControl = dynamic(() => import('@chakra-ui/react').then((module) => module.FormControl), { ssr: false });
const FormLabel = dynamic(() => import('@chakra-ui/react').then((module) => module.FormLabel), { ssr: false });
const FormErrorMessage = dynamic(() => import('@chakra-ui/react').then((module) => module.FormErrorMessage), { ssr: false });
const Select = dynamic(() => import('@chakra-ui/react').then((module) => module.Select), { ssr: false });
const NumberInput = dynamic(() => import('@chakra-ui/react').then((module) => module.NumberInput), { ssr: false });
const NumberInputField = dynamic(() => import('@chakra-ui/react').then((module) => module.NumberInputField), { ssr: false });
const NumberInputStepper = dynamic(() => import('@chakra-ui/react').then((module) => module.NumberInputStepper), { ssr: false });
const NumberIncrementStepper = dynamic(() => import('@chakra-ui/react').then((module) => module.NumberIncrementStepper), { ssr: false });
const NumberDecrementStepper = dynamic(() => import('@chakra-ui/react').then((module) => module.NumberDecrementStepper), { ssr: false });
const Tabs = dynamic(() => import('@chakra-ui/react').then((module) => module.Tabs), { ssr: false });
const TabList = dynamic(() => import('@chakra-ui/react').then((module) => module.TabList), { ssr: false });
const Tab = dynamic(() => import('@chakra-ui/react').then((module) => module.Tab), { ssr: false });
const TabPanels = dynamic(() => import('@chakra-ui/react').then((module) => module.TabPanels), { ssr: false });
const TabPanel = dynamic(() => import('@chakra-ui/react').then((module) => module.TabPanel), { ssr: false });
const Alert = dynamic(() => import('@chakra-ui/react').then((module) => module.Alert), { ssr: false });
const AlertIcon = dynamic(() => import('@chakra-ui/react').then((module) => module.AlertIcon), { ssr: false });
const Table = dynamic(() => import('@chakra-ui/react').then((module) => module.Table), { ssr: false });
const Thead = dynamic(() => import('@chakra-ui/react').then((module) => module.Thead), { ssr: false });
const Tbody = dynamic(() => import('@chakra-ui/react').then((module) => module.Tbody), { ssr: false });
const Tr = dynamic(() => import('@chakra-ui/react').then((module) => module.Tr), { ssr: false });
const Th = dynamic(() => import('@chakra-ui/react').then((module) => module.Th), { ssr: false });
const Td = dynamic(() => import('@chakra-ui/react').then((module) => module.Td), { ssr: false });
const Badge = dynamic(() => import('@chakra-ui/react').then((module) => module.Badge), { ssr: false });
const Text = dynamic(() => import('@chakra-ui/react').then((module) => module.Text), { ssr: false });
const useToast = dynamic(() => import('@chakra-ui/react').then((module) => module.useToast), { ssr: false });

// Icons
const RiArrowDownSLine = dynamic(() => import('react-icons/ri').then((module) => module.RiArrowDownSLine), { ssr: false });
const IoChevronUpSharp = dynamic(() => import('react-icons/io5').then((module) => module.IoChevronUpSharp), { ssr: false });
const IoLogInSharp = dynamic(() => import('react-icons/io5').then((module) => module.IoLogInSharp), { ssr: false });

// Components
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import SimpleTransfer from '@/components/SimpleTransfer';
import AppAlertDialog from '@/components/AppAlertDialog';

// Form schema and types
interface SwapTransferFormValues {
  tokenAname: string;
  symbolA: string;
  tokenBname: string;
  symbolB: string;
  amount: number;
}

interface SwapRejectFormValues {
  safeTxHash: string;
  nonce: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  tokenA: string;
  tokenB: string;
  hash: string;
  status: 'pending' | 'completed' | 'rejected';
  timestamp: number;
  nonce: number;
}

// Swap Transfer Component (from SwapTransfer.tsx)
const SwapTransferForm: FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transaction, setTransaction] = useState({});
  const [tokenChosen, setTokenChosen] = useState(false);
  const toast = useToast();
  const { swapTKA, connectWallet, currentAccount } = useSwapContext();
  const { address } = useEthersStore((state: any) => ({
    address: state.address,
  }));

  const ListOfTokens = [
    { tokenname: 'TokenABC', symbol: 'ABC' },
    { tokenname: 'TokenXYZ', symbol: 'XYZ' },
  ];

  const schema = yup.object().shape({
    tokenAname: yup.string().required('Token A is required'),
    symbolA: yup.string().required('Symbol A is required'),
    tokenBname: yup.string().required('Token B is required'),
    symbolB: yup.string().required('Symbol B is required'),
    amount: yup.number().required('Amount is required').positive('Amount must be positive'),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SwapTransferFormValues>({
    resolver: yupResolver(schema),
  });

  const amountWatch = watch('amount');

  const onSubmit = async (data: SwapTransferFormValues) => {
    setIsSubmitting(true);
    try {
      if (!currentAccount) {
        await connectWallet();
      }
      
      await swapTKA({
        tokenAname: data.tokenAname,
        symbolA: data.symbolA,
        tokenBname: data.tokenBname,
        symbolB: data.symbolB,
        amount: data.amount,
      });
      
      toast({
        title: "Swap Successful",
        description: `Successfully swapped ${data.amount} ${data.symbolA} for tokens`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      setTransaction(data);
      
    } catch (error) {
      console.error("Error submitting swap:", error);
      
      toast({
        title: "Swap Failed",
        description: "There was an error processing your swap request.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box m="5" bg="white" p={5} borderRadius="md" boxShadow="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4}>
          <FormControl isInvalid={!!errors.tokenAname}>
            <FormLabel htmlFor="tokenAname">Token A</FormLabel>
            <Select
              icon={<RiArrowDownSLine />}
              placeholder="Select Tokenname"
              id="tokenAname"
              {...register('tokenAname')}
            >
              {ListOfTokens.map((item) => (
                <option key={item.tokenname} value={item.tokenname}>
                  {item.tokenname}
                </option>
              ))}
            </Select>
            {errors.tokenAname && (
              <FormErrorMessage>{errors.tokenAname.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.symbolA}>
            <FormLabel htmlFor="symbolA">Symbol A</FormLabel>
            <Select
              icon={<RiArrowDownSLine />}
              placeholder="Select Token Symbol"
              id="symbolA"
              {...register('symbolA')}
            >
              {ListOfTokens.map((item) => (
                <option key={item.symbol} value={item.symbol}>
                  {item.symbol}
                </option>
              ))}
            </Select>
            {errors.symbolA && (
              <FormErrorMessage>{errors.symbolA.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.tokenBname}>
            <FormLabel htmlFor="tokenBname">Token B</FormLabel>
            <Select
              icon={<RiArrowDownSLine />}
              placeholder="Select Tokenname"
              id="tokenBname"
              {...register('tokenBname')}
            >
              {ListOfTokens.map((item) => (
                <option key={item.tokenname} value={item.tokenname}>
                  {item.tokenname}
                </option>
              ))}
            </Select>
            {errors.tokenBname && (
              <FormErrorMessage>{errors.tokenBname.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.symbolB}>
            <FormLabel htmlFor="symbolB">Symbol B</FormLabel>
            <Select
              icon={<RiArrowDownSLine />}
              placeholder="Select Token Symbol"
              id="symbolB"
              {...register('symbolB')}
            >
              {ListOfTokens.map((item) => (
                <option key={item.symbol} value={item.symbol}>
                  {item.symbol}
                </option>
              ))}
            </Select>
            {errors.symbolB && (
              <FormErrorMessage>{errors.symbolB.message}</FormErrorMessage>
            )}
          </FormControl>
          
          <FormControl isInvalid={!!errors.amount}>
            <FormLabel htmlFor="amount">Amount</FormLabel>
            <NumberInput step={0.1} min={0}>
              <NumberInputField id="amount" {...register('amount')} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            {errors.amount && (
              <FormErrorMessage>{errors.amount.message}</FormErrorMessage>
            )}
          </FormControl>

          <HStack width="100%" justifyContent="flex-end">
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isSubmitting}
              loadingText="Processing"
            >
              Swap Tokens
            </Button>
            
            {!currentAccount && (
              <Button
                colorScheme="green"
                onClick={connectWallet}
                isLoading={isSubmitting}
              >
                Connect Wallet
              </Button>
            )}
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

// Secured Swap Component (from swap.tsx)
const SecuredSwapForm: FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { address, provider } = useEthersStore((state: any) => ({
    address: state.address,
    provider: state.provider,
  }));
  const toast = useToast();

  const [transactionHash, setTransactionHash] = useState<string>('');
  const [swapAmount, setSwapAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSwap = async () => {
    if (!provider || !address) {
      toast({
        title: "Error",
        description: "Provider or address not found. Please connect your wallet.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const signer = provider.getSigner();
      const swapContractAddress = '0xYourSwapContractAddress'; // Replace with your swap contract address
      const swapContractAbi: any = []; // Add your swap contract ABI here

      const swapContract = new ethers.Contract(swapContractAddress, swapContractAbi, signer);

      const tx = await swapContract.swap(ethers.utils.parseEther(swapAmount));
      setTransactionHash(tx.hash);
      
      toast({
        title: "Swap Initiated",
        description: `Transaction hash: ${tx.hash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      console.log('Swap transaction hash:', tx.hash);
    } catch (error) {
      console.error('Swap transaction failed:', error);
      
      toast({
        title: "Swap Failed",
        description: "There was an error processing your swap transaction.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box m="5" bg="white" p={5} borderRadius="md" boxShadow="sm">
      <VStack spacing={4} align="stretch">
        <Heading size="md">Secure Swap</Heading>
        <Text>Enter the amount you want to swap securely</Text>
        
        <FormControl>
          <FormLabel htmlFor="swapAmount">Swap Amount</FormLabel>
          <Input
            id="swapAmount"
            placeholder="Enter amount to swap"
            value={swapAmount}
            onChange={(e) => setSwapAmount(e.target.value)}
          />
        </FormControl>
        
        <Button
          colorScheme="teal"
          onClick={handleSwap}
          isLoading={isLoading}
          loadingText="Processing"
        >
          Execute Secure Swap
        </Button>
        
        {transactionHash && (
          <Box p={3} bg="gray.100" borderRadius="md">
            <Text fontWeight="bold">Transaction Hash:</Text>
            <Text fontSize="sm" wordBreak="break-all">{transactionHash}</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

// Transaction History Component
const TransactionHistoryPanel: FC = () => {
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);
  const { useDisclosure } = require('@chakra-ui/react');
  const rejectDisclosure = useDisclosure();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { currentAccount } = useSwapContext();
  
  // In a real app, fetch this from blockchain or backend
  useEffect(() => {
    // Simulate fetching transaction history
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'Swap',
        amount: '10.5',
        tokenA: 'ABC',
        tokenB: 'XYZ',
        hash: '0x1234567890abcdef',
        status: 'completed',
        timestamp: Date.now() - 3600000, // 1 hour ago
        nonce: 1
      },
      {
        id: '2',
        type: 'Swap',
        amount: '5.2',
        tokenA: 'XYZ',
        tokenB: 'ABC',
        hash: '0xabcdef1234567890',
        status: 'pending',
        timestamp: Date.now() - 7200000, // 2 hours ago
        nonce: 2
      }
    ];
    
    setTransactionHistory(mockTransactions);
  }, []);

  const handleReject = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    rejectDisclosure.onOpen();
  };

  const confirmReject = async () => {
    if (!selectedTransaction) return;
    
    try {
      // In a real app, call your contract to reject the transaction
      console.log(`Rejecting transaction ${selectedTransaction.hash}`);
      
      // Update the status in UI
      setTransactionHistory(prev => 
        prev.map(tx => 
          tx.id === selectedTransaction.id 
            ? { ...tx, status: 'rejected' } 
            : tx
        )
      );
      
      rejectDisclosure.onClose();
    } catch (error) {
      console.error('Error rejecting transaction:', error);
    }
  };

  if (!currentAccount) {
    return (
      <Alert status="warning">
        <AlertIcon />
        Please connect your wallet to view your transaction history.
      </Alert>
    );
  }

  if (transactionHistory.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        No transactions found in your history.
      </Alert>
    );
  }

  return (
    <Box m="5" bg="white" p={5} borderRadius="md" boxShadow="sm">
      <Heading size="md" mb={4}>Transaction History</Heading>
      
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Type</Th>
            <Th>Amount</Th>
            <Th>Tokens</Th>
            <Th>Status</Th>
            <Th>Time</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactionHistory.map((tx) => (
            <Tr key={tx.id}>
              <Td>{tx.type}</Td>
              <Td>{tx.amount}</Td>
              <Td>{tx.tokenA} → {tx.tokenB}</Td>
              <Td>
                <Badge
                  colorScheme={
                    tx.status === 'completed' ? 'green' : 
                    tx.status === 'pending' ? 'yellow' : 'red'
                  }
                >
                  {tx.status}
                </Badge>
              </Td>
              <Td>{new Date(tx.timestamp).toLocaleString()}</Td>
              <Td>
                {tx.status === 'pending' && (
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => handleReject(tx)}
                  >
                    Reject
                  </Button>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      
      <AppAlertDialog
        isLoading={false}
        handleSubmit={confirmReject}
        header="Reject Transaction"
        body={`This action will reject transaction #${selectedTransaction?.nonce}. Are you sure you want to proceed?`}
        disclosure={rejectDisclosure}
      />
    </Box>
  );
};

// Simple Transfer Integration
const SimpleTransferPanel: FC = () => {
  return (
    <Box m="5" bg="white" p={5} borderRadius="md" boxShadow="sm">
      <Heading size="md" mb={4}>Simple Transfer</Heading>
      <SimpleTransfer />
    </Box>
  );
};

// Main Unified Swap Page Component
const UnifiedSwapPage: FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { address } = useEthersStore((state: any) => ({
    address: state.address,
  }));
  const { connectWallet, currentAccount } = useSwapContext();
  
  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: '/some' });
    router.push(data.url);
  };

  useEffect(() => {
    // Connect wallet on page load if not connected
    if (!currentAccount) {
      connectWallet().catch(console.error);
    }
  }, [currentAccount, connectWallet]);

  if (status === 'loading') {
    return (
      <Center h="100vh">
        <Heading>Checking Authentication...</Heading>
      </Center>
    );
  }

  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <NavBar title="Blockchain Services Platform" address={address || currentAccount || "0x"} />
      
      <Box flex="1" p={4}>
        {!session ? (
          <Center h="calc(100vh - 200px)">
            <VStack spacing={4}>
              <Heading>You are not signed in</Heading>
              <Button leftIcon={<IoLogInSharp />} colorScheme="blue" onClick={() => signIn()}>
                Sign In
              </Button>
            </VStack>
          </Center>
        ) : (
          <VStack spacing={4} align="stretch">
            <Heading size="lg">Token Swap Dashboard</Heading>
            <Text>Welcome, {session.user?.email || "User"}. Use the tabs below to manage your token swaps.</Text>
            
            <Tabs variant="enclosed" isFitted>
              <TabList>
                <Tab>Swap Transfer</Tab>
                <Tab>Secured Swap</Tab>
                <Tab>Simple Transfer</Tab>
                <Tab>Transaction History</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel>
                  <SwapTransferForm />
                </TabPanel>
                <TabPanel>
                  <SecuredSwapForm />
                </TabPanel>
                <TabPanel>
                  <SimpleTransferPanel />
                </TabPanel>
                <TabPanel>
                  <TransactionHistoryPanel />
                </TabPanel>
              </TabPanels>
            </Tabs>
            
            <Box textAlign="right">
              <Button colorScheme="red" variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </Box>
          </VStack>
        )}
      </Box>
      
      <Footer
        message="Please join us as we make this world a better place"
        community="Community"
        copyright="Trademark Policy"
        blog="Blog"
        FAQ="FAQ"
        Contact="blockdao@gmail.com"
        githubUrl="https://github.com/ArthurBonsu"
        twitterUrl="https://twitter.com/home"
        discordUrl="https://uniswap.org/blog/uniswap-v3"
      />
    </Flex>
  );
};

export default UnifiedSwapPage;