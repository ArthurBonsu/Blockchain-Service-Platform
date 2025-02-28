// AppSidebar.tsx
import React, { FC, useEffect, useState, useContext } from 'react';
import {
  Avatar,
  Flex,
  Heading,
  VStack,
  useClipboard,
  Icon,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
} from '@chakra-ui/react';
import { FaChevronUp, FaCopy, FaLock, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import Link from 'next/link';
import Blockies from 'react-blockies';
import CreateSafe from '@components/CreateSafe';
import { useAppToast, useEthers } from 'hooks/index';
import getHiddenVersion from 'utils/getHiddenName';

interface AppSidebarProps {
  isCollapsed?: boolean;
  address: string | null;
}

const AppSidebar: FC<AppSidebarProps> = ({ isCollapsed = false, address }) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const { onDisconnect } = useEthers();
  const { hasCopied, onCopy } = useClipboard(address || '');
  const toast = useAppToast();
  const stackSpacing = isCollapsed ? 4 : 1;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsBrowser(true);
    }
  }, []);

  useEffect(() => {
    if (hasCopied) {
      toast.showToast('Address copied to clipboard', 'info');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCopied]);

  if (!isBrowser) return null;

  return (
    <Flex
      pos="fixed"
      w={isCollapsed ? 14 : 52}
      bg="#F9F9F9"
      h="100vh"
      flexDir="column"
      justifyContent="space-between"
    >
      <Flex flexDir="column">
        <Flex
          p="24px 16px 16px"
          alignItems="center"
          {...(isCollapsed && { justifyContent: 'center' })}
          borderBottom="1px solid #E5E7EB"
        >
          <Link href={{ pathname: '/' }}>
            <Avatar
              src="/logo.png"
              name={process.env.appName}
              size="xs"
              borderRadius="md"
              cursor="pointer"
            />
          </Link>
          {!isCollapsed && (
            <Heading ml="6px" as="h4" fontSize={12} mb={0}>
              {process.env.appName}
            </Heading>
          )}
        </Flex>
        <VStack px={2} mt={3} spacing={stackSpacing} alignItems="start">
          <CreateSafe />
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              p={1}
              mt={4}
              _hover={{ background: 'rgba(0, 0, 0, 0.04)' }}
              {...(!isCollapsed && { rightIcon: <FaChevronUp /> })}
            >
              <Flex
                alignItems="center"
                {...(isCollapsed && { justifyContent: 'center' })}
              >
                {address ? (
                  <Blockies
                    seed={address}
                    color="orange"
                    bgColor="gray"
                    spotColor="yellow"
                  />
                ) : (
                  <Avatar
                    size={isCollapsed ? 'xs' : 'sm'}
                    borderRadius="md"
                    name={process.env.appName}
                    src="/logo.png"
                  />
                )}
                {!isCollapsed && (
                  <Flex flexDir="column" ml={2} alignItems="start">
                    <Heading maxW="124px" as="h4" size="xs" mb={0}>
                      {getHiddenVersion(address || '')}
                    </Heading>
                    <Text
                      maxW="124px"
                      lineHeight="shorter"
                      fontSize="smaller"
                      color="gray.800"
                      isTruncated
                    >
                      Wallet Address
                    </Text>
                  </Flex>
                )}
              </Flex>
            </MenuButton>
            <MenuList mb={3} p={2} minW="175px">
              <VStack spacing={1} alignItems="start">
                <Button leftIcon={<Icon as={FaCopy} />} variant="ghost" onClick={onCopy}>
                  Copy address
                </Button>
                <Button
                  leftIcon={<Icon as={FaSignOutAlt} />}
                  variant="ghost"
                  onClick={onDisconnect}
                >
                  Disconnect
                </Button>
                <Button
                  leftIcon={<Icon as={FaSignInAlt} />}
                  variant="ghost"
                  onClick={onDisconnect}
                >
                  Login
                </Button>
              </VStack>
            </MenuList>
          </Menu>
        </VStack>
      </Flex>
    </Flex>
  );
};

export default AppSidebar