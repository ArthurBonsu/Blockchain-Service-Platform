// components/LandOwnership/EnhancedLandOwnership.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Flex,
  Box,
  Heading,
  Text,
  Input,
  Stack,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import AppModal from '../AppModal/AppModal';
import { useLandOwnershipContext } from '@/contexts/LandOwnershipContext';
import { useEthersStore } from '@/stores/ethersStore';
import { useSafeStore } from '@/stores/safeStore';
import { useTransactionStore } from '@/stores/transactionStore';

// Geohash utility (you'd want to import a proper geohash library)
import * as geohash from 'ngeohash';

export interface LandOwnershipProps {
  landId?: number;
  landOwner?: string;
  landLocation?: string;
  landSize?: number;
  landPrice?: number;
}

export const LandOwnership: React.FC<LandOwnershipProps> = ({
  landId = 0,
  landOwner = '',
  landLocation = '',
  landSize = 0,
  landPrice = 0,
  ...rest
}) => {
  // Contexts and Stores
  const {
    connectWallet,
    currentAccount,
    isLoading,
    sendTransaction,
    handleChange,
    formData,
    registerLand,
    transferLand,
    updateLandPrice,
    buyLand,
    getLandDetails,
    getAllLands,
    landRegistry
  } = useLandOwnershipContext();

  // Local State
  const [isLandOwner, setIsLandOwner] = useState(false);
  const [isLandAvailable, setIsLandAvailable] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [selectedLandId, setSelectedLandId] = useState(landId);
  const [newLandDetails, setNewLandDetails] = useState({
    location: '',
    size: 0,
    price: 0,
    newOwner: '',
    partialSize: 0,
    geohash: ''
  });
  const [landPriceHistory, setLandPriceHistory] = useState([]);
  const [royaltyBalance, setRoyaltyBalance] = useState(0);

  // Modal Controls
  const viewDetailsDisclosure = useDisclosure();
  const registerLandDisclosure = useDisclosure();
  const transferLandDisclosure = useDisclosure();
  const updatePriceDisclosure = useDisclosure();
  const priceHistoryDisclosure = useDisclosure();
  const partialTransferDisclosure = useDisclosure();

  // Geohash Generation Utility
  const generateGeohash = (lat: number, lon: number) => {
    return geohash.encode(lat, lon);
  };

  // Handle Geolocation for Land Registration
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const generatedGeohash = generateGeohash(latitude, longitude);
        setNewLandDetails(prev => ({
          ...prev,
          geohash: generatedGeohash
        }));
      }, (error) => {
        console.error("Geolocation error:", error);
        alert("Could not retrieve location. Please enter manually.");
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Enhanced Land Registration
  const handleRegisterLand = async () => {
    if (!newLandDetails.location || 
        newLandDetails.size <= 0 || 
        newLandDetails.price <= 0 ||
        !newLandDetails.geohash) {
      alert('Please fill in all land details, including geohash');
      return;
    }
    
    try {
      const txHash = await registerLand({
        landId: 0, // Will be assigned by contract
        landOwner: currentAccount,
        landLocation: newLandDetails.location,
        landSize: newLandDetails.size,
        landPrice: newLandDetails.price,
        geohash: newLandDetails.geohash
      });
      
      setTransactionHash(txHash);
      registerLandDisclosure.onClose();
      getAllLands(); // Refresh land registry
    } catch (error) {
      console.error('Error registering land:', error);
    }
  };

  // Partial Land Transfer
  const handlePartialLandTransfer = async () => {
    if (!newLandDetails.newOwner || newLandDetails.partialSize <= 0) {
      alert('Please enter a new owner and partial size');
      return;
    }
    
    try {
      const txHash =// Continued from previous artifact
      await transferLand(
        selectedLandId, 
        newLandDetails.newOwner, 
        newLandDetails.partialSize
      );
      
      setTransactionHash(txHash);
      partialTransferDisclosure.onClose();
      getAllLands(); // Refresh land registry
    } catch (error) {
      console.error('Error transferring partial land:', error);
    }
  };

  // Fetch Price History
  const fetchLandPriceHistory = async (landId: number) => {
    try {
      // You would implement this method in your context/service
      const history = await getLandPriceHistory(landId);
      setLandPriceHistory(history);
      priceHistoryDisclosure.onOpen();
    } catch (error) {
      console.error('Error fetching price history:', error);
    }
  };

  // Claim Royalties
  const handleClaimRoyalties = async () => {
    try {
      // You would implement this method in your context/service
      const txHash = await claimRoyalties();
      setTransactionHash(txHash);
      // Refresh royalty balance
      const balance = await getRoyaltyBalance(currentAccount);
      setRoyaltyBalance(balance);
    } catch (error) {
      console.error('Error claiming royalties:', error);
    }
  };

  return (
    <Box p={5}>
      <Heading size="lg" mb={4}>Enhanced Land Registry</Heading>
      
      {!currentAccount ? (
        <Button colorScheme="blue" onClick={connectWallet} mb={4}>
          Connect Wallet
        </Button>
      ) : (
        <Tabs variant="soft-rounded" colorScheme="green">
          <TabList mb={4}>
            <Tab>Land Registry</Tab>
            <Tab>Royalties</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <Button 
                colorScheme="green" 
                onClick={registerLandDisclosure.onOpen} 
                mb={4} 
                mr={2}
              >
                Register New Land
              </Button>
              
              <Box mt={4}>
                <Heading size="md" mb={3}>Your Land Portfolio</Heading>
                {landRegistry.length > 0 ? (
                  <Stack spacing={4}>
                    {landRegistry.map((land) => (
                      <Box 
                        key={land.landId} 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md"
                        position="relative"
                      >
                        <VStack align="stretch" spacing={2}>
                          <HStack justifyContent="space-between">
                            <Text><strong>ID:</strong> {land.landId}</Text>
                            <Badge 
                              colorScheme={land.isActive ? "green" : "red"}
                            >
                              {land.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </HStack>
                          <Text><strong>Location:</strong> {land.landLocation}</Text>
                          <Text><strong>Geohash:</strong> {land.geohash}</Text>
                          <Text><strong>Size:</strong> {land.landSize} sqm</Text>
                          <Text><strong>Price:</strong> {land.landPrice} ETH</Text>
                          
                          <Flex justifyContent="space-between" mt={2}>
                            <Button 
                              size="sm" 
                              colorScheme="blue" 
                              onClick={() => {
                                setSelectedLandId(land.landId);
                                fetchLandPriceHistory(land.landId);
                              }}
                            >
                              Price History
                            </Button>
                            
                            {land.landOwner === currentAccount && (
                              <HStack>
                                <Button 
                                  size="sm" 
                                  colorScheme="green"
                                  onClick={() => {
                                    setSelectedLandId(land.landId);
                                    partialTransferDisclosure.onOpen();
                                  }}
                                >
                                  Partial Transfer
                                </Button>
                                <Button 
                                  size="sm" 
                                  colorScheme="orange"
                                  onClick={() => {
                                    setSelectedLandId(land.landId);
                                    updatePriceDisclosure.onOpen();
                                  }}
                                >
                                  Update Price
                                </Button>
                              </HStack>
                            )}
                          </Flex>
                        </VStack>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Text>No lands registered yet</Text>
                )}
              </Box>
            </TabPanel>
            
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Box 
                  p={4} 
                  borderWidth="1px" 
                  borderRadius="md"
                >
                  <Heading size="md" mb={3}>Royalty Balance</Heading>
                  <Text fontSize="2xl" fontWeight="bold">
                    {royaltyBalance} ETH
                  </Text>
                  <Button 
                    colorScheme="green" 
                    mt={2}
                    onClick={handleClaimRoyalties}
                    isDisabled={royaltyBalance <= 0}
                  >
                    Claim Royalties
                  </Button>
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
      
      {/* Modals */}
      {/* Register Land Modal */}
      <AppModal
        disclosure={registerLandDisclosure}
        title="Register New Land"
        modalSize="md"
      >
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>Location</FormLabel>
            <Input 
              placeholder="Enter land location" 
              value={newLandDetails.location}
              onChange={(e) => setNewLandDetails({...newLandDetails, location: e.target.value})}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Geohash</FormLabel>
            <HStack>
              <Input 
                placeholder="Geohash" 
                value={newLandDetails.geohash}
                onChange={(e) => setNewLandDetails({...newLandDetails, geohash: e.target.value})}
              />
              <Button onClick={handleGetLocation} colorScheme="blue">
                Get Location
              </Button>
            </HStack>
          </FormControl>
          
          <FormControl>
            <FormLabel>Size (sqm)</FormLabel>
            <NumberInput>
              <NumberInputField 
                placeholder="Enter size in square meters" 
                value={newLandDetails.size || ''}
                onChange={(e) => setNewLandDetails({...newLandDetails, size: parseFloat(e.target.value)})}
              />
            </NumberInput>
          </FormControl>
          
          <FormControl>
            <FormLabel>Price (ETH)</FormLabel>
            <NumberInput>
              <NumberInputField 
                placeholder="Enter price in ETH" 
                value={newLandDetails.price || ''}
                onChange={(e) => setNewLandDetails({...newLandDetails, price: parseFloat(e.target.value)})}
              />
            </NumberInput>
          </FormControl>
          
          <Button 
            colorScheme="green" 
            onClick={handleRegisterLand}
            isLoading={isLoading}
          >
            Register Land
          </Button>
        </Stack>
      </AppModal>
      
      {/* Partial Transfer Modal */}
      <AppModal
        disclosure={partialTransferDisclosure}
        title="Partial Land Transfer"
        modalSize="md"
      >
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>New Owner Address</FormLabel>
            <Input 
              placeholder="Enter address of new owner" 
              value={newLandDetails.newOwner}
              onChange={(e) => setNewLandDetails({...newLandDetails, newOwner: e.target.value})}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Partial Size (sqm)</FormLabel>
            <NumberInput>
              <NumberInputField 
                placeholder="Enter partial size to transfer" 
                value={newLandDetails.partialSize || ''}
                onChange={(e) => setNewLandDetails({...newLandDetails, partialSize: parseFloat(e.target.value)})}
              />
            </NumberInput>
          </FormControl>
          
          <Button 
            colorScheme="blue" 
            onClick={handlePartialLandTransfer}
            isLoading={isLoading}
          >
            Transfer Partial Land
          </Button>
        </Stack>
      </AppModal>
      
      {/* Price History Modal */}
      <Modal 
        isOpen={priceHistoryDisclosure.isOpen} 
        onClose={priceHistoryDisclosure.onClose}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Land Price History</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Price (ETH)</Th>
                  <Th>Date</Th>
                  <Th>Recorded By</Th>
                </Tr>
              </Thead>
              <Tbody>
                {landPriceHistory.map((record, index) => (
                  <Tr key={index}>
                    <Td>{record.price}</Td>
                    <Td>
                      {new Date(record.timestamp * 1000).toLocaleString()}
                    </Td>
                    <Td>{record.recorder}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LandOwnership;