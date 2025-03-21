import React, { useState, useEffect, useMemo } from 'react';
import { NextPage } from 'next';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  useToast,
  Spinner
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

// Import Safe-related components
import CreateSafe from '@/components/CreateSafe/CreateSafe';
import AddSafeOwners from '@/components/AddSafeOwners/AddSafeOwners';
import LoadSafeTransfer from '@/components/LoadSafeTransfer/LoadSafeTransfer';

// Import SafeContext
import { useSafeContext } from '@/contexts/useSafeContext';

// Fallback components for SafeAssets and SafeTransfers
const SafeAssets: React.FC<{ safeAddress: string }> = ({ safeAddress }) => (
  <Box>Safe Assets for {safeAddress}</Box>
);

const SafeTransfers: React.FC<{ safeAddress: string }> = ({ safeAddress }) => (
  <Box>Safe Transfers for {safeAddress}</Box>
);

// Define interfaces for type safety
interface SafeInfo {
  // Add specific properties of safe info
  [key: string]: any;
}

const SafePage: NextPage = () => {
  const router = useRouter();
  const toast = useToast();

  // Use SafeContext for comprehensive safe management
  const { 
    safeAddress, 
    ownersAddress, 
    isPendingSafeCreation, 
    pendingSafeData,
    getSafeInfoUsed,
    getSafeOwners,
    userAddToSafe,
    currentAccount
  } = useSafeContext();

  // State with explicit typing
  const [safeInfo, setSafeInfo] = useState<SafeInfo | null>(null);
  const [currentOwners, setCurrentOwners] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Memoized safe status
  const safeSummary = useMemo(() => {
    if (!safeAddress) return null;
    return {
      address: safeAddress,
      ownerCount: currentOwners.length
    };
  }, [safeAddress, currentOwners]);

  // Fetch Safe Information
  useEffect(() => {
    const fetchSafeInfo = async () => {
      if (!safeAddress) return;

      setIsLoading(true);
      try {
        const info = await getSafeInfoUsed();
        setSafeInfo(info);

        const owners = await getSafeOwners({ safeAddress });
        setCurrentOwners(owners);
      } catch (error) {
        toast({
          title: 'Error Fetching Safe Info',
          description: error instanceof Error ? error.message : 'Unknown error',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSafeInfo();
  }, [safeAddress, getSafeInfoUsed, getSafeOwners, toast]);

  // Auto-add user to Safe
  useEffect(() => {
    const addUserToSafe = async () => {
      if (safeAddress && currentAccount && !currentOwners.includes(currentAccount)) {
        try {
          await userAddToSafe();
          toast({
            title: 'User Added to Safe',
            status: 'success',
            duration: 3000,
            isClosable: true
          });
        } catch (error) {
          toast({
            title: 'Error Adding User to Safe',
            description: error instanceof Error ? error.message : 'Unknown error',
            status: 'error',
            duration: 5000,
            isClosable: true
          });
        }
      }
    };

    addUserToSafe();
  }, [safeAddress, currentAccount, currentOwners, userAddToSafe, toast]);

  return (
    <Box p={6} maxWidth="container.xl" margin="auto">
      <VStack spacing={6} align="stretch">
        <Heading>Safe Management</Heading>
        
        {/* Safe Status and Information */}
        {isLoading ? (
          <Spinner size="xl" />
        ) : safeSummary ? (
          <Box>
            <Text>
              <strong>Safe Address:</strong> {safeSummary.address}
            </Text>
            <Text>
              <strong>Owners:</strong> {safeSummary.ownerCount}
            </Text>
          </Box>
        ) : (
          <Text color="gray.500">No Safe created yet</Text>
        )}

        {/* Safe Management Tabs */}
        <Tabs variant="soft-rounded" colorScheme="green">
          <TabList mb={4}>
            <Tab>Create Safe</Tab>
            <Tab>Add Owners</Tab>
            <Tab>Safe Assets</Tab>
            <Tab>Safe Transfers</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <CreateSafe />
            </TabPanel>
            <TabPanel>
              <AddSafeOwners />
            </TabPanel>
            <TabPanel>
              {safeAddress ? <SafeAssets safeAddress={safeAddress} /> : 'Create a Safe first'}
            </TabPanel>
            <TabPanel>
              {safeAddress ? <SafeTransfers safeAddress={safeAddress} /> : 'Create a Safe first'}
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Pending Safe Creation Status */}
        {isPendingSafeCreation && pendingSafeData && (
          <Box>
            <Text>
              <strong>Status:</strong> {pendingSafeData.status}
            </Text>
            {pendingSafeData.progress && (
              <Text>
                Step {pendingSafeData.progress.currentStep} of {pendingSafeData.progress.totalSteps}
              </Text>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default SafePage;