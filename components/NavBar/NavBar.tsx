import { Avatar, Button, Flex, Heading, Stack, Menu, MenuButton, MenuList, Text, useClipboard, VStack, } from '@chakra-ui/react';
import { ChevronUpIcon, DuplicateIcon, LockClosedIcon, LoginIcon, } from '@heroicons/react/outline';
import { LogoutIcon } from '@heroicons/react/solid';
import Link from 'next/link';
import { FC, useEffect, useState, useContext } from 'react';
import Blockies from 'react-blockies';
import CreateTransfer from 'components/CreateSafe';
import { useAppToast } from 'hooks/index';
import getHiddenVersion from 'utils/getHiddenName';
import { HiMenuAlt4 } from 'react-icons/hi';
import { AiOutlineClose } from 'react-icons/ai';
import logo from '../images/blockdaologo.png';

// STORES
import { useSwapStore } from 'stores/ContextStores/walletStore';
import { useEthersStore } from 'stores/ethersStore';
import { useSafeStore } from 'stores/safeStore';
import { useTransactionStore } from 'stores/transactionStore';
import { useUserStore } from 'stores/userStore';

// HOOKS
import useEthers from 'hooks/useEthers';
import useFetch from 'hooks/useFetch';
import useLoadSafe from 'hooks/useLoadSafe';
import useTransactions from 'hooks/useTokenTransactions';

// Context
import useCrowdsourceContext from 'context/useCrowdsourceContext';
import useDaoContext from 'context/useDaoContext';
import useSwapContext from 'context/useSwapContext';
import useTransactionContext from 'context/useTransactionContext';
import useTransferContext from 'context/usegetAllTransactionsContext';

interface NavBarProps {
  title: string;
  address: string | null;
}

const NavBar: React.FC<NavBarProps> = ({ title, address }) => {
  const { onDisconnect } = useEthers();
  const { hasCopied, onCopy } = useClipboard(address || '');
  const toast = useAppToast();
  const [safeAddress, setSafeAddress] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const { isLoading, checkIsSigned, ...rest } = useLoadSafe({ safeAddress, userAddress });

  const [toggleMenu, setToggleMenu] = useState(false);

  useEffect(() => {
    if (hasCopied) {
      toast.showToast('Address copied to clipboard', 'info');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCopied]);

  return (
    <>
      <Stack spacing={6}>
        <Heading as="h2" size="xl"> 
          Welcome To Block Dao 
        </Heading>
      </Stack>
      <Avatar 
        src="/logo.png" 
        name={process.env.appName} 
        size="xs" 
        borderRadius="md" 
        cursor="pointer" 
      />
      <nav className="w-full flex md:justify-center justify-between items-center p-4">
        <div className="md:flex-[0.5] flex-initial justify-center items-center">
          <Avatar 
            src="/logo.png" 
            name={process.env.appName} 
            size="xs" 
            borderRadius="md" 
            cursor="pointer" 
          />
        </div>
        <ul className="text-white md:flex hidden list-none flex-row justify-between items-center flex-initial">
          {[
            'Market', 
            'Exchange', 
            'Tutorials', 
            'Wallets', 
          ].map((item, index) => (
            <NavBar 
              key={item + index} 
              title={item} 
              address={address} 
            />
          ))}
          <li className="bg-[#2952e3] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#2546bd]"> 
            Login 
          </li>
        </ul>
        <div className="flex relative">
          {!toggleMenu && (
            <HiMenuAlt4 
              fontSize={28} 
              className="text-white md:hidden cursor-pointer" 
              onClick={() => setToggleMenu(true)} 
            />
          )}
          {toggleMenu && (
            <AiOutlineClose 
              fontSize={28} 
              className="text-white md:hidden cursor-pointer" 
              onClick={() => setToggleMenu(false)} 
            />
          )}
          {toggleMenu && (
            <ul className="z-10 fixed -top-0 -right-2 p-3 w-[70vw] h-screen shadow-2xl md:hidden list-none flex flex-col justify-start items-end rounded-md blue-glassmorphism text-white animate-slide-in">
              <li className="text-xl w-full my-2"> 
                <AiOutlineClose onClick={() => setToggleMenu(false)} /> 
              </li>{[
                'Market', 
                'Exchange', 
                'Tutorials', 
                'Wallets', 
              ].map((item, index) => (
                <NavBar 
                  key={item + index} 
                  title={item} 
                  address={address} 
                />
              ))}
            </ul>
          )}
        </div>
      </nav>
    </>
  );
};

export default NavBar;