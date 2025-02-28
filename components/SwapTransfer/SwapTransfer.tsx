import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  FormErrorMessage, 
  FormHelperText, 
  FormLabel, 
  Input, 
  NumberInput, 
  NumberInputField, 
  NumberIncrementStepper, 
  NumberDecrementStepper, 
  Select, 
  Stack, 
  Text, 
  NumberInputStepper
} from '@chakra-ui/react';
import { RiArrowDownSLine } from 'react-icons/ri';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface SwapTransferProps {
  // Add any props here
}

interface SwapTransferFormValues {
  tokenAname: string;
  symbolA: string;
  tokenBname: string;
  symbolB: string;
  amount: number;
}

const SwapTransfer: React.FC<SwapTransferProps> = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transaction, setTransaction] = useState({});
  const [tokenChosen, setTokenChosen] = useState(false);

  const ListOfTokens = [
    { tokenname: 'TokenABC', symbol: 'ABC' },
    { tokenname: 'TokenXYZ', symbol: 'XYZ' },
  ];

  const schema = yup.object().shape({
    tokenAname: yup.string().required(),
    symbolA: yup.string().required(),
    tokenBname: yup.string().required(),
    symbolB: yup.string().required(),
    amount: yup.number().required(),
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
     // handle form submission
     // submit transactions to the smart contract
     // update the transaction state
     // provide button to make swap transfer 
      console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box m="5">
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
              {ListOfTokens.map((item, index) => (
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
              {ListOfTokens.map((item, index) => (
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
              {ListOfTokens.map((item, index) => (
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
              {ListOfTokens.map((item, index) => (
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

          <Stack direction="row">
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isSubmitting}
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
};

export default SwapTransfer;