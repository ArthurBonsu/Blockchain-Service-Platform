import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import useDaoContext from 'context/useDaoContext';
import { useLoadSafe } from 'hooks/useLoadSafe';
import useSafeDetailsAndSetup from 'hooks/useSafeDetails.ts';
import useTransactionContext from 'context/useTransactionContext';
import { PaymentTransactions, TransactionParams } from 'types';
import { useSafeStore } from 'stores/safeStore';
import { useTransactionStore } from 'stores/transactionStore';
import { useEthersStore } from 'stores/ethersStore';





const DAO: React.FC<PaymentTransactions> = ({  ...rest }) => {
  const { createProposal, voteOnProposal, executeProposal, approveProposal, rejectProposal, sendDaoTransaction } = useDaoContext();
  const { getSafeInfo, addAddressToSafe,setUpMultiSigSafeAddress, isTxnExecutable,proposeTransaction,approveTransfer,rejectTransfer } = useSafeDetailsAndSetup();
  const { transferTransaction, sendTransaction } = useTransactionContext();

  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [executionTxHash, setExecutionTxHash] = useState('');
  const [vote, setVote] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receipients, setReceipients] = useState<Array<string>>([]);
  const [receipient, setReceipient] = useState<string>('');
  const [paymenthash, setPaymentHash] = useState<string>('');
  const [USDprice, setUSDprice] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [timestamp, setTimestamp] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(false);
 
  
 
//useEther
// Maintaining stores state  here for every page 
  const chainId = useEthersStore((state) => state.chainId);
  const address = useEthersStore((state) => state.setAddress);
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
  const  isPendingProposal = useTransactionStore((state) => state.isPendingProposal);
  const pendingProposalData = useTransactionStore((state) => state.pendingProposalData);  
  
  

  /*
//useTransactionStore
transaction: PaymentTransactions;
txhash: string | null;
txdata: string | null;
txamount: number | null;
txname: string | null;
txsymbol: string | null;
txsigner: string | null;
txlogoUri: string | null;
isPendingProposal: boolean;
pendingProposalData: any;


//useSafeStore
safeAddress: string;
ownersAddress: string[];
contractAddress: string;
isPendingSafeCreation: boolean;
pendingSafeData: any; // or a more specific type if needed
isPendingAddOwner: boolean;
pendingAddOwnerData: any; // or a more specific type if needed


//useTransactionStore
transaction: PaymentTransactions;
txhash: string | null;
txdata: string | null;
txamount: number | null;
txname: string | null;
txsymbol: string | null;
txsigner: string | null;
txlogoUri: string | null;
isPendingProposal: boolean;
pendingProposalData: any;

//useUserStore
hasMetamask: boolean
isLoggedIn: boolean
address: string | null
setHasMetamask: (val: boolean) => void
setIsLoggedIn: (val: boolean) => void
setAddress: (val: string | null) => void

  
   transaction = useTransactionStore(state => state.transaction);
  const address = useEthersStore(state => state.address);
  const contractaddress: string;
  const username?: string;
  const comment?  //providers
  const timestamp
  const receipient
  const receipients
  const txhash
  const USDprice
  const setPaymenthash 
  const owneraddress
  const signers
  const providers 
  
  //signers 
 //contractaddress
 //safeaddress
 //useraddress
 //paymenthash 
 //USDprice

       username?: string;
      contractaddress: string;
      amount: number;
      comment?: string;
      timestamp: Date;
      receipient: string;
      receipients?: Array<string>;
      txhash: string;
      USDprice?: number;
      paymenthash?: string;
      owneraddress: string;
      newcontract?: ethers.Contract;
 */

  const handleCreateProposal = async () => {
    await createProposal(proposalTitle, proposalDescription);
  };

  const handleVoteOnProposal = async () => {
    await voteOnProposal(vote);
  };

  const handleExecuteProposal = async () => {
    const txHash = await executeProposal();
    setExecutionTxHash(txHash);
  };

  const handleApproveProposal = async () => {
    setIsApproving(true);
    await approveProposal();
    setIsApproving(false);
  };

  const handleRejectProposal = async () => {
    setIsRejecting(true);
    await rejectProposal();
    setIsRejecting(false);
  };


  const handleSendDaoTransaction = async () => {
    const transactionData: PaymentTransactions = {
      data: null,
      username: ownersAddress,
      address: receipient,
      amount: parseFloat(amount),
      comment: comment,
      timestamp: new Date(),
      receipient: receipient,
      receipients: [],
      txhash: '',
      USDprice: 0,
      paymenthash: '',
      owneraddress: ownersAddress,
    };
    const daoData = {
      title: proposalTitle,
      description: proposalDescription,
      personName: ownersAddress,
    };
    const safeInfo = {
      safeAddress,
      ownersAddress,
      contractAddress,
    };
    await sendDaoTransaction(transactionData, daoData, safeInfo);
  };
  
  const onCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1>DAO Service</h1>
  
      {/* Create Proposal Modal */}
      <Modal isOpen={isModalOpen} onClose={onCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Proposal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
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
            <Button colorScheme="blue" onClick={handleCreateProposal}>
              Create Proposal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      {/* Vote on Proposal Modal */}
      <Modal isOpen={isModalOpen} onClose={onCloseModal}>
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
            <Button colorScheme="blue" onClick={handleVoteOnProposal}>
              Vote
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      {/* Execute Proposal Modal */}
      <Modal isOpen={isModalOpen} onClose={onCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Execute Proposal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>Execution transaction hash: {executionTxHash}</p>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleExecuteProposal}>
              Execute
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      {/* Approve Proposal Modal */}
      <Modal isOpen={isModalOpen} onClose={onCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Approve Proposal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>Approving proposal...</p>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleApproveProposal} isLoading={isApproving}>
              Approve
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      {/* Reject Proposal Modal */}
      <Modal isOpen={isModalOpen} onClose={onCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Proposal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>Rejecting proposal...</p>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleRejectProposal} isLoading={isRejecting}>
              Reject
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      {/* Send Payment Modal */}
      <Modal isOpen={isModalOpen} onClose={onCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Payment amount"
            />
            <Input
              type="text"
              value={paymentRecipient}
              onChange={(e) => setPaymentRecipient(e.target.value)}
              placeholder="Payment recipient"
            />

             <Input
              type="text"
              value={receipients}
              onChange={(e) => setReceipients(e.target.value)}
              placeholder="Add extra Payment recipients"
            />

              <Input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value[])}
              placeholder="Add extra Payment recipients"
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSendPayment}>
              Send Payment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      {/* Send Transaction Modal */}
      <Modal isOpen={isModalOpen} onClose={onCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Transaction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>Sending transaction...</p>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSendTransaction}>
              Send Transaction
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      {/* Transaction History Modal */}
      <Modal isOpen={isModalOpen} onClose={onCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transaction History</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>Transaction history:</p>
            {transferTransaction.map((transaction: { hash: string }, index: number) => (
              <p key={index}>{transaction.hash}</p>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onCloseModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DAO;