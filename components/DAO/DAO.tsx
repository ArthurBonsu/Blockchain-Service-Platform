import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react';
import useDaoContext from '../contexts/useDaoContext';
import { useLoadSafe } from '../hooks/useLoadSafe';
import useSafeDetailsAndSetup from '../hooks/useSafeDetails.ts';
import useTransactionContext from '../contexts/useTransactionContext';
import { PaymentTransactions } from 'types';
import { useSafeStore } from '../stores/safeStore';
import { useTransactionStore } from '../stores/transactionStore';
import { useEthersStore } from '../stores/ethersStore';

const DAO: React.FC<PaymentTransactions> = ({ ...rest }) => {
  // Context hooks
  const { 
    createProposal, 
    voteOnProposal, 
    executeProposal, 
    approveProposal, 
    rejectProposal, 
    sendDaoTransaction,
    connectWallet,
    currentAccount,
    isLoading
  } = useDaoContext();
  
  const { 
    getSafeInfo, 
    addAddressToSafe, 
    setUpMultiSigSafeAddress, 
    isTxnExecutable, 
    proposeTransaction, 
    approveTransfer, 
    rejectTransfer 
  } = useSafeDetailsAndSetup();
  
  const { transferTransaction, sendTransaction } = useTransactionContext();

  // Component state
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [executionTxHash, setExecutionTxHash] = useState('');
  const [vote, setVote] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [receipient, setReceipient] = useState<string>('');
  const [receipients, setReceipients] = useState<Array<string>>([]);
  const [paymenthash, setPaymentHash] = useState<string>('');
  const [USDprice, setUSDprice] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [timestamp, setTimestamp] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(false);
  
  // Modal controls - using useDisclosure from Chakra UI
  const createProposalModal = useDisclosure();
  const voteModal = useDisclosure();
  const executeModal = useDisclosure();
  const approveModal = useDisclosure();
  const rejectModal = useDisclosure();
  const sendPaymentModal = useDisclosure();

  // Store state
  const chainId = useEthersStore((state) => state.chainId);
  const address = useEthersStore((state) => state.address);
  const safeAddress = useSafeStore((state) => state.safeAddress);
  const ownersAddress = useSafeStore((state) => state.ownersAddress);
  const contractAddress = useSafeStore((state) => state.contractAddress);
  const isPendingSafeCreation = useSafeStore((state) => state.isPendingSafeCreation);
  const pendingSafeData = useSafeStore((state) => state.pendingSafeData);
  const isPendingAddOwner = useSafeStore((state) => state.isPendingAddOwner);
  const pendingAddOwnerData = useSafeStore((state) => state.pendingAddOwnerData);
  const transaction = useTransactionStore((state) => state.transaction);
  const txhash = useTransactionStore((state) => state.txhash);
  const txdata = useTransactionStore((state) => state.txdata);
  const txamount = useTransactionStore((state) => state.txamount);
  const txname = useTransactionStore((state) => state.txname);
  const isPendingProposal = useTransactionStore((state) => state.isPendingProposal);
  const pendingProposalData = useTransactionStore((state) => state.pendingProposalData);

  // Event handlers
  const handleCreateProposal = async () => {
    if (!proposalTitle || !proposalDescription) return;
    setIsLoading(true);
    try {
      await createProposal(proposalTitle, proposalDescription);
      createProposalModal.onClose();
      setProposalTitle('');
      setProposalDescription('');
    } catch (error) {
      console.error("Error creating proposal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoteOnProposal = async () => {
    if (!vote) return;
    setIsLoading(true);
    try {
      await voteOnProposal(vote);
      voteModal.onClose();
      setVote('');
    } catch (error) {
      console.error("Error voting on proposal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteProposal = async () => {
    setIsLoading(true);
    try {
      const txHash = await executeProposal();
      setExecutionTxHash(txHash);
      executeModal.onClose();
    } catch (error) {
      console.error("Error executing proposal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveProposal = async () => {
    setIsApproving(true);
    try {
      await approveProposal();
      approveModal.onClose();
    } catch (error) {
      console.error("Error approving proposal:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectProposal = async () => {
    setIsRejecting(true);
    try {
      await rejectProposal();
      rejectModal.onClose();
    } catch (error) {
      console.error("Error rejecting proposal:", error);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleSendDaoTransaction = async () => {
    if (!receipient || !amount) return;
    setIsLoading(true);
    
    try {
      const transactionData = {
        data: null,
        username: ownersAddress,
        address: receipient,
        amount: parseFloat(amount),
        comment: comment,
        timestamp: new Date(),
        receipient: receipient,
        receipients: receipients || [],
        txhash: '',
        USDprice: USDprice ? parseFloat(USDprice) : 0,
        paymenthash: paymenthash || '',
        owneraddress: ownersAddress,
      };
      
      const daoData = {
        title: proposalTitle || 'Payment Transaction',
        description: proposalDescription || `Payment of ${amount} ETH to ${receipient}`,
        personName: ownersAddress,
      };
      
      const safeInfo = {
        address: safeAddress,
        nonce: 0,
        threshold: 1,
        owners: ownersAddress,
        masterCopy: '',
        modules: [],
        fallbackHandler: '',
        guard: '',
        version: '1.0'
      };
      
      await sendDaoTransaction(transactionData, daoData, safeInfo);
      sendPaymentModal.onClose();
      
      // Reset fields
      setAmount('');
      setReceipient('');
      setComment('');
    } catch (error) {
      console.error("Error sending DAO transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to check wallet connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    };
    
    checkConnection();
  }, []);

  return (
    <div>
      <h1>DAO Service</h1>
      
      {!currentAccount ? (
        <Button colorScheme="blue" onClick={connectWallet}>
          Connect Wallet
        </Button>
      ) : (
        <div>
          <Button colorScheme="green" onClick={createProposalModal.onOpen} m={2}>
            Create Proposal
          </Button>
          <Button colorScheme="blue" onClick={voteModal.onOpen} m={2}>
            Vote on Proposal
          </Button>
          <Button colorScheme="purple" onClick={executeModal.onOpen} m={2}>
            Execute Proposal
          </Button>
          <Button colorScheme="teal" onClick={approveModal.onOpen} m={2}>
            Approve Proposal
          </Button>
          <Button colorScheme="red" onClick={rejectModal.onOpen} m={2}>
            Reject Proposal
          </Button>
          <Button colorScheme="orange" onClick={sendPaymentModal.onOpen} m={2}>
            Send Payment
          </Button>
        </div>
      )}
  
      {/* Create Proposal Modal */}
      <Modal isOpen={createProposalModal.isOpen} onClose={createProposalModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Proposal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              mb={3}
              type="text"
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
              placeholder="Proposal title"
            />
            <Input
              type="text"
              value={proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
              placeholder="Proposal description"
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleCreateProposal} isLoading={isLoading}>
              Create Proposal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      {/* Vote on Proposal Modal */}
      <Modal isOpen={voteModal.isOpen} onClose={voteModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Vote on Proposal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              type="text"
              value={vote}
              onChange={(e) => setVote(e.target.value)}
              placeholder="Vote (yes/no)"
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleVoteOnProposal} isLoading={isLoading}>
              Vote
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      {/* Execute Proposal Modal */}
      <Modal isOpen={executeModal.isOpen} onClose={executeModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Execute Proposal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {executionTxHash && <p>Execution transaction hash: {executionTxHash}</p>}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleExecuteProposal} isLoading={isLoading}>
              Execute
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      {/* Approve Proposal Modal */}
      <Modal isOpen={approveModal.isOpen} onClose={approveModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Approve Proposal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>Are you sure you want to approve this proposal?</p>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleApproveProposal} isLoading={isApproving}>
              Approve
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      {/* Reject Proposal Modal */}
      <Modal isOpen={rejectModal.isOpen} onClose={rejectModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Proposal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>Are you sure you want to reject this proposal?</p>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={handleRejectProposal} isLoading={isRejecting}>
              Reject
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      {/* Send Payment Modal */}
      <Modal isOpen={sendPaymentModal.isOpen} onClose={sendPaymentModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              mb={3}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Payment amount"
            />
            <Input
              mb={3}
              type="text"
              value={receipient}
              onChange={(e) => setReceipient(e.target.value)}
              placeholder="Payment recipient"
            />
            <Input
              mb={3}
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Payment comment"
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSendDaoTransaction} isLoading={isLoading}>
              Send Payment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DAO;