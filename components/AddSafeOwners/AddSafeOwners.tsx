import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  Heading,
  Text,
  Input,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Box,
  ChakraProvider,
  useToast
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useSafeContext } from '../../contexts/useSafeContext';
import { isAddress } from 'ethers';

type FormData = {
  ownerAddress: string;
};

const AddSafeOwners: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [isBrowser, setIsBrowser] = useState(false);

  // Destructure all required context methods and state
  const { 
    safeAddress, 
    addOwner, 
    ownersAddress, 
    getSafeInfoUsed,
    setOwnersAddress,
    setPendingAddOwnerData,
    isPendingAddOwner
  } = useSafeContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>();

  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');
  }, []);

  // Redirect if no safe address
  useEffect(() => {
    if (!safeAddress) {
      router.replace('/');
    }
  }, [safeAddress, router]);

  // Fetch safe info on component mount
  useEffect(() => {
    const fetchSafeInfo = async () => {
      try {
        const safeInfo = await getSafeInfoUsed();
        console.log('Safe Info:', safeInfo);
      } catch (error) {
        console.error('Error fetching safe info:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch safe information',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      }
    };

    if (safeAddress) {
      fetchSafeInfo();
    }
  }, [safeAddress, getSafeInfoUsed, toast]);

  const handleAddOwner = async (data: FormData) => {
    try {
      // Validate Ethereum address
      if (!isAddress(data.ownerAddress)) {
        throw new Error('Invalid Ethereum address');
      }

      // Set pending add owner state
      setPendingAddOwnerData({
        status: 'Adding owner...',
        progress: {
          currentStep: 1,
          totalSteps: 2
        }
      });

      // Add owner through context method
      await addOwner(data.ownerAddress);

      // Update owners list
      setOwnersAddress([...ownersAddress, data.ownerAddress]);

      // Show success toast
      toast({
        title: 'Owner Added',
        description: `Owner ${data.ownerAddress} successfully added to the safe`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      // Reset form
      reset();
    } catch (error) {
      console.error('Error adding owner:', error);
      
      // Show error toast
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add owner',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      // Reset pending add owner state
      setPendingAddOwnerData(null);
    }
  };

  // Prevent rendering on server
  if (!isBrowser) return null;

  return (
    <ChakraProvider>
      <Box maxW="md" mx="auto" mt={8}>
        <Heading mb={6}>Add Owners to Safe</Heading>
        
        <VStack spacing={4} align="stretch">
          {/* Owner Addition Form */}
          <form onSubmit={handleSubmit(handleAddOwner)}>
            <FormControl isInvalid={!!errors.ownerAddress}>
              <FormLabel>Owner Wallet Address</FormLabel>
              <Input
                {...register('ownerAddress', {
                  required: 'Owner address is required',
                  validate: (value) => 
                  isAddress(value) || 'Invalid Ethereum address'
                })}
                placeholder="Enter owner's wallet address"
              />
              {errors.ownerAddress && (
                <FormErrorMessage>
                  {errors.ownerAddress.message}
                </FormErrorMessage>
              )}
            </FormControl>
            
            <Button 
              mt={4} 
              colorScheme="blue" 
              type="submit" 
              isLoading={isSubmitting || isPendingAddOwner}
              width="full"
            >
              Add Owner
            </Button>
          </form>

          {/* Current Owners List */}
          {ownersAddress.length > 0 && (
            <Box>
              <Heading size="sm" mb={2}>Current Owners</Heading>
              {ownersAddress.map((owner, index) => (
                <Text key={owner} fontSize="sm">
                  Owner {index + 1}: {owner}
                </Text>
              ))}
            </Box>
          )}

          {/* Navigation Buttons */}
          <VStack spacing={2}>
            <Button 
              onClick={() => router.push('/')} 
              width="full"
              variant="outline"
            >
              Back to Home
            </Button>
            <Button 
              onClick={() => router.push('/ProposeTransaction')} 
              width="full"
              colorScheme="green"
            >
              Propose Transaction
            </Button>
          </VStack>
        </VStack>
      </Box>
    </ChakraProvider>
  );
};

export default AddSafeOwners;