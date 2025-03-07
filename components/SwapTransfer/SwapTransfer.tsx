import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  FormErrorMessage, 
  FormLabel, 
  NumberInput, 
  NumberInputField, 
  NumberIncrementStepper, 
  NumberDecrementStepper, 
  Select, 
  Stack, 
  Text, 
  NumberInputStepper,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { RiArrowDownSLine } from 'react-icons/ri';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSwapContext } from 'contexts/useSwapContext';

interface SwapTransferProps {
  onSwapComplete?: (txHash: string) => void;
}

interface SwapTransferFormValues {
  tokenAname: string;
  symbolA: string;
  tokenBname: string;
  symbolB: string;
  amount: number;
}

const SwapTransfer: React.FC<SwapTransferProps> = ({ onSwapComplete }) => {
  const [error, setError] = useState<string | null>(null);
  const [swapResult, setSwapResult] = useState<{
    hash: string;
    amount: number;
    newAmount: number;
  } | null>(null);
  
  // Use our enhanced context
  const { 
    swapTKA, 
    isLoading, 
    connectWallet,
    currentAccount,
    transactions
  } = useSwapContext();
  
  const toast = useToast();

  // Define list of available tokens
  const ListOfTokens = [
    { tokenname: 'TokenABC', symbol: 'ABC' },
    { tokenname: 'TokenXYZ', symbol: 'XYZ' },
  ];

  // Define form validation schema
  const schema = yup.object().shape({
    tokenAname: yup.string().required('Token A is required'),
    symbolA: yup.string().required('Symbol A is required'),
    tokenBname: yup.string().required('Token B is required'),
    symbolB: yup.string().required('Symbol B is required'),
    amount: yup.number().required('Amount is required').positive('Amount must be positive'),
  });

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SwapTransferFormValues>({
    resolver: yupResolver(schema),
  });

  // Connect wallet on component mount if not already connected
  useEffect(() => {
    if (!currentAccount) {
      const connectOnMount = async () => {
        try {
          await connectWallet();
        } catch (error) {
          console.error("Failed to connect wallet on mount:", error);
          setError("Failed to connect wallet. Please make sure MetaMask is installed and unlocked.");
        }
      };
      
      connectOnMount();
    }
  }, [currentAccount, connectWallet]);

  // Watch for changes to update estimated swap amount
  const amountWatch = watch('amount');
  const tokenAWatch = watch('tokenAname');
  const tokenBWatch = watch('tokenBname');

  // Submit handler
  const onSubmit = async (data: SwapTransferFormValues) => {
    setError(null);
    
    try {
      if (!currentAccount) {
        await connectWallet();
      }
      
      // Calling the swap function from our context
      await swapTKA({
        tokenAname: data.tokenAname,
        symbolA: data.symbolA,
        tokenBname: data.tokenBname,
        symbolB: data.symbolB,
        amount: data.amount,
      });
      
      // Show success toast
      toast({
        title: "Swap Successful",
        description: `Successfully swapped ${data.amount} ${data.symbolA} for tokens`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Save the transaction result
      setSwapResult({
        hash: transactions.swaphash,
        amount: data.amount,
        newAmount: Number(transactions.newamount)
      });
      
      // Reset form after successful swap
      reset();
      
      // Call callback if provided
      if (onSwapComplete && transactions.swaphash) {
        onSwapComplete(transactions.swaphash);
      }
      
    } catch (error) {
      console.error("Error submitting swap:", error);
      setError("Failed to execute swap. Please check your wallet and try again.");
      
      toast({
        title: "Swap Failed",
        description: "There was an error processing your swap request.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box m="5" p="5" bg="white" borderRadius="md" boxShadow="md">
      <Text fontSize="2xl" fontWeight="bold" mb="4">Swap Tokens</Text>
      
      {error && (
        <Alert status="error" mb="4">
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {swapResult && (
        <Alert status="success" mb="4">
          <AlertIcon />
          <Box>
            <AlertTitle>Swap Successful!</AlertTitle>
            <AlertDescription>
              You swapped {swapResult.amount} tokens for {swapResult.newAmount} tokens.
              <Text>Transaction Hash: {swapResult.hash}</Text>
            </AlertDescription>
          </Box>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" spacing={4}>
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

          {amountWatch && tokenAWatch && tokenBWatch && (
            <Text fontSize="sm">
              Estimated receive amount will be calculated based on current exchange rate and fees.
            </Text>
          )}

          <Stack direction="row">
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isLoading}
              loadingText="Processing"
            >
              Swap Tokens
            </Button>
            
            {!currentAccount && (
              <Button
                colorScheme="green"
                onClick={connectWallet}
                isLoading={isLoading}
              >
                Connect Wallet
              </Button>
            )}
          </Stack>
        </Stack>
      </form>
    </Box>
  );
};

export default SwapTransfer;