import { useState, useEffect, useCallback } from 'react';
import { Box, Container, Heading, Text, Button, VStack, SimpleGrid, Flex, Spinner, useToast, Input, FormControl, FormLabel, Select } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useElectricityPaymentContext } from 'contexts/useElectricityPaymentContext';
import Layout from 'components/Layout';

interface HouseData {
  id: string;
  address: string;
}

const mockHouses: HouseData[] = [
  { id: 'house001', address: '123 Blockchain Street' },
  { id: 'house002', address: '456 Ethereum Avenue' },
  { id: 'house003', address: '789 Smart Contract Road' }
];

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
const mockBills: BillData[] = [
  {
    billId: 'bill001',
    houseId: 'house001',
    amount: '50',
    dueDate: '1680172800', // Unix timestamp
    isPaid: false,
    meterReadingStart: '45678',
    meterReadingEnd: '46123'
  },
  {
    billId: 'bill002',
    houseId: 'house001',
    amount: '45',
    dueDate: '1677494400',
    isPaid: true,
    meterReadingStart: '45123',
    meterReadingEnd: '45678'
  },
  {
    billId: 'bill003',
    houseId: 'house002',
    amount: '60',
    dueDate: '1680172800',
    isPaid: false,
    meterReadingStart: '78901',
    meterReadingEnd: '79456'
  }
];

const ElectricityBills = () => {
  const router = useRouter();
  const toast = useToast();
  const { currentAccount, isConnected, connectWallet } = useElectricityPaymentContext();
  
  const [selectedHouse, setSelectedHouse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bills, setBills] = useState<BillData[]>([]);
  const [houses, setHouses] = useState<HouseData[]>([]);

  useEffect(() => {
    // In a real app, this would fetch data from your contract or backend
    // For now, we'll use mock data
    setHouses(mockHouses);
  }, []);

  const fetchBills = useCallback(async (houseId: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would call your contract
      // For now, we'll use mock data filtered by houseId
      const filteredBills = mockBills.filter(bill => bill.houseId === houseId);
      setBills(filteredBills);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch bills. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedHouse) {
      fetchBills(selectedHouse);
    }
  }, [selectedHouse, fetchBills]);

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  const handlePayBill = (billId: string) => {
    router.push(`/electricity-payment/pay?billId=${billId}`);
  };

  if (!isConnected) {
    return (
      <Layout>
        <Container maxW="container.xl" py={10}>
          <VStack spacing={8}>
            <Heading>Connect Wallet</Heading>
            <Text>Please connect your wallet to view electricity bills.</Text>
            <Button colorScheme="blue" onClick={connectWallet}>
              Connect Wallet
            </Button>
          </VStack>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl">
            Your Electricity Bills
          </Heading>

          <Box>
            <FormControl id="house-select" mb={6}>
              <FormLabel>Select House</FormLabel>
              <Select 
                placeholder="Select a house" 
                value={selectedHouse}
                onChange={(e) => setSelectedHouse(e.target.value)}
              >
                {houses.map((house) => (
                  <option key={house.id} value={house.id}>
                    {house.address} (ID: {house.id})
                  </option>
                ))}
              </Select>
            </FormControl>
          </Box>

          {isLoading ? (
            <Flex justify="center" p={10}>
              <Spinner size="xl" />
            </Flex>
          ) : (
            <>
              {selectedHouse ? (
                bills.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {bills.map((bill) => (
                      <BillCard 
                        key={bill.billId}
                        bill={bill}
                        onPayBill={handlePayBill}
                      />
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box textAlign="center" p={10}>
                    <Text fontSize="xl">No bills found for this house.</Text>
                  </Box>
                )
              ) : (
                <Box textAlign="center" p={10}>
                  <Text fontSize="xl">Please select a house to view bills.</Text>
                </Box>
              )}
            </>
          )}
        </VStack>
      </Container>
    </Layout>
  );
};

interface BillCardProps {
  bill: BillData;
  onPayBill: (billId: string) => void;
}

const BillCard: React.FC<BillCardProps> = ({ bill, onPayBill }) => {
  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      p={6}
      boxShadow="md"
      bg={bill.isPaid ? 'green.50' : 'red.50'}
      borderColor={bill.isPaid ? 'green.200' : 'red.200'}
    >
      <VStack spacing={3} align="stretch">
        <Heading as="h3" size="md">
          Bill #{bill.billId}
        </Heading>
        
        <Flex justify="space-between">
          <Text fontWeight="bold">Amount:</Text>
          <Text>{bill.amount} tokens</Text>
        </Flex>
        
        <Flex justify="space-between">
          <Text fontWeight="bold">Due Date:</Text>
          <Text>{formatDate(bill.dueDate)}</Text>
        </Flex>
        
        <Flex justify="space-between">
          <Text fontWeight="bold">Meter Reading:</Text>
          <Text>{bill.meterReadingStart} - {bill.meterReadingEnd}</Text>
        </Flex>
        
        <Flex justify="space-between">
          <Text fontWeight="bold">Status:</Text>
          <Text color={bill.isPaid ? 'green.500' : 'red.500'}>
            {bill.isPaid ? 'Paid' : 'Unpaid'}
          </Text>
        </Flex>
        
        {!bill.isPaid && (
          <Button 
            colorScheme="blue" 
            onClick={() => onPayBill(bill.billId)}
            mt={2}
          >
            Pay Now
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default ElectricityBills;