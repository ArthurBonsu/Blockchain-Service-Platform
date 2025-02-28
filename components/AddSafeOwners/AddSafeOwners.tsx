import { FC, useState, useCallback, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useLoadSafe } from '../../hooks/useLoadSafe';
import useSafeDetailsAndSetup from 'hooks/useSafeDetails.ts';
import { useRouter } from 'next/router';
import { SafecontractAddress } from 'constants/constants';
import { useUserStore } from 'stores/userStore';
import {
  Avatar,
  Button,
  Flex,
  Heading,
  Menu,
  useDisclosure,
  MenuButton,
  MenuList,
  Text,
  useClipboard,
  Input,
  Stack,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Box,
  Grid,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  chakra,
  ChakraProvider,
} from '@chakra-ui/react';
import { useAppToast } from 'hooks/index';
import { BsGithub, BsTwitter, BsGoogle } from 'react-icons/bs';
import { signInWithPopup } from 'firebase/auth';
import { GoogleAuthProvider, TwitterAuthProvider } from 'firebase/auth';
import { auth, db } from 'services/firebaseConfig';
import { useSafeStore } from 'stores/safeStore';
import { useEthersStore } from 'stores/ethersStore';
import { useForm } from 'react-hook-form';
import { NextPage } from 'next';

type FormData = {
  ownerAddress: string;
};

const AddOwners: NextPage = () => {
  const router = useRouter();
  const { replace } = useRouter();
  const [isBrowser, setIsBrowser] = useState(false);
  const useraddress = useEthersStore((state) => state.address);
  const userAddress = useEthersStore((state) => state.address);
  const { safeAddress, ownersAddress } = useSafeStore();
  const setOwnersAddress = useSafeStore((state) => state.setOwnersAddress);
  const {
    userAddToSafe,
    executeSafeTransaction,
    getSafeInfoUsed,
  } = useLoadSafe({ safeAddress, userAddress });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const {
    isPendingAddOwner,
    pendingAddOwnerData,
    setIsPendingAddOwner,
    setPendingAddOwnerData,
  } = useSafeStore();
  const [isAddingOwner, setIsAddingOwner] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsBrowser(true);
    }
  }, []);

  useEffect(() => {
    if (!useraddress) {
      replace('/');
    }
  }, [useraddress, replace]);

  useEffect(() => {
    if (session) {
      setTimeout(() => {
        router.push('/');
      }, 5000);
    }
  }, [session, router]);

  useEffect(() => {
    const handleGetSafeInfo = async () => {
      const safeInfo = await getSafeInfoUsed();
      console.log(safeInfo);
      setOwnersAddress([...ownersAddress, '0x...']);
    };
    handleGetSafeInfo();
  }, [getSafeInfoUsed, ownersAddress, setOwnersAddress]);

  const handleAddOwner = async (data: FormData) => {
    try {
      setIsPendingAddOwner(true);
      const progress = {
        currentStep: 1,
        totalSteps: 2,
      };
      setPendingAddOwnerData({
        status: 'Adding owner...',
        progress,
      });
      await userAddToSafe();
      progress.currentStep++;
      setPendingAddOwnerData({
        status: 'Updating owners list...',
        progress,
      });
      setOwnersAddress([...ownersAddress, data.ownerAddress]);
      console.log(`Owner added: ${data.ownerAddress}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPendingAddOwner(false);
      setPendingAddOwnerData(null);
    }
  };

  if (!isBrowser) return null;

  if (session) {
    return (
      <ChakraProvider>
        <Box maxW="md" mx="auto" mt={8}>
          <Heading mb={6}>You are already signed in</Heading>
          <Text>Redirecting to home page in 5 seconds...</Text>
        </Box>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <Box maxW="md" mx="auto" mt={8}>
        <Heading mb={6}>Add Owners</Heading>
        <VStack spacing={4}>
          <form onSubmit={handleSubmit(handleAddOwner)}>
            <FormControl>
            <FormLabel>Owner Address</FormLabel>
              <Input
                {...register('ownerAddress', {
                  required: 'Owner address is required',
                })}
                placeholder="Enter owner address"
              />
              {errors.ownerAddress && (
                <FormErrorMessage>
                  {errors.ownerAddress.message}
                </FormErrorMessage>
              )}
            </FormControl>
            <Button type="submit" disabled={isAddingOwner}>
              Add Owner
            </Button>
          </form>
          {ownersAddress.length > 0 && (
            <Text>
              Number of owners: {ownersAddress.length}
            </Text>
          )}
          {ownersAddress.map((owner, index) => (
            <Text key={index}>
              Owner {index + 1}: {owner}
            </Text>
          ))}
          {isPendingAddOwner && <Text>Loading...</Text>}
          {pendingAddOwnerData && (
            <Text>
              Current Status: {pendingAddOwnerData.status}
              <Button
                onClick={() => {
                  setPendingAddOwnerData(null);
                  setIsPendingAddOwner(false);
                }}
              >
                Cancel
              </Button>
            </Text>
          )}
          <Button onClick={() => router.push('/')}>
            Go back to homepage
          </Button>
          <Button onClick={() => router.push('/ProposeTransaction')}>
            Make a transaction
          </Button>
        </VStack>
      </Box>
    </ChakraProvider>
  );
};

export default AddOwners;