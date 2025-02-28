// Layout.tsx

import React, { FC, PropsWithChildren, ReactNode, useEffect, useContext } from 'react';
import {
  Box,
  ButtonGroup,
  Container,
  Flex,
  Heading,
  Icon,
  IconButton,
  useDisclosure,
  Button,
  useClipboard,
} from '@chakra-ui/react';
import { LogoutIcon } from '@heroicons/react/solid';

import AppSidebar from '@components/AppSidebar';
import MetaTags from '@components/MetaTags';
import { useAppToast, useEthers } from 'hooks/index';
import getHiddenVersion from 'utils/getHiddenName';
import { useEthersStore } from 'stores/ethersStore';
import { BasicAuth } from './BasicAuth';

interface LayoutProps extends PropsWithChildren<{
  title: string;
}> {}

const Layout: FC<LayoutProps> = React.memo(({ children, title }) => {
  const toast = useAppToast();
  const { onDisconnect } = useEthers();
  const address = useEthersStore((state) => state.address);
  const { isOpen, onToggle } = useDisclosure();
  const { hasCopied, onCopy } = useClipboard(address || '');

  useEffect(() => {
    if (hasCopied) {
      toast.showToast('Address copied to clipboard', 'info');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCopied]);

  return (
    <BasicAuth>
      <Flex>
        <MetaTags title={title} />
        <AppSidebar isCollapsed={isOpen} address={address} />
        <Box w="full" pl={isOpen ? 14 : 52}>
          <Flex
            px={4}
            position="sticky"
            top="0"
            h="64px"
            alignItems="center"
            justifyContent="space-between"
            borderBottom="1px solid #E5E7EB"
            bg="white"
            zIndex={3}
          >
            <div>
              <IconButton
                colorScheme="teal"
                hidden // hidden for the mean time
                mr={4}
                transform="scaleX(-1)"
                {...(isOpen && {
                  transform: 'scaleX(1)',
                })}
                color="gray.400"
                size="xs"
                variant="unstyled"
                aria-label="toggle collapse"
                icon={<Icon fontSize={16} as={LogoutIcon} />}
                onClick={onToggle}
              />
              <Heading as="h2" fontSize="xl" mb={0}>
                {title}
              </Heading>
            </div>
            {address && (
              <ButtonGroup isAttached variant="outline">
                <Button onClick={onCopy} mr="-px">
                  {getHiddenVersion(address)}
                </Button>
                <IconButton
                  bg="red.100"
                  aria-label="Add to friends"
                  icon={<Icon as={LogoutIcon} />}
                  onClick={onDisconnect}
                />
              </ButtonGroup>
            )}
          </Flex>
          <Container w="full" maxW="container.lg">
            {children}
          </Container>
        </Box>
      </Flex>
    </BasicAuth>
  );
});

Layout.displayName = 'Layout'; // Set display name for the component

// Export the getLayout function properly
export const getLayout = (title: string) => {
  const WrappedLayout: FC<{ page: ReactNode }> = ({ page }) => (
    <Layout title={title}>{page}</Layout>
  );

  WrappedLayout.displayName = `getLayout(${title})`; // Set display name for the wrapped component

  return WrappedLayout;
};

export default Layout;
