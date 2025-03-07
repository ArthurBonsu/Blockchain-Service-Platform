"use client"
// pages/SecuredSwap.tsx
import dynamic from 'next/dynamic';
import { FC, useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import { ethers } from 'ethers';

// Dynamic imports to avoid server-side rendering issues
const Button = dynamic(() => import('@chakra-ui/react').then((module) => module.Button), {
  ssr: false,
});
const Input = dynamic(() => import('@chakra-ui/react').then((module) => module.Input), {
  ssr: false,
});
const Flex = dynamic(() => import('@chakra-ui/react').then((module) => module.Flex), {
  ssr: false,
});
const Box = dynamic(() => import('@chakra-ui/react').then((module) => module.Box), {
  ssr: false,
});
const Heading = dynamic(() => import('@chakra-ui/react').then((module) => module.Heading), {
  ssr: false,
});
const VStack = dynamic(() => import('@chakra-ui/react').then((module) => module.VStack), {
  ssr: false,
});

import NavBar from '@components/NavBar';
import Footer from '@components/Footer';
import { useEthersStore } from 'stores/ethersStore'
const SecuredSwap: FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { address, provider } = useEthersStore((state) => ({
    address: state.address,
    provider: state.provider,
  }));

  const [transactionHash, setTransactionHash] = useState<string>('');
  const [swapAmount, setSwapAmount] = useState<string>('');

  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: '/some' });
    router.push(data.url);
  };

  const handleSwap = async () => {
    if (!provider || !address) {
      console.error('Provider or address not found');
      return;
    }

    const signer = provider.getSigner();
    const swapContractAddress = '0xYourSwapContractAddress'; // Replace with your swap contract address
    const swapContractAbi: any = []; // Add your swap contract ABI here

    const swapContract = new ethers.Contract(swapContractAddress, swapContractAbi, signer);

    try {
      const tx = await swapContract.swap(ethers.utils.parseEther(swapAmount));
      setTransactionHash(tx.hash);
      console.log('Swap transaction hash:', tx.hash);
    } catch (error) {
      console.error('Swap transaction failed:', error);
    }
  };

  useEffect(() => {
    if (session) {
      // Load necessary data
    }
  }, [session]);

  if (status === 'loading') {
    return <Heading>Checking Authentication ...</Heading>;
  }

  return (
    <Flex direction="column" align="center" justify="center" minH="100vh" bg="gray.800" color="white">
      <NavBar title="Secured Swap" address={address} />
      <VStack spacing={4} mt={8}>
        {session ? (
          <>
            <Heading>Secured Swap</Heading>
            <Input
              placeholder="Enter amount to swap"
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
            />
            <Button onClick={handleSwap}>Swap</Button>
            {transactionHash && <Box>Transaction Hash: {transactionHash}</Box>}
            <Button onClick={handleSignOut}>Sign Out</Button>
          </>
        ) : (
          <>
            <Heading>You are not signed in</Heading>
            <Button onClick={() => signIn()}>Sign In</Button>
          </>
        )}
      </VStack>

      <Footer
        message="Please join us as we make this world a better place"
        community="Community"
        copyright="Trademark Policy"
        blog="Blog"
        FAQ="FAQ"
        Contact="blockdao@gmail.com"
        githubUrl="https://github.com/ArthurBonsu"
        twitterUrl="https://twitter.com/home"
        discordUrl="https://uniswap.org/blog/uniswap-v3"
      />
    </Flex>
  );
};

export default SecuredSwap;
