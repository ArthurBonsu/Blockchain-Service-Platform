import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Container, Heading, Text, VStack, Spinner, useToast } from '@chakra-ui/react';
import { useElectricityPaymentContext } from 'contexts/useElectricityPaymentContext';
import ElectricityPayment from 'components/ElectricityPayment';
import Layout from '@/unused/layout';


interface BillData {
  billId: string;
  houseId: string;
  amount: string;
  dueDate: string;
  isPaid: boolean;
  meterReadingStart: string;
  meterReadingEnd: string;
}

// Mock data for bills - in a real app, these would come from your contract
const mockBills: Record<string, BillData> = {
  'bill001': {
    billId: 'bill001',
    houseId: 'house001',
    amount: '50',
    dueDate: '1680172800', // Unix timestamp
    isPaid: false,
    meterReadingStart: '45678',
    meterReadingEnd: '46123'
  },
  'bill002': {
    billId: 'bill002',
    houseId: 'house001',
    amount: '45',
    dueDate: '1677494400',
    isPaid: true,
    meterReadingStart: '45123',
    meterReadingEnd: '45678'
  },
  'bill003': {
    billId: 'bill003',
    houseId: 'house002',
    amount: '60',
    dueDate: '1680172800',
    isPaid: false,
    meterReadingStart: '78901',
    meterReadingEnd: '79456'
  }
};

const PayElectricityBill = () => {
  const router = useRouter();
  const toast = useToast();
  const { billId } = router.query;
  const { currentAccount, isConnected, connectWallet } = useElectricityPaymentContext();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [billDetails, setBillDetails] = useState<BillData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (billId && typeof billId === 'string') {
      fetchBillDetails(billId);
    }
  }, [billId]);

  const fetchBillDetails = async (id: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would call your contract
      // For now, we'll use mock data
      const bill = mockBills[id];
      
      if (!bill) {
        setError('Bill not found');
        return;
      }
      
      if (bill.isPaid) {
        setError('This bill has already been paid');
        return;
      }
      
      setBillDetails(bill);
    } catch (error) {
      console.error('Error fetching bill details:', error);
      setError('Failed to fetch bill details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast({
      title: 'Payment Successful',
      description: 'Your electricity bill has been paid successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    
    // Redirect to bills page after successful payment
    router.push('/electricity-payment/bills');
  };

  if (!isConnected) {
    return (
      <Layout>
        <Container maxW="container.xl" py={10}>
          <VStack spacing={8}>
            <Heading>Connect Wallet</Heading>
            <Text>Please connect your wallet to pay electricity bills.</Text>
            <Box onClick={connectWallet} as="button" colorScheme="blue" p={4} borderRadius="md" bg="blue.500" color="white">
              Connect Wallet
            </Box>
          </VStack>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={10}>
        {isLoading ? (
          <VStack spacing={8}>
            <Spinner size="xl" />
            <Text>Loading bill details...</Text>
          </VStack>
        ) : error ? (
          <VStack spacing={8}>
            <Heading color="red.500">Error</Heading>
            <Text>{error}</Text>
            <Box onClick={() => router.push('/electricity-payment/bills')} as="button" colorScheme="blue" p={4} borderRadius="md" bg="blue.500" color="white">
              Back to Bills
            </Box>
          </VStack>
        ) : billDetails ? (
          <ElectricityPayment
            houseId={billDetails.houseId}
            address={currentAccount}
            billId={billDetails.billId}
            amount={parseFloat(billDetails.amount)}
            meterReading=""
            onPayElectricity={handlePaymentSuccess}
          />
        ) : (
          <VStack spacing={8}>
            <Heading>Bill Not Found</Heading>
            <Text>The requested bill could not be found.</Text>
            <Box onClick={() => router.push('/electricity-payment/bills')} as="button" colorScheme="blue" p={4} borderRadius="md" bg="blue.500" color="white">
              Back to Bills
            </Box>
          </VStack>
        )}
      </Container>
    </Layout>
  );
};

export default PayElectricityBill;