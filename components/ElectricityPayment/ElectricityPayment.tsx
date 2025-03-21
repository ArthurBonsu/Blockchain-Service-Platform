import { chakra, Heading, Stack, Button, Flex, useDisclosure, Box, Text, FormControl, FormLabel, NumberInput, NumberInputField, NumberDecrementStepper, NumberIncrementStepper, NumberInputStepper, Input, Grid, InputGroup, InputRightAddon, FormHelperText, AlertDialog, Alert, AlertIcon, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { FC, useRef, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

// Contexts
import { useElectricityPaymentContext } from '../../contexts/useElectricityPaymentContext';

interface ElectricityPaymentProps {
  houseId: string;
  address: string;
  billId: string;
  amount: number;
  meterReading: string;
  dueDate?: Date;
  onPayElectricity: () => void;
}

interface ElectricityBillDisplayProps {
  account: string;
  houseId: string;
  billId: string;
  amount: number;
  dueDate: string;
  meterReadingStart: string;
  meterReadingEnd: string;
  isPaid: boolean;
}

// Bill Display Component
const ElectricityBillDisplay: React.FC<ElectricityBillDisplayProps> = ({ 
  account, 
  houseId, 
  billId, 
  amount, 
  dueDate, 
  meterReadingStart, 
  meterReadingEnd,
  isPaid 
}) => {
  return (
    <Stack spacing={6}>
      <Box maxW='sm' borderWidth='1px' borderRadius='lg' overflow='hidden' p={5}>
        <Heading as='h2' size='lg' mb={4}> 
          Electricity Bill Details
        </Heading>
        
        <Stack spacing={2}>
          <Flex justifyContent="space-between">
            <Text fontWeight="bold">House ID:</Text>
            <Text>{houseId}</Text>
          </Flex>
          
          <Flex justifyContent="space-between">
            <Text fontWeight="bold">Bill ID:</Text>
            <Text>{billId}</Text>
          </Flex>
          
          <Flex justifyContent="space-between">
            <Text fontWeight="bold">Wallet Address:</Text>
            <Text>{account.substring(0, 6)}...{account.substring(account.length - 4)}</Text>
          </Flex>
          
          <Flex justifyContent="space-between">
            <Text fontWeight="bold">Amount Due:</Text>
            <Text>{amount} tokens</Text>
          </Flex>
          
          <Flex justifyContent="space-between">
            <Text fontWeight="bold">Due Date:</Text>
            <Text>{dueDate}</Text>
          </Flex>
          
          <Flex justifyContent="space-between">
            <Text fontWeight="bold">Starting Meter Reading:</Text>
            <Text>{meterReadingStart}</Text>
          </Flex>
          
          <Flex justifyContent="space-between">
            <Text fontWeight="bold">Ending Meter Reading:</Text>
            <Text>{meterReadingEnd}</Text>
          </Flex>
          
          <Flex justifyContent="space-between">
            <Text fontWeight="bold">Status:</Text>
            <Text color={isPaid ? "green.500" : "red.500"}>
              {isPaid ? "Paid" : "Unpaid"}
            </Text>
          </Flex>
        </Stack>
      </Box>
    </Stack>
  );
};

// Payment History Item Component
const PaymentHistoryItem: React.FC<{
  paymentHash: string;
  amount: number;
  timestamp: string;
  meterReading: string;
}> = ({ paymentHash, amount, timestamp, meterReading }) => {
  return (
    <Box borderWidth="1px" borderRadius="md" p={3} mb={3}>
      <Flex justifyContent="space-between" mb={2}>
        <Text fontWeight="bold">Payment Hash:</Text>
        <Text>{paymentHash.substring(0, 8)}...{paymentHash.substring(paymentHash.length - 8)}</Text>
      </Flex>
      <Flex justifyContent="space-between" mb={2}>
        <Text fontWeight="bold">Amount:</Text>
        <Text>{amount} tokens</Text>
      </Flex>
      <Flex justifyContent="space-between" mb={2}>
        <Text fontWeight="bold">Date:</Text>
        <Text>{timestamp}</Text>
      </Flex>
      <Flex justifyContent="space-between">
        <Text fontWeight="bold">Meter Reading:</Text>
        <Text>{meterReading}</Text>
      </Flex>
    </Box>
  );
};

// Main Electricity Payment Component
const ElectricityPayment = ({
  houseId,
  address,
  billId,
  amount,
  meterReading,
  dueDate,
  onPayElectricity,
  ...rest
}: ElectricityPaymentProps) => {
  const { 
    currentAccount,
    electricityFormData,
    payBill,
    isLoading,
    billDetails,
    paymentHistory,
    fetchBillDetails,
    fetchPaymentHistory,
    approveTokenSpending,
    isApproved,
    errorMessage,
    clearError
  } = useElectricityPaymentContext();

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMeterReading, setCurrentMeterReading] = useState("");
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Form validation schema
  const schema = yup.object({
    houseId: yup.string().required("House ID is required"),
    billId: yup.string().required("Bill ID is required"),
    meterReading: yup.string().required("Current meter reading is required")
  }).required();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<Omit<ElectricityPaymentProps, 'onPayElectricity'>>({
    resolver: yupResolver(schema),
    defaultValues: {
      houseId,
      billId,
      amount,
      meterReading: ""
    }
  });

  useEffect(() => {
    if (billId) {
      fetchBillDetails(billId);
    }
    if (houseId) {
      fetchPaymentHistory(houseId);
    }
  }, [billId, houseId, fetchBillDetails, fetchPaymentHistory]);

  useEffect(() => {
    if (houseId) setValue('houseId', houseId);
    if (billId) setValue('billId', billId);
    if (amount) setValue('amount', amount);
  }, [houseId, billId, amount, setValue]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // First ensure tokens are approved for spending
      if (!isApproved) {
        await approveTokenSpending(data.amount);
      }
      
      // Then pay the bill
      await payBill(data.billId, data.meterReading);
      onPayElectricity();
      
      // Refresh data
      fetchBillDetails(data.billId);
      fetchPaymentHistory(data.houseId);
    } catch (error) {
      console.error("Payment failed:", error);
      onOpen(); // Open error dialog
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Grid placeItems="center" w="full" minH="100vh" py={10}>
      <Box w="600px" shadow="lg" p="8" borderRadius="md" bg="white">
        <Heading as="h1" size="xl" mb={6} textAlign="center">
          House Electricity Payment Portal
        </Heading>

        {/* Bill Details Display */}
        {billDetails && (
          <ElectricityBillDisplay
            account={currentAccount}
            houseId={billDetails.houseId}
            billId={billDetails.billId}
            amount={Number(billDetails.amount)}
            dueDate={formatDate(Number(billDetails.dueDate))}
            meterReadingStart={billDetails.meterReadingStart}
            meterReadingEnd={billDetails.meterReadingEnd}
            isPaid={billDetails.isPaid}
          />
        )}

        {/* Payment Form */}
        {billDetails && !billDetails.isPaid && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4} mt={6}>
              <FormControl isInvalid={!!errors.billId}>
                <FormLabel>Bill ID</FormLabel>
                <Input {...register("billId")} isReadOnly />
              </FormControl>

              <FormControl isInvalid={!!errors.houseId}>
                <FormLabel>House ID</FormLabel>
                <Input {...register("houseId")} isReadOnly />
              </FormControl>

              <FormControl isInvalid={!!errors.amount}>
                <FormLabel>Amount (Tokens)</FormLabel>
                <Input {...register("amount")} isReadOnly />
              </FormControl>

              <FormControl isInvalid={!!errors.meterReading}>
                <FormLabel>Current Meter Reading</FormLabel>
                <Input 
                  {...register("meterReading")} 
                  placeholder="Enter your current meter reading"
                  onChange={(e) => setCurrentMeterReading(e.target.value)}
                />
                {errors.meterReading && <Text color="red.500">{errors.meterReading.message}</Text>}
              </FormControl>

              <Button
                colorScheme="blue"
                type="submit"
                isLoading={isSubmitting || isLoading}
                loadingText="Processing Payment"
                mt={4}
                size="lg"
                w="full"
              >
                {isApproved ? "Pay Bill" : "Approve & Pay Bill"}
              </Button>
            </Stack>
          </form>
        )}

        {/* Payment History */}
        {paymentHistory && paymentHistory.length > 0 && (
          <Box mt={8}>
            <Heading as="h3" size="md" mb={4}>
              Payment History
            </Heading>
            {paymentHistory.map((payment, index) => (
              <PaymentHistoryItem
                key={index}
                paymentHash={payment.paymentHash}
                amount={Number(payment.amount)}
                timestamp={formatDate(Number(payment.timestamp))}
                meterReading={payment.meterReading}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Error Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Payment Error
            </AlertDialogHeader>

            <AlertDialogBody>
              {errorMessage || "An error occurred while processing your payment. Please try again."}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => {
                onClose();
                clearError();
              }}>
                Close
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Grid>
  );
};

export default ElectricityPayment;