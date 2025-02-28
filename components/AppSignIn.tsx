import { useRouter } from 'next/router';
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
import { ComponentType, FC, useState, useEffect, useContext } from 'react';
import { useAppToast } from 'hooks/index';
import { useSession, signIn, signOut } from 'next-auth/react';
import { BsGithub, BsTwitter, BsGoogle } from 'react-icons/bs';
import { signInWithPopup } from 'firebase/auth';
import { GoogleAuthProvider, TwitterAuthProvider } from 'firebase/auth';
import { auth,db } from 'services/firebaseConfig';

const providers = [
  { name: 'github', Icon: BsGithub },
  { name: 'twitter', Icon: BsTwitter },
  { name: 'google', Icon: BsGoogle },
];

interface LoginProps {
  isCollapsed?: boolean;
  username?: string;
  email?: string;
  password?: string;
}

const SignIn: FC<LoginProps> = ({
  isCollapsed = false,
  username,
  email,
  password,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMethod, setAuthMethod] = useState<'oauth' | 'firebase' | null>(null);
  const { hasCopied, onCopy } = useClipboard(username || '');
  const [emailState, setEmail] = useState('');
  const toast = useAppToast();
  const stackSpacing = isCollapsed ? 4 : 1;
  const { data: session, status } = useSession();

  useEffect(() => {
    if (hasCopied) {
      toast.showToast('Login details copied', 'info');
    }
  }, [hasCopied, toast]);

  if (status === 'loading') return <Heading>Checking Authentication ...</Heading>;
  if (session) {
    setTimeout(() => {
      router.push('/');
    }, 5000);
    return <Heading>You are already signed in</Heading>;
  }

  const handleOAuthSignIn = (provider: string) => async () => {
    await signIn(provider);
  };

  const handleFirebaseGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/welcome');
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleFirebaseTwitterSignIn = async () => {
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

  return (
    <Box maxW="md" mx="auto" mt={8}>
      <Heading mb={6}>Sign In</Heading>
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
                onClick={handleOAuthSignIn(item.name)}
                textTransform="uppercase"
                w="100%"
              >
                Sign in with {item.name}
              </Button>
            </VStack>
          </Box>
        ))}
      </chakra.form>
      <Stack spacing={4} mt={4}>
        <Button colorScheme="blue" onClick={handleFirebaseGoogleSignIn}>
          Sign in with Google
        </Button>
        <Button colorScheme="twitter" onClick={handleFirebaseTwitterSignIn}>
          Sign in with Twitter
        </Button>
      </Stack>
    </Box>
  );
};

export default SignIn;