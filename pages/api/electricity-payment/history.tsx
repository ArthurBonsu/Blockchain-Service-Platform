import { useState, useEffect, useCallback } from 'react';
import { Box, Container, Heading, Text, Button, VStack, Table, Thead, Tbody, Tr, Th, Td, Spinner, useToast, Select, FormControl, FormLabel, HStack, Badge, Flex, Tooltip } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useElectricityPaymentContext } from 'contexts/useElectricityPaymentContext';

import { FiDownload } from 'react-icons/fi';
import Layout from '@/unused/layout';

interface HouseData {
  id: string;
  address: string;
}

const mockHouses: HouseData[] = [
  { id: 'house001', address: '123 Blockchain Street' },
  { id: 'house002', address: '456 Ethereum Avenue' },
  { id: 'house003', address: '789 Smart Contract Road'   }
];

const ElectricityPaymentHistory = () => {
  const router = useRouter();
  const toast = useToast();
  const { currentAccount, isConnected, connectWallet } = useElectricityPaymentContext();
  
  const [selectedHouse, setSelectedHouse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [houses, setHouses] = useState<HouseData[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  
  useEffect(() => {
    // In a real app, this would fetch data from your contract or backend
    // For now, we'll use mock data
    setHouses(mockHouses);
    setPayments(mockPayments);
  }, []);
  
  const filterPayments = useCallback(() => {
    let filtered = payments.filter(payment => payment.houseId === selectedHouse);
    
    // Filter by month if selected
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(payment => {
        const date = new Date(parseInt(payment.timestamp) * 1000);
        const month = date.getMonth().toString();
        return month === selectedMonth;
      });
    }
    
    // Sort by timestamp (most recent first)
    filtered.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
    
    setFilteredPayments(filtered);
  }, [selectedHouse, selectedMonth, payments]);
  
  useEffect(() => {
    if (selectedHouse) {
      filterPayments();
    } else {
      setFilteredPayments([]);
    }
  }, [selectedHouse, selectedMonth, payments, filterPayments]);
  
  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };
  
  const formatTime = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleTimeString();
  };
  
  const shortenHash = (hash: string) => {
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };
  
  const getMonthName = (monthIndex: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  };
  
  const exportPaymentHistory = () => {
    // Create CSV content
    const headers = ['Payment Hash', 'Date', 'Time', 'Amount', 'Meter Reading'];
    const csvRows = [headers.join(',')];
    
    filteredPayments.forEach(payment => {
      const row = [
        payment.paymentHash,
        formatDate(payment.timestamp),
        formatTime(payment.timestamp),
        payment.amount,
        payment.meterReading
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `payment-history-${selectedHouse}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: 'Export Successful',
      description: 'Payment history has been exported as CSV.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  if (!isConnected) {
    return (
      <Layout>
        <Container maxW="container.xl" py={10}>
          <VStack spacing={8}>
            <Heading>Connect Wallet</Heading>
            <Text>Please connect your wallet to view payment history.</Text>
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
            Electricity Payment History
          </Heading>
          
          <HStack spacing={6}>
            <Box flex="1">
              <FormControl id="house-select">
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
            
            <Box flex="1">
              <FormControl id="month-select">
                <FormLabel>Filter by Month</FormLabel>
                <Select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="all">All Time</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i.toString()}>
                      {getMonthName(i)}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </HStack>
          
          {selectedHouse ? (
            <>
              {filteredPayments.length > 0 ? (
                <Box>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Text fontSize="lg" fontWeight="bold">
                      Found {filteredPayments.length} payment records
                    </Text>
                    <Button 
                      leftIcon={<FiDownload />} 
                      colorScheme="blue" 
                      variant="outline"
                      onClick={exportPaymentHistory}
                    >
                      Export CSV
                    </Button>
                  </Flex>
                  
                  <Box overflowX="auto">
                    <Table variant="simple" colorScheme="blue">
                      <Thead>
                        <Tr>
                          <Th>Date & Time</Th>
                          <Th>Payment Hash</Th>
                          <Th isNumeric>Amount (Tokens)</Th>
                          <Th>Meter Reading</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredPayments.map((payment, index) => (
                          <Tr key={index}>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text>{formatDate(payment.timestamp)}</Text>
                                <Text fontSize="sm" color="gray.500">
                                  {formatTime(payment.timestamp)}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              <Tooltip label={payment.paymentHash}>
                                {shortenHash(payment.paymentHash)}
                              </Tooltip>
                            </Td>
                            <Td isNumeric>{payment.amount}</Td>
                            <Td>{payment.meterReading}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              ) : (
                <Box textAlign="center" p={10} borderWidth="1px" borderRadius="lg">
                  <Text fontSize="xl">No payment records found for this house.</Text>
                </Box>
              )}
            </>
          ) : (
            <Box textAlign="center" p={10} borderWidth="1px" borderRadius="lg">
              <Text fontSize="xl">Please select a house to view payment history.</Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Layout>
  );
};

export default ElectricityPaymentHistory;

interface PaymentData {
  paymentHash: string;
  houseId: string;
  payer: string;
  amount: string;
  timestamp: string;
  meterReading: string;
}

// Mock data for payments - in a real app, these would come from your contract
const mockPayments: PaymentData[] = [
  {
    paymentHash: '0x7a1d4f234c90b91ae1a01b83f691c7d904476bc8f4d6b25a3154fe9c11a0e1a2',
    houseId: 'house001',
    payer: '0x1234567890123456789012345678901234567890',
    amount: '50',
    timestamp: '1675267200', // Unix timestamp
    meterReading: '46123'
  },
  {
    paymentHash: '0x8b2e5f345d01c92bf7b12a94f802d38a15e5c9d4a3f7c36a4e265eb10b14f2b3',
    houseId: 'house001',
    payer: '0x1234567890123456789012345678901234567890',
    amount: '45',
    timestamp: '1672675200',
    meterReading: '45678'
  },
  {
    paymentHash: '0x9c3f6a456e12d83ca8d23b05e913f49b26f7d0a5b6e8c47c5f379fd22c35d3c4',
    houseId: 'house002',
    payer: '0x2345678901234567890123456789012345678901',
    amount: '60',
    timestamp: '1675267200',
    meterReading: '79456'
  }];