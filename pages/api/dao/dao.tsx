import { FC } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Flex, Center, Box, Heading, Button } from '@chakra-ui/react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import DAO from '@/components/DAO/DAO'; // Import the DAO component
import { useEthersStore } from '@/stores/ethersStore';

const DAOPage: FC = () => {
  const { data: session } = useSession();
  const address = useEthersStore((state) => state.address);
  const { push } = useRouter();

  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: '/' });
    push(data.url);
  };

  return (
    <Flex color='white' direction="column" minH="100vh">
      <NavBar title={'DAO Service'} address={address} />
      
      <Center w="full" py={6} flex="1">
        {session ? (
          <Box width="100%" maxW="1200px" mx="auto">
            <DAO />
            {/* Pass required props to DAO component as needed */}
            <Button onClick={handleSignOut} mt={4}>Sign Out</Button>
          </Box>
        ) : (
          <Box textAlign="center">
            <Heading mb={4}>You are not signed in</Heading>
            <Button onClick={() => signIn()}>Sign In</Button>
          </Box>
        )}
      </Center>
      
      <Footer
        message={'Please join us as we make this world a better place'}
        community={'Community'}
        copyright={'Trademark Policy'}
        blog={'Blog'}
        FAQ={'FAQ'}
        Contact={'blockdao@gmail.com'}
        githubUrl={'https://github.com/ArthurBonsu'}
        twitterUrl={'https://twitter.com/home'}
        discordUrl={'https://uniswap.org/blog/uniswap-v3'}
      />
    </Flex>
  );
};

export default DAOPage;