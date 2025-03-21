import { Box, Container, Heading, Text, Button, VStack, useColorModeValue, SimpleGrid, Icon, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { RiWaterFlashFill } from 'react-icons/ri';
import { MdOutlineElectricBolt, MdOutlineRequestQuote, MdHistory } from 'react-icons/md';
import { useElectricityPaymentContext } from 'contexts/useElectricityPaymentContext';
import Layout from '@/unused/layout';


const ElectricityPaymentLanding = () => {
  const router = useRouter();
  const { currentAccount, connectWallet, isConnected } = useElectricityPaymentContext();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = 'blue.500';

  const handleNavigate = (path: string) => {
    if (isConnected) {
      router.push(path);
    } else {
      connectWallet();
    }
  };

  return (
    <Layout>
      <Box bg={bgColor} minH="100vh" py={16}>
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center" mb={16}>
            <Icon as={RiWaterFlashFill} w={20} h={20} color={accentColor} />
            <Heading as="h1" size="2xl">
              Home Electricity Payment Portal
            </Heading>
            <Text fontSize="xl" maxW="2xl">
              A secure and transparent platform for managing and paying your home electricity bills using blockchain technology.
            </Text>
            {!isConnected ? (
              <Button 
                size="lg" 
                colorScheme="blue" 
                onClick={connectWallet}
                rightIcon={<MdOutlineElectricBolt />}
              >
                Connect Wallet to Get Started
              </Button>
            ) : (
              <Text>
                Connected: {currentAccount.substring(0, 6)}...{currentAccount.substring(currentAccount.length - 4)}
              </Text>
            )}
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <FeatureBox 
              icon={MdOutlineRequestQuote}
              title="View Bills"
              description="Check your current and past electricity bills with detailed consumption information."
              onClick={() => handleNavigate('/electricity-payment/bills')}
              isConnected={isConnected}
            />
            <FeatureBox 
              icon={MdOutlineElectricBolt}
              title="Pay Bills"
              description="Securely pay your electricity bills using blockchain tokens."
              onClick={() => handleNavigate('/electricity-payment/pay')}
              isConnected={isConnected}
            />
            <FeatureBox 
              icon={MdHistory}
              title="Payment History"
              description="View your complete payment history and consumption trends."
              onClick={() => handleNavigate('/electricity-payment/history')}
              isConnected={isConnected}
            />
          </SimpleGrid>
        </Container>
      </Box>
    </Layout>
  );
};

interface FeatureBoxProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  isConnected: boolean;
}

const FeatureBox: React.FC<FeatureBoxProps> = ({ icon, title, description, onClick, isConnected }) => {
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box
      p={8}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      bg={cardBgColor}
      boxShadow="md"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg', bg: hoverBgColor }}
      cursor="pointer"
      onClick={onClick}
    >
      <VStack spacing={4} align="center">
        <Icon as={icon} w={10} h={10} color="blue.500" />
        <Heading as="h3" size="md">{title}</Heading>
        <Text textAlign="center">{description}</Text>
        <Button 
          colorScheme="blue" 
          variant={isConnected ? "solid" : "outline"}
          isDisabled={!isConnected}
        >
          {isConnected ? title : "Connect Wallet First"}
        </Button>
      </VStack>
    </Box>
  );
};

export default ElectricityPaymentLanding;