import React, { FC, useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import NavBar from '@components/NavBar';
import Footer from '@components/Footer';
import SimpleTransfer from '@components/SimpleTransfer';
import { useEthersStore } from 'stores/ethersStore';

const Box = dynamic(() => import('@chakra-ui/react').then((module) => module.Box), { ssr: false });
const Flex = dynamic(() => import('@chakra-ui/react').then((module) => module.Flex), { ssr: false });
const Heading = dynamic(() => import('@chakra-ui/react').then((module) => module.Heading), { ssr: false });
const Button = dynamic(() => import('@chakra-ui/react').then((module) => module.Button), { ssr: false });
const HStack = dynamic(() => import('@chakra-ui/react').then((module) => module.HStack), { ssr: false });
const Center = dynamic(() => import('@chakra-ui/react').then((module) => module.Center), { ssr: false });

const IoChevronUpSharp = dynamic(() => import('react-icons/io5').then((module) => module.IoChevronUpSharp), { ssr: false });
const IoDuplicateSharp = dynamic(() => import('react-icons/io5').then((module) => module.IoDuplicateSharp), { ssr: false });
const IoLockClosedSharp = dynamic(() => import('react-icons/io5').then((module) => module.IoLockClosedSharp), { ssr: false });
const IoLogInSharp = dynamic(() => import('react-icons/io5').then((module) => module.IoLogInSharp), { ssr: false });
const IoPersonAddSharp = dynamic(() => import('react-icons/io5').then((module) => module.IoPersonAddSharp), { ssr: false });
const IoAddSharp = dynamic(() => import('react-icons/io5').then((module) => module.IoAddSharp), { ssr: false });
const IoBookSharp = dynamic(() => import('react-icons/io5').then((module) => module.IoBookSharp), { ssr: false });
const IoCubeSharp = dynamic(() => import('react-icons/io5').then((module) => module.IoCubeSharp), { ssr: false });

const BsGraphUp = dynamic(() => import('react-icons/bs').then((module) => module.BsGraphUp), { ssr: false });
const BsFillPersonFill = dynamic(() => import('react-icons/bs').then((module) => module.BsFillPersonFill), { ssr: false });

const HiMenuAlt4 = dynamic(() => import('react-icons/hi').then((module) => module.HiMenuAlt4), { ssr: false });
const AiOutlineClose = dynamic(() => import('react-icons/ai').then((module) => module.AiOutlineClose), { ssr: false });

const SwapTransfer: FC = () => {
  const { data: session } = useSession();
  const [isCurrentPage, setIsCurrentPage] = useState(false);
  const { push } = useRouter();
  const address = useEthersStore((state: { address: string }) => state.address);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // code that uses window or document
    }
  }, [session]);

  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: '/some' });
    push(data.url);
  };

  return (
    <Flex color='white'>
      <Center w='100px' bg='green.500'>
        <HStack spacing='24px'>
          {session ? (
            <>
              <div className="min-h-screen">
                <div className='gradient-bg-welcome'>
                  <Heading> You are signed in as {session.user?.email || 'Unknown User'} </Heading>
                  <NavBar title={'Swap Transfer'} address={address || '0x.. '} />
                  <Button> Sign Out</Button>
                  <Button onClick={async () => handleSignOut()}>Sign In</Button>
                </div>
                <SimpleTransfer />
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
              <Heading> You are not signed in </Heading>
              <Button onClick={async () => signIn()}> Sign In </Button>
            </>
          )}
        </HStack>
      </Center>
    </Flex>
  );
};

export default SwapTransfer;
