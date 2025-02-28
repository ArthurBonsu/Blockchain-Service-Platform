// AppSignup.tsx
import {
  Avatar,
  Button,
  Flex,
  Heading,
  Menu,
  ButtonProps,
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
} from '@chakra-ui/react';
import { FC, useState, useEffect, useContext } from 'react';
import { useAppToast } from 'hooks/index';
import { useSession, signIn, signOut } from 'next-auth/react';
import { BsGithub, BsTwitter, BsGoogle } from 'react-icons/bs';
import { signInWithPopup } from 'firebase/auth';
import { GoogleAuthProvider, TwitterAuthProvider } from 'firebase/auth';
import { auth, db } from '../../services/firebaseConfig';
import { useRouter } from 'next/router';

const providers = [
  {
    name: 'github',
    Icon: BsGithub,
  },
  {
    name: 'twitter',
    Icon: BsTwitter,
  },
  {
    name: 'google',
    Icon: BsGoogle,
  },
];

interface SignupProps {
  isCollapsed?: boolean;
  username?: string;
  email?: string;
  password?: string;
}

const AppSignup: FC<SignupProps> = ({
  isCollapsed = false,
  username,
  email,
  password,
}) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [authMethod, setAuthMethod] = useState<'oauth' | 'firebase' | null>(null);

  const router = useRouter();
  const { hasCopied, onCopy } = useClipboard(username || '');
  const toast = useAppToast();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsBrowser(true);
    }
  }, []);

  useEffect(() => {
    if (hasCopied) {
      toast.showToast('Signup details copied', 'info');
    }
  }, [hasCopied, toast]);

  if (!isBrowser) return <Heading>Loading...</Heading>;

  if (status === 'loading') return <Heading>Checking Authentication ...</Heading>;

  if (session) {
    setTimeout(() => {
      router.push('/');
    }, 5000);
    return <Heading>You are already signed up</Heading>;
  }

  const handleOAuthSignUp = (provider: string) => async () => {
    await signIn(provider);
  };

  const handleFirebaseGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/welcome');
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleFirebaseTwitterSignUp = async () => {
    const provider = new TwitterAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/welcome');
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return false;
    signIn('email', { email, redirect: false });
  };

  const setEmail = (email: string) => {
    return email;
  };

  const stackSpacing = isCollapsed ? 4 : 1;

  return (
    <Box maxW="md" mx="auto" mt={8}>
      <Heading mb={6}>Sign Up</Heading>
      {!authMethod && (
        <VStack spacing={4}>
          <Button onClick={() => setAuthMethod('oauth')}>
            Sign up with OAuth
          </Button>
          <Button onClick={() => setAuthMethod('firebase')}>
            Sign up with Firebase
          </Button>
        </VStack>
      )}
      {authMethod === 'oauth' && (
        <>
          <chakra.form onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel>Email Address</FormLabel>
              <Input type="email" onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            {providers.map((item, index) => (
              <Box key={index}>
                <VStack>
                  <Button
                    type="submit"
                    key={item.name}
                    leftIcon={<item.Icon />}
                    onClick={handleOAuthSignUp(item.name)}
                    textTransform="uppercase"
                    w="100%"
                  >
                    Sign up with {item.name}
                  </Button>
                </VStack>
              </Box>
            ))}
          </chakra.form>
        </>
      )}
    {authMethod === 'firebase' && (
  <Stack spacing={4} mt={4}>
    <Button colorScheme="blue" onClick={handleFirebaseGoogleSignUp}>
      Sign up with Google
    </Button>
    <Button colorScheme="twitter" onClick={handleFirebaseTwitterSignUp}>
      Sign up with Twitter
    </Button>
    <Button
      mt={4}
      colorScheme="teal"
      onClick={() => router.push('/signup')}
    >
      Sign Up With Email And Password
    </Button>
  </Stack>
)}
    </Box>
  );
};

export default AppSignup;
