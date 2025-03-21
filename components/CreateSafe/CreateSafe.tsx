import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { FC, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { SafecontractAddress } from 'constants/constants';
import { useEthersStore } from 'stores/ethersStore';
import { useSafeContext } from '../../contexts/useSafeContext';

const CreateSafe: FC = () => {
  const router = useRouter();
  const [isBrowser, setIsBrowser] = useState(false);
  const useraddress = useEthersStore((state) => state.address);
  const toast = useToast();
  const { data: session } = useSession();

  // Use SafeContext methods and state
  const { 
    safeAddress, 
    setSafeAddress, 
    setOwnersAddress, 
    setUpMultiSigSafeAddress,
    isPendingSafeCreation,
    pendingSafeData,
    setIsPendingSafeCreation,
    setPendingSafeData
  } = useSafeContext();

  const [isCreatingSafe, setIsCreatingSafe] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsBrowser(true);
    }
  }, []);

  useEffect(() => {
    const storedPendingSafeData = localStorage.getItem('pendingSafeData');
    if (storedPendingSafeData) {
      setPendingSafeData(JSON.parse(storedPendingSafeData));
      setIsPendingSafeCreation(true);
    }
  }, [setIsPendingSafeCreation, setPendingSafeData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPendingSafeData(null);
      setIsPendingSafeCreation(false);
    }, 30000); // 30 seconds
    return () => clearTimeout(timeoutId);
  }, [setIsPendingSafeCreation, setPendingSafeData]);

  const handleCreateSafe = async () => {
    setIsCreatingSafe(true);
    try {
      const progress = { currentStep: 1, totalSteps: 2 };
      setPendingSafeData({ status: 'Creating safe...', progress });
      
      // Use context method to set up multi-sig safe address
      const newSafeAddress = await setUpMultiSigSafeAddress(SafecontractAddress);
      
      progress.currentStep++;
      setPendingSafeData({ status: 'Deploying contract...', progress });
      
      // Update safe address and owners
      setSafeAddress(newSafeAddress);
      setOwnersAddress([]); // Reset owners list
      
      setIsCreatingSafe(false);
      console.log(`Safe Address: ${newSafeAddress}`);
      
      router.push('/AddSafeOwners'); // Route to AddSafeOwners page
      
      // Clear pending safe data
      setPendingSafeData(null);
      setIsPendingSafeCreation(false);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error creating safe',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset states on error
      setIsCreatingSafe(false);
      setPendingSafeData(null);
      setIsPendingSafeCreation(false);
    }
  };

  if (!isBrowser) {
    return <Heading>Loading...</Heading>;
  }

  if (session) {
    setTimeout(() => {
      router.push('/'); // Route to Home page
    }, 5000);
    return (
      <Box maxW="md" mx="auto" mt={8}>
        <Heading mb={6}>You are already signed in</Heading>
        <Text>Redirecting to home page in 5 seconds...</Text>
      </Box>
    );
  }

  return (
    <Box maxW="md" mx="auto" mt={8}>
      <Heading mb={6}>Sign Up</Heading>
      <VStack spacing={4}>
        <Button
          onClick={handleCreateSafe}
          disabled={isCreatingSafe || isPendingSafeCreation}
        >
          Create Safe
        </Button>
        {isPendingSafeCreation && <Text>Loading...</Text>}
        {safeAddress && (
          <Text>
            Safe Address: <code>{safeAddress}</code>
          </Text>
        )}
        {pendingSafeData && (
          <Text>
            Current Status: {pendingSafeData.status}
            <Button
              onClick={() => {
                setPendingSafeData(null);
                setIsPendingSafeCreation(false);
              }}
            >
              Cancel
            </Button>
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default CreateSafe;