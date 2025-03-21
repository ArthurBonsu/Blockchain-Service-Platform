// Portfolio.tsx
import React, { useState, useEffect } from 'react';
import {
  Button,
  ButtonProps,
  Flex,
  useDisclosure,
} from '@chakra-ui/react';
import usePortFolioContext from '../../contexts/usePortfolioContext';

export interface PortfolioProps {
  portfolioId: number;
  portfolioName: string;
}

export const Portfolio: React.FC<PortfolioProps> = ({
  portfolioId,
  portfolioName,
  ...rest
}) => {
  const {
    mapKeygetter,
    getMaxtimestampToken,
    getMaxtimestampPerToken,
    selectTokenType,
    getAllTokenOfParticularType,
    getLatestTokenOfType,
    getLatestTokenOfAllThreeTypes,
    getWithdrawnAmountOfTokenType,
    getDepositedAmountOfTokenType,
    getPortFolioValueOfSpecifiedToken,
    getPortFolioWithDate,
    getDatedWithdrawnAmountOfTokenType,
    getDatedDepositedAmountOfTokenType,
    getDatedPortFolioValueOfTokenType,
    getDatedPortFolioValueOfAllThreeTypes,
    getPortFolioValueOfTokenofAllThreeTypes,
  } = usePortFolioContext();

  const [portfolioTokens, setPortfolioTokens] = useState([]);
  const [portfolioToken, setPortfolioToken] = useState({});
  const [selectedToken, setSelectedToken] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenValue, setTokenValue] = useState(0);

  useEffect(() => {
    mapKeygetter();
    const tokens = getAllTokenOfParticularType('BTC');
    setPortfolioTokens
    setPortfolioToken(tokens);
  }, [mapKeygetter, portfolioId, getAllTokenOfParticularType]);

  const handleTokenSelect = (token: string) => {
    setSelectedToken(token);
    const tokenBalance = getPortFolioValueOfSpecifiedToken(token);
    setTokenBalance(tokenBalance.balancedamount);
    setTokenValue(tokenBalance.depositedamount);
  };

  return (
    <div>
      <h2>Portfolio: {portfolioName}</h2>
      <Flex>
        {portfolioTokens.map((token: any ) => (
          <Button key={token.token} onClick={() => handleTokenSelect(token.token)}>
            {token.token}
          </Button>
        ))}
      </Flex>
      {selectedToken && (
        <div>
          <h3>Token Balance: {tokenBalance}</h3>
          <h3>Token Value: {tokenValue}</h3>
        </div>
      )}
    </div>
  );
};

export default Portfolio;