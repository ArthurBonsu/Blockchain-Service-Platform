import { 
  chakra, Heading, Stack, Button, Flex, useDisclosure, Box, 
  Text, FormControl, FormLabel, Input, InputGroup, 
  InputRightAddon, Grid
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FC, useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import React from 'react';
import useTransactionContext from 'contexts/useTransactionContext';
import { TransactionDisplayProps } from '@/types/ethers';

interface PaymentTransferProps {
  username: string; 
  address: string; 
  amount: number; 
  comment: string;
  timestamp?: Date; 
  receipient: string;
  receipients: Array<string>;
  txhash?: string; 
  USDprice: number;
  paymenthash: string;
  owneraddress: string; 
  onPayTransfer: () => void;
}

const pathname = "/SimpleTransfer";

// Transaction Display Component
const TransactionDisplay: React.FC<TransactionDisplayProps> = ({ 
  account, 
  username, 
  paymenthash, 
  receipients, 
  contractowneraddress, 
  amount, 
  usdPrice 
}) => {
  return (
    <Stack spacing={6}>
      <Box maxW='sm' borderWidth='1px' borderRadius='lg' overflow='hidden' p={4}>
        <Heading as='h1' size='lg' mb={4}>
          View Payment Transaction
        </Heading>
        
        <Stack spacing={3}>
          <Flex justify="space-between">
            <Text fontWeight="bold">User:</Text>
            <Text>{account}</Text>
          </Flex>
          
          <Flex justify="space-between">
            <Text fontWeight="bold">Username:</Text>
            <Text>{username}</Text>
          </Flex>
          
          <Flex justify="space-between">
            <Text fontWeight="bold">Payment Hash:</Text>
            <Text>{paymenthash}</Text>
          </Flex>
          
          <Box>
            <Text fontWeight="bold" mb={2}>Recipients:</Text>
            {receipients.map((item, index) => (
              <Text key={index} pl={4}>
                Recipient {index + 1}: {item}
              </Text>
            ))}
          </Box>
          
          <Flex justify="space-between">
            <Text fontWeight="bold">Owner Address:</Text>
            <Text>{contractowneraddress}</Text>
          </Flex>
          
          <Flex justify="space-between">
            <Text fontWeight="bold">Amount of Tokens:</Text>
            <Text>{amount}</Text>
          </Flex>
          
          <Flex justify="space-between">
            <Text fontWeight="bold">Price:</Text>
            <Text>{usdPrice}</Text>
          </Flex>
        </Stack>
      </Box>
    </Stack>
  );
};

// Main Payment Transfer Component
const PaymentTransfer: FC<PaymentTransferProps> = ({
  username, 
  address, 
  amount, 
  comment, 
  txhash, 
  USDprice, 
  onPayTransfer, 
  ...rest
}) => {
  const { 
    currentAccount,
    PaymentformData,
    sendPayment,
    isPaid
  } = useTransactionContext();

  const router = useRouter();
  const [openMultiRecipient, setMultiReceipient] = useState(false);
  const [paymentcompleted, setPaymentcompleted] = useState(false);

  // Form validation schema
  const schema = yup.object({
    username: yup.string().required(),
    address: yup.string().required(),
    amount: yup.number().required(),
    comment: yup.string().required(),
    timestamp: yup.date().required(),
    receipient: yup.string().required(),
    receipients: yup.array().of(yup.string()).required(),
    txhash: yup.string(),
    USDprice: yup.number().required(),
    paymenthash: yup.string().required(),
    owneraddress: yup.string().required()
  }).required();

  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<PaymentTransferProps>({
    resolver: yupResolver(schema)
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'receipients'
  });

  // Check if payment is completed when component mounts or when isPaid changes
  useEffect(() => {
    if (isPaid) {
      setPaymentcompleted(true);
    }
  }, [isPaid]);

  // Update the payment data when it changes
  useEffect(() => {
    if (onPayTransfer) {
      onPayTransfer();
    }
  }, [PaymentformData.username, PaymentformData.contractaddress, PaymentformData.amount, onPayTransfer]);

  // Toggle multi-recipient input
  const onMultiReceipientOpen = () => {
    setMultiReceipient(!openMultiRecipient);
  };

  // Navigate to SimpleTransfer page
  const onMoveToTransfer = () => {
    router.push(pathname);
  };

  // Handle form submission
  const onSubmitPayment = async (data: PaymentTransferProps) => {
    try {
      // Send payment
      await sendPayment(data);
      setPaymentcompleted(true);
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  return (
    <Grid placeItems="center" w="full" minH="100vh">
      <Box w="500px" shadow="md" p="10" borderRadius="md" bg="gray.50">
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Text fontSize="xl" fontWeight="bold">Payment Transfer Solution</Text>
          <Button 
            bg="blue.200" 
            _hover={{ bg: 'blue.300' }} 
            textColor="white" 
            onClick={() => {
              onMultiReceipientOpen();
              append({});
            }}
          >
            Add Recipients
          </Button>
        </Flex>
        
        <form onSubmit={handleSubmit(onSubmitPayment)}>
          {Boolean(fields.length === 0) && (
            <Text mb={4}>Please add recipients...</Text>
          )}
          
          {fields.map((field, index) => (
            <InputGroup key={field.id} size="sm" mb={2}>
              <Input 
                {...register(`receipients.${index}`, { required: true })} 
                placeholder="Recipient address"
                bg="white" 
              />
              <InputRightAddon>
                <Text 
                  onClick={() => remove(index)} 
                  _hover={{ cursor: 'pointer', color: 'red.500' }}
                >
                  Remove
                </Text>
              </InputRightAddon>
            </InputGroup>
          ))}
          
          <Flex flexDirection="column" mt={6}>
            <FormControl mb={4}>
              <FormLabel fontWeight="bold">
                Payment Information
              </FormLabel>
              <Text mb={2} fontSize="sm">
                Make Payment Before Transferring Tokens. 
                The price is now at: {PaymentformData.USDprice || USDprice} for 5 tokens
              </Text>
              
              <Stack spacing={3}>
                <InputGroup>
                  <Input placeholder='Username' {...register("username")} bg="white" />
                </InputGroup>
                
                <InputGroup>
                  <Input placeholder='Address' {...register("address")} bg="white" />
                  <InputRightAddon>0x...</InputRightAddon>
                </InputGroup>
                
                <InputGroup>
                  <Input placeholder='Amount of tokens' {...register("amount")} bg="white" />
                </InputGroup>
                
                <InputGroup>
                  <Input placeholder='Comment' {...register("comment")} bg="white" />
                </InputGroup>
                
                <InputGroup>
                  <Input 
                    type="datetime-local" 
                    placeholder='Select Date and Time' 
                    {...register("timestamp")} 
                    bg="white"
                  />
                </InputGroup>
                
                <InputGroup>
                  <Input placeholder='Payment Hash' {...register("paymenthash")} bg="white" />
                </InputGroup>
                
                <InputGroup>
                  <Input placeholder='Owner Address' {...register("owneraddress")} bg="white" />
                </InputGroup>
              </Stack>
            </FormControl>
          </Flex>
          
          <Button
            bg="blue.200"
            _hover={{ bg: 'blue.300' }}
            textColor="white"
            type="submit"
            w="full"
            mt={4}
            isLoading={isSubmitting}
          >
            Make Payment
          </Button>
          
          {paymentcompleted && (
            <Button
              bg="green.400"
              _hover={{ bg: 'green.500' }}
              textColor="white"
              w="full"
              mt={4}
              onClick={onMoveToTransfer}
            >
              Move to Transfer
            </Button>
          )}
        </form>
        
        <Box mt={6}>
          <TransactionDisplay 
            account={currentAccount}
            username={PaymentformData.username || 'Nothing yet'}
            paymenthash={PaymentformData.paymenthash || 'Nothing yet'}
            receipients={PaymentformData.receipients || ['Nothing yet']}
            contractowneraddress={PaymentformData.owneraddress || 'Nothing yet'}
            amount={Number(PaymentformData.amount) || 0}
            usdPrice={Number(PaymentformData.USDprice) || 0}
          />
        </Box>
      </Box>
    </Grid>
  );
};

export default PaymentTransfer;