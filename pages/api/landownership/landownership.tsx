import React from 'react';
import { NextPage } from 'next';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Flex, Center, Box, Heading, Button } from '@chakra-ui/react';
import NavBar from '@/components/NavBar/NavBar';
import Footer from '@/components/Footer/Footer';
import LandOwnership from '@/components/LandOwnership/LandOwnership';

const LandOwnershipPage: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    const result = await signOut({ redirect: false, callbackUrl: '/' });
    router.push(result.url);
  };

  return (
    <Flex direction="column" minHeight="100vh">
      <NavBar 
        title="Land Ownership"
        address={session?.user?.email || null}
      />
      <Center flex="1">
        <Box textAlign="center" width="100%" maxWidth="800px" p={4}>
          {session ? (
            <>
              <Heading mb={4}>Land Ownership</Heading>
              <LandOwnership />
              <Button 
                mt={4} 
                colorScheme="red" 
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Heading mb={4}>Please Sign In</Heading>
              <Button 
                colorScheme="blue" 
                onClick={() => signIn()}
              >
                Sign In
              </Button>
            </>
          )}
        </Box>
      </Center>
      <Footer
        message="Thank you for using our Land Ownership dApp!" 
        community="Join our Community"
        copyright="© 2023 BlockDAO. All rights reserved."
        blog="BlockDAO Blog"
        FAQ="Frequently Asked Questions"
        Contact="Contact Us" 
        githubUrl="https://github.com/blockdao"
        twitterUrl="https://twitter.com/blockdao" 
        discordUrl="https://discord.gg/blockdao"
      />
    </Flex>
  );
};

export default LandOwnershipPage;