import { 
  chakra, Heading, Stack, Button, Flex, useDisclosure, Box, 
  Text, FormControl, FormLabel, Input, InputGroup, 
  InputRightAddon, Grid
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FC, useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import React from 'react';
import useTransactionContext from 'contexts/useTransactionContext';
import { TransactionDisplayProps } from '@/types/ethers';
import { PaymentTransactions } from '@/types';

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

// Go back to the original definition
interface PaymentFormData {
  username: string;
  address: string;
  amount: number;
  comment: string;
  timestamp: Date;
  receipient: string;
  receipients: string[]; 
  txhash?: string;
  USDprice: number;
  paymenthash: string;
  owneraddress: string;
  contractowneraddress: string; // Add this field
}

const pathname = "/SimpleTransfer";

// Transaction Display Component
const TransactionDisplay: React.FC<TransactionDisplayProps> = ({ 
  account, 
  username, 
  paymenthash, 
  receipients, 
  contractowneraddress,
  owneraddress,  
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
            <Text fontWeight="bold"> Owner Address:</Text>
            <Text>{owneraddress}</Text>
          </Flex>
          
          <Flex justify="space-between">
            <Text fontWeight="bold">Contract Owner Address:</Text>
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

  // Update the validation schema accordingly
  const paymentFormSchema = yup.object().shape({
    username: yup.string().required('Username is required'),
    address: yup.string().required('Address is required'),
    amount: yup.number().required('Amount is required').positive('Amount must be positive'),
    comment: yup.string(),
    timestamp: yup.date().default(() => new Date()),
    receipient: yup.string(),
    receipients: yup.array().of(yup.string()),
    USDprice: yup.number().default(0),
    paymenthash: yup.string(),
    owneraddress: yup.string(),
    contractowneraddress: yup.string() // Add validation for this field
  });

  // Move the useForm hook inside the component
  const {
    control,
    register,
    handleSubmit,
    watch, // Add watch here
    formState: { isSubmitting, errors },
  } = useForm<PaymentFormData>({
    resolver: yupResolver(paymentFormSchema),
    defaultValues: {
      username: username || '',
      address: address || '',
      amount: amount || 0,
      comment: comment || '',
      timestamp: new Date(),
      receipient: '',
      receipients: [],
      USDprice: USDprice || 0,
      paymenthash: '',
      owneraddress: '',
      contractowneraddress: '' // Initialize this
    }
  });

  // Update the useFieldArray call
  // When using useFieldArray with string arrays
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'receipients' as never // Type assertion to make TypeScript happy
  });

  // Check if payment is completed when component mounts or when isPaid changes
  useEffect(() => {
    if (isPaid) {
      setPaymentcompleted(true);
    }
  }, [isPaid]);

  // Update the useEffect dependency array
  useEffect(() => {
    if (onPayTransfer) {
      onPayTransfer();
    }
  }, [PaymentformData.username, PaymentformData.address, PaymentformData.amount, onPayTransfer]);

  // Update the append function
  const onMultiReceipientOpen = () => {
    setMultiReceipient(!openMultiRecipient);
    append(''); // Now we can append strings
  };

  // Navigate to SimpleTransfer page
  const onMoveToTransfer = () => {
    router.push(pathname);
  };

  // Update the onSubmitPayment function
  const onSubmitPayment = async (data: PaymentFormData) => {
    try {
      // Destructure to separate contractowneraddress from the data to be sent
      const { contractowneraddress, ...paymentDataFields } = data;
      
      // Create a payment transaction object that matches the PaymentTransactions type
      const paymentTransaction: PaymentTransactions = {
        username: paymentDataFields.username,
        address: paymentDataFields.address,
        amount: paymentDataFields.amount,
        comment: paymentDataFields.comment,
        timestamp: paymentDataFields.timestamp,
        receipient: paymentDataFields.receipient,
        receipients: paymentDataFields.receipients,
        txhash: paymentDataFields.txhash || '',
        USDprice: paymentDataFields.USDprice,
        paymenthash: paymentDataFields.paymenthash,
        owneraddress: paymentDataFields.owneraddress,
        data: {}, // Add this as it's required by the PaymentTransactions type
        status: 'pending' // Add a default status
      };
      
      // Send only the necessary payment data that matches the PaymentTransactions type
      await sendPayment(paymentTransaction);
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
              append(''); // Append an empty string instead of empty object
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
                {...register(`receipients.${index}` as const)} 
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
                  <Input placeholder='Amount of tokens' {...register("amount")} bg="white" type="number" />
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
                  <Input placeholder='Recipient' {...register("receipient")} bg="white" />
                </InputGroup>
                
                <InputGroup>
                  <Input placeholder='Payment Hash' {...register("paymenthash")} bg="white" />
                </InputGroup>
                
                <InputGroup>
                  <Input placeholder='Owner Address' {...register("owneraddress")} bg="white" />
                </InputGroup>
                
                <InputGroup>
                  <Input placeholder='Contract Owner Address' {...register("contractowneraddress")} bg="white" />
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
          {/* Use watch to get current form value */}
          <TransactionDisplay 
            account={currentAccount}
            username={PaymentformData.username || 'Nothing yet'}
            paymenthash={PaymentformData.paymenthash || 'Nothing yet'}
            receipients={PaymentformData.receipients || ['Nothing yet']}
            contractowneraddress={watch('contractowneraddress') || 'Nothing yet'}
            owneraddress={PaymentformData.owneraddress || 'Nothing yet'}
            amount={Number(PaymentformData.amount) || 0}
            usdPrice={Number(PaymentformData.USDprice) || 0}
          />
        </Box>
      </Box>
    </Grid>
  );
};

export default PaymentTransfer;