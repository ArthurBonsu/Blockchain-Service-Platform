// CSV.tsx
import React, { useRef , useState, useEffect } from 'react';
import {
  Stack,
  Heading,
  Button,
  Flex,
  useDisclosure,
  AlertDialog,
  Alert,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  chakra,
  AlertDialogHeader,
  AlertDialogOverlay,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import {
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInputStepper,
  Input,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useQuery, QueryClient, QueryClientProvider } from 'react-query';

// Create a client
const queryClient = new QueryClient();

// Wrap your app with QueryClientProvider
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CSVSubmit />
    </QueryClientProvider>
  );
}

interface CSVProps {
  rows: Array<any>;
  date: string;
  pvvalue: number;
  timestamp: string;
  transaction_type: string;
  token: string;
  amount: number;
}


const CSVSubmit = () => {
  const cancelRef = useRef(null);
  const [portfolioDetails, setPortfolioDetails] = useState([]);
  const [value, setValue] = useState('');
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [_tokenselect, setTokenSelected] = useState('');
  const [datePicker, setDatePicker] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CSVProps>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data, isLoading, error } = useQuery(
    'transactions',
    async () => {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    {
      retry: 3,
      staleTime: 10000,
    }
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsFormLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        Error: {(error as any)?.message ?? 'An unknown error occurred'}
      </div>
    );
  }

  const handleTokenSelect = (token: string) => {
    setTokenSelected(token);
  };

  const handleDatePick = (date: any) => {
    setDatePicker(date);
  };

  const handleCSVSubmit = async (data: any) => {
    const csvData = {
      rows: data.rows,
      transaction_type: data.transaction_type,
      token: data.token,
      amount: data.amount,
    };

    try {
      const response = await fetch('/api/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(csvData),
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Flex direction="column" align="center" justify="center" p={6}>
      <Heading as="h1" size="4xl" noOfLines={1}>
        CSV Upload
      </Heading>
      <form onSubmit={handleSubmit(handleCSVSubmit)}>
        <Stack spacing={6}>
          <FormControl isInvalid={!!errors.token}>
            <FormLabel>Token</FormLabel>
            <Input {...register('token', { required: true })} placeholder="Select token" />
            <FormErrorMessage>
              {errors.token?.message || 'Error with token'}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.date}>
            <FormLabel>Date</FormLabel>
            <Input {...register('date', { required: true })} type="date" placeholder="Select date" />
            <FormErrorMessage>
              {errors.date?.message || 'Error with date'}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.pvvalue}>
            <FormLabel>PV Value</FormLabel>
            <NumberInput>
              <NumberInputField {...register('pvvalue', { required: true })} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormErrorMessage>
              {errors.pvvalue?.message || 'Error with PV value'}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.timestamp}>
            <FormLabel>Timestamp</FormLabel>
            <Input {...register('timestamp', { required: true })} type="datetime-local" />
            <FormErrorMessage>
              {errors.timestamp?.message || 'Error with timestamp'}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.transaction_type}>
            <FormLabel>Transaction Type</FormLabel>
            <Input {...register('transaction_type', { required: true })} placeholder="Select transaction type" />
            <FormErrorMessage>
              {errors.transaction_type?.message || 'Error with transaction type'}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.amount}>
            <FormLabel>Amount</FormLabel>
            <NumberInput>
              <NumberInputField {...register('amount', { required: true })} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormErrorMessage>
              {errors.amount?.message || 'Error with amount'}
            </FormErrorMessage>
          </FormControl>

          <Button type="submit" isLoading={isFormLoading}>
            Submit
          </Button>
        </Stack>
      </form>

      {isOpen && (
  <AlertDialog
    leastDestructiveRef={cancelRef}
    isOpen={isOpen}
    onClose={onClose}
    motionPreset="slideInBottom"
  >
    <AlertDialogOverlay />
    <AlertDialogContent>
      <AlertDialogHeader>Confirmation</AlertDialogHeader>
      <AlertDialogCloseButton />
      <AlertDialogBody>
        Are you sure you want to submit the CSV data?
      </AlertDialogBody>
      <AlertDialogFooter>
        <Button ref={cancelRef} onClick={onClose}>
          Cancel
        </Button>
        <Button ml={3} onClick={handleCSVSubmit}>
          Confirm
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}

      {data && (
        <Stack spacing={6} mt={6}>
          <Heading as="h2" size="xl">
            CSV Data
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Token</Th>
                <Th>Transaction Type</Th>
                <Th>Amount</Th>
                <Th>Timestamp</Th>
              </Tr>
            </Thead>
            <Tbody>
            {data.map((row: any, index: number) => (
  <Tr key={index}>
    <Td>{row.token}</Td>
    <Td>{row.transaction_type}</Td>
    <Td>{row.amount}</Td>
    <Td>{row.timestamp}</Td>
  </Tr>
))}
            </Tbody>
          </Table>
        </Stack>
      )}
    </Flex>
  );
};

export default CSVSubmit;