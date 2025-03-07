// components/CrowdSource/CrowdSource.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Flex,
  useDisclosure,
  Box,
  Heading,
  Text,
  Input,
  FormControl,
  FormLabel,
  Stack,
} from '@chakra-ui/react';
import AppModal from '../AppModal/AppModal';
import useLoadSafe from 'hooks/useLoadSafe';
import { PaymentTransactions } from 'types';
import { useCrowdSourceContext } from '../../contexts/CrowdSourceContext';
import { useEthersStore } from '../../stores/ethersStore';

export interface CrowdsourceTransferProps {
  transaction?: PaymentTransactions;
  safeAddress?: string;
  userAddress?: string;
}

export const CrowdSource: React.FC<CrowdsourceTransferProps> = ({
  transaction,
  safeAddress = '',
  userAddress = '',
  ...rest
}) => {
  // Get context hooks
  const {
    currentAccount,
    connectWallet,
    isLoading,
    createCampaign,
    contributeToCampaign
  } = useCrowdSourceContext();

  // Use safe hooks for transaction management
  const {
    proposeTransaction,
    approveTransfer,
    rejectTransfer,
    checkIfTxnExecutable,
    safe,
    checkIsSigned,
  } = useLoadSafe({
    safeAddress,
    userAddress: userAddress || currentAccount,
  });

  // Local component state
  const [isBrowser, setIsBrowser] = useState(false);
  const [approveExeIsLoading, setApproveExeIsLoading] = useState(false);
  const [rejectExeIsLoading, setRejectExeIsLoading] = useState(false);
  const [isApprovalExecutable, setIsApprovalExecutable] = useState(false);
  const [isRejectionExecutable, setIsRejectionExecutable] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignRecipient, setCampaignRecipient] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [campaignId, setCampaignId] = useState('');

  // Modal controls
  const executeDisclosure = useDisclosure();
  const createCampaignDisclosure = useDisclosure();
  const contributeDisclosure = useDisclosure();

  // Check if transaction is executable
  const isTxnExecutable = useCallback(
    async (transaction: PaymentTransactions) => {
      try {
        const approvalTx = await checkIfTxnExecutable(transaction);
        return approvalTx;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [checkIfTxnExecutable]
  );

  // Set browser state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsBrowser(true);
    }
  }, []);

  // Check if transaction is executable when transaction changes
  useEffect(() => {
    const getExecutables = async () => {
      if (transaction) {
        const approvalTx = await isTxnExecutable(transaction);
        if (approvalTx) {
          setIsApprovalExecutable(true);
        }
      }
    };
    if (transaction) {
      getExecutables();
    }
  }, [transaction, isTxnExecutable]);

  // Approve transfer handler
  const approveTransfers = async (transaction: PaymentTransactions) => {
    setApproveExeIsLoading(true);
    try {
      await approveTransfer(transaction);
    } catch (error) {
      console.error("Error approving transfer:", error);
    } finally {
      setApproveExeIsLoading(false);
    }
  };

  // Reject transfer handler
  const rejectTransfers = async (transaction: PaymentTransactions) => {
    setRejectExeIsLoading(true);
    try {
      await rejectTransfer(transaction);
    } catch (error) {
      console.error("Error rejecting transfer:", error);
    } finally {
      setRejectExeIsLoading(false);
    }
  };

  // Handle campaign creation
  const handleCreateCampaign = async () => {
    if (!campaignName || !campaignRecipient || !campaignGoal) return;
    
    try {
      await createCampaign(campaignName, campaignRecipient, campaignGoal);
      createCampaignDisclosure.onClose();
      setCampaignName('');
      setCampaignRecipient('');
      setCampaignGoal('');
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  // Handle contribution
  const handleContribute = async () => {
    if (!campaignId || !contributionAmount) return;
    
    try {
      await contributeToCampaign(campaignId, contributionAmount);
      contributeDisclosure.onClose();
      setCampaignId('');
      setContributionAmount('');
    } catch (error) {
      console.error("Error contributing to campaign:", error);
    }
  };

  if (!isBrowser) return null;

  return (
    <Box p={5}>
      <Heading mb={4}>Crowdsource Service</Heading>
      
      {!currentAccount ? (
        <Button colorScheme="blue" onClick={connectWallet}>
          Connect Wallet
        </Button>
      ) : (
        <Stack spacing={4} direction="row" mb={6}>
          <Button colorScheme="green" onClick={createCampaignDisclosure.onOpen}>
            Create Campaign
          </Button>
          <Button colorScheme="blue" onClick={contributeDisclosure.onOpen}>
            Contribute to Campaign
          </Button>
          {transaction && (
            <Button {...rest} onClick={executeDisclosure.onOpen}>
              Execute Transaction
            </Button>
          )}
        </Stack>
      )}

      {/* Execute Transaction Modal */}
      <AppModal
        disclosure={executeDisclosure}
        title="Execute Transaction"
        modalSize="sm"
      >
        <Flex
          justify="space-between"
          py={6}
          alignItems="center"
          flexDirection="row"
        >
          {isApprovalExecutable && (
            <Button
              isLoading={approveExeIsLoading}
              isDisabled={approveExeIsLoading}
              onClick={async () => {
                if (transaction) {
                  await approveTransfers(transaction);
                  executeDisclosure.onClose();
                }
              }}
            >
              Execute Approval
            </Button>
          )}
          {isRejectionExecutable && (
            <Button
              isLoading={rejectExeIsLoading}
              isDisabled={rejectExeIsLoading}
              onClick={async () => {
                if (transaction) {
                  await rejectTransfers(transaction);
                  executeDisclosure.onClose();
                }
              }}
            >
              Execute Rejection
            </Button>
          )}
        </Flex>
      </AppModal>

      {/* Create Campaign Modal */}
      <AppModal
        disclosure={createCampaignDisclosure}
        title="Create Campaign"
        modalSize="md"
      >
        <Stack spacing={4} py={4}>
          <FormControl>
            <FormLabel>Campaign Name</FormLabel>
            <Input 
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter campaign name"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Recipient Address</FormLabel>
            <Input 
              value={campaignRecipient}
              onChange={(e) => setCampaignRecipient(e.target.value)}
              placeholder="0x..."
            />
          </FormControl>
          <FormControl>
            <FormLabel>Funding Goal (ETH)</FormLabel>
            <Input 
              value={campaignGoal}
              onChange={(e) => setCampaignGoal(e.target.value)}
              placeholder="1.0"
              type="number"
            />
          </FormControl>
          <Button 
            colorScheme="green" 
            isLoading={isLoading}
            onClick={handleCreateCampaign}
          >
            Create Campaign
          </Button>
        </Stack>
      </AppModal>

      {/* Contribute Modal */}
      <AppModal
        disclosure={contributeDisclosure}
        title="Contribute to Campaign"
        modalSize="md"
      >
        <Stack spacing={4} py={4}>
          <FormControl>
            <FormLabel>Campaign ID</FormLabel>
            <Input 
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              placeholder="Enter campaign ID"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Contribution Amount (ETH)</FormLabel>
            <Input 
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              placeholder="0.1"
              type="number"
            />
          </FormControl>
          <Button 
            colorScheme="blue" 
            isLoading={isLoading}
            onClick={handleContribute}
          >
            Contribute
          </Button>
        </Stack>
      </AppModal>
    </Box>
  );
};

export default CrowdSource;