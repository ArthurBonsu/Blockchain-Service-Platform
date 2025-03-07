import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { ReactNode, useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ChakraProvider } from '@chakra-ui/react';

// Import all context providers
import { TransactionProvider } from '@/contexts/TransactionContext';
import { BlockchainProvider } from '@/components/BlockchainContext';
import { DaoProvider } from '@/contexts/DaoContext';
import { CrowdSourceProvider } from '@/contexts/CrowdSourceContext';
import { LandOwnershipProvider } from '@/contexts/LandOwnershipContext';
import { SwapContextProvider } from '@/contexts/useSwapContext'; // New import for Swap context

// Import GlobalErrorHandler dynamically with SSR
const GlobalErrorHandler = dynamic(
  () => import('@/components/GlobalErrorHandler'),
  {
    ssr: true,
    loading: () => null
  }
);

// Type the NoSSR component props
interface NoSSRProps {
  children: ReactNode;
}

// Create NoSSR wrapper component with proper typing
const NoSSR: React.FC<NoSSRProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
};

// Main App component
function MyApp({ Component, pageProps }: AppProps) {
  const { session, ...restPageProps } = pageProps as any;
  const router = useRouter();
  
  // Check if current route is swap-related to conditionally apply SwapContextProvider
  // Add more paths as needed
  const isSwapRoute = 
    router.pathname.startsWith('/swap') || 
    router.pathname.includes('transfer') ||
    router.pathname.includes('transaction');
  
  // Create the main content with all providers
  const MainContent = () => (
    <BlockchainProvider>
      <TransactionProvider>
        <DaoProvider>
          <CrowdSourceProvider>
            <LandOwnershipProvider>
              <Component {...restPageProps} />
            </LandOwnershipProvider>
          </CrowdSourceProvider>
        </DaoProvider>
      </TransactionProvider>
    </BlockchainProvider>
  );
  
  return (
    <SessionProvider session={session}>
      <ChakraProvider>
        <GlobalErrorHandler>
          <NoSSR>
            {isSwapRoute ? (
              <SwapContextProvider>
                <MainContent />
              </SwapContextProvider>
            ) : (
              <MainContent />
            )}
          </NoSSR>
        </GlobalErrorHandler>
      </ChakraProvider>
    </SessionProvider>
  );
}

export default MyApp;