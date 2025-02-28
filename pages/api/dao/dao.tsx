import { FC, useState, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Flex, Center, HStack, Heading, Button } from '@chakra-ui/react';
import NavBar from '@components/NavBar';
import SimpleTransfer from '@components/SimpleTransfer';
import Footer from '@components/Footer';
import Services from '@components/Services'; // Ensure this component is properly implemented or imported
import Transactions from '@components/Transaction'; // Ensure this component is properly implemented or imported

import { FaChevronUp, FaClone, FaLock, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { HiMenuAlt4 } from 'react-icons/hi';
import { AiOutlineClose } from 'react-icons/ai';
import logo from '../images/blockdaologo.png';
import { useEthersStore } from 'stores/ethersStore';
import { BiEnvelope } from "react-icons/bi";
const DAO: FC = () => {
  const { data: session } = useSession();
  const [isCurrentPage, setIsCurrentPage] = useState(false);
  const [isRegistration, setIsRegistration] = useState(false);
  const [isTransaction, setIsTransaction] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // Explicitly define the type of the 'state' parameter
  const address = useEthersStore((state: { address: string }) => state.address);

  const { push } = useRouter();

  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: '/some' });
    push(data.url);
  };

  return (
    <Flex color='white' direction="column" minH="100vh">
      <Center w="full" bg="green.500" py={6}>
        <HStack spacing="24px">
          {session ? (
            <>
              <div className='min-h-screen'>
                <div className='gradient-bg-welcome'>
                  <Heading mb={4}>
                    You are signed in as {session?.user?.email || 'Guest'}
                  </Heading>
                  <NavBar
                    title={'Dao Page For Blockchain'}
                    address={address}
                  />
                  <SimpleTransfer />
                  <Button onClick={handleSignOut} mt={4}>Sign Out</Button>
                </div>
                {/* Include other components as needed */}
                <Services
                  color="primary"
                  title="DAO Service"
                  icon={<BiEnvelope />}
                  subtitle="Service Sub"
                />
                <Transactions />
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
              </div>
            </>
          ) : (
            <>
              <Heading mb={4}>You are not signed in</Heading>
              <Button onClick={() => signIn()}>Sign In</Button>
            </>
          )}
        </HStack>
      </Center>
    </Flex>
  );
};

export default DAO;
