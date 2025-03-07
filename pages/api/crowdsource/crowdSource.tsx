import React from 'react';
import { NextPage } from 'next';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { 
  Flex, 
  Center, 
  Box, 
  Heading, 
  Button 
} from '@chakra-ui/react';

// Import components
import NavBar from '@/components/NavBar/NavBar';
import Footer from '@/components/Footer/Footer';
import CrowdSource from '@/components/CrowdSource/CrowdSource';

// Import stores
import { useEthersStore } from '@/stores/ethersStore';

// Define props for Footer component
interface FooterProps {
  message: string;
  community: string;
  copyright: string;
  blog: string;
  FAQ: string;
  Contact: string;
  githubUrl: string;
  twitterUrl: string;
  discordUrl: string;
}

const CrowdSourcePage: NextPage = () => {
  // Hooks
  const { data: session } = useSession();
  const address = useEthersStore((state) => state.address);
  const router = useRouter();

  // Sign out handler
  const handleSignOut = async () => {
    try {
      const data = await signOut({ 
        redirect: false, 
        callbackUrl: '/' 
      });
      router.push(data.url);
    } catch (error) {
      console.error('Sign out failed', error);
    }
  };

  // Footer props
  const footerProps: FooterProps = {
    message: 'Please join us as we make this world a better place',
    community: 'Community',
    copyright: 'Trademark Policy',
    blog: 'Blog',
    FAQ: 'FAQ',
    Contact: 'blockdao@gmail.com',
    githubUrl: 'https://github.com/ArthurBonsu',
    twitterUrl: 'https://twitter.com/home',
    discordUrl: 'https://uniswap.org/blog/uniswap-v3'
  };

  return (
    <Flex 
      color='white' 
      direction="column" 
      minHeight="100vh"
    >
      <NavBar 
        title={'Crowdsource Platform'} 
        address={address} 
      />
      
      <Center width="full" py={6} flex={1}>
        {session ? (
          <Box width="100%" maxWidth="1200px" mx="auto">
            <CrowdSource userAddress={address} />
            <Button 
              onClick={handleSignOut} 
              mt={4} 
              colorScheme="red"
            >
              Sign Out
            </Button>
          </Box>
        ) : (
          <Box textAlign="center">
            <Heading mb={4}>You are not signed in</Heading>
            <Button 
              onClick={() => signIn()} 
              colorScheme="blue"
            >
              Sign In
            </Button>
          </Box>
        )}
      </Center>
      
      <Footer {...footerProps} />
    </Flex>
  );
};

export default CrowdSourcePage;