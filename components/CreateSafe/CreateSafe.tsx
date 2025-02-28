
// CreateSafe.tsx
import {
  Box,
  Button,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  Text,
  useClipboard,
  Input,
  Stack,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Grid,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  chakra,
  useToast,
} from '@chakra-ui/react';
import { FC, useState, useEffect, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useLoadSafe } from '../../hooks/useLoadSafe';
import useSafeDetailsAndSetup from 'hooks/useSafeDetails.ts';
import { useRouter } from 'next/router';
import { SafecontractAddress } from 'constants/constants';
import { useUserStore } from 'stores/userStore';
import { useSafeStore } from 'stores/safeStore';
import { useEthersStore } from 'stores/ethersStore';
import { BsGithub, BsTwitter, BsGoogle } from 'react-icons/bs';
import { signInWithPopup } from 'firebase/auth';
import { GoogleAuthProvider, TwitterAuthProvider } from 'firebase/auth';
import { auth, db } from 'services/firebaseConfig';
import { useAppToast } from 'hooks/index';

const { setUpMultiSigSafeAddress } = useSafeDetailsAndSetup;

const CreateSafe: FC = () => {
  const router = useRouter();
  const [isBrowser, setIsBrowser] = useState(false);
  const useraddress = useEthersStore((state) => state.address);
  const toast = useToast();
  const { data: session, status } = useSession();
  const safeStore = useSafeStore();
  const { safeAddress, ownersAddress, contractAddress } = safeStore;
  const { setSafeAddress, setOwnersAddress, setContractAddress, setSafeStore } = safeStore;
  const [isCreatingSafe, setIsCreatingSafe] = useState(false);
  const { executeSafeTransaction, userAddToSafe, isLoading } = useLoadSafe({
    safeAddress,
    userAddress: useraddress,
  });
  const { isPendingSafeCreation, pendingSafeData, setIsPendingSafeCreation, setPendingSafeData } = useSafeStore();

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
      const newSafeAddress = await setUpMultiSigSafeAddress(SafecontractAddress);
      progress.currentStep++;
      setPendingSafeData({ status: 'Deploying contract...', progress });
      setSafeAddress(newSafeAddress);
      setOwnersAddress([]); // Update ownersAddress state
      setSafeStore({ safeAddress: newSafeAddress, contractAddress: SafecontractAddress });
      setIsCreatingSafe(false);
      console.log(`Safe Address: ${newSafeAddress}`);
      router.push('/AddSafeOwners'); // Route to AddSafeOwners page
      setPendingSafeData(null); // Clear pending safe data
      setIsPendingSafeCreation(false); // Set isPendingSafeCreation to false
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error creating safe',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
          disabled={isCreatingSafe || isLoading}
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
