import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { BlockchainTransaction } from "types/ethers";
import { PaymentTransactions, SafeInfoType } from 'types/index';
import { getContract } from '../utils'; // Import utility functions but keep your existing implementation

// Import your contract ABI and address
const contractABI = ""; // Keep this as is or replace with actual ABI
const contractAddress = ""; // Keep this as is or replace with actual address

const { ethereum } = window;

const useDaoContext = () => {
    // Keep all your existing state variables
    const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
    const [currentAccount, setCurrentAccount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
    const [transactions, setTransactions] = useState([]);

    const [safeDetails, setSafeDetails] = useState(null);
    const [isPaid, setIsPaid] = useState(false);
    const [paymentTransactionReceipt, setPaymentTransactionReceipt] = useState({});
    const [paidTokenAmount, setPaidTokenAmount] = useState(0);

    // Keep your original createEthereumContract function
    const createEthereumContract = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

        return transactionsContract;
    };

    // Keep all your original functions
    const getAllTransactions = async () => {
        try {
            if (ethereum) {
                const transactionsContract = await createEthereumContract();
                const availableTransactions = await transactionsContract.getAllTransactions();

                const structuredTransactions = availableTransactions.map((transaction: BlockchainTransaction) => ({
                    addressTo: transaction.receiver,
                    addressFrom: transaction.sender,
                    timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                    message: transaction.message,
                    keyword: transaction.keyword,
                    amount: parseInt(transaction.amount._hex) / (10 ** 18)
                }));

                console.log(structuredTransactions);

                setTransactions(structuredTransactions);
            } else {
                console.log("Ethereum is not present");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const checkIfWalletIsConnect = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask.");

            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);

                getAllTransactions();
            } else {
                console.log("No accounts found");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const checkIfTransactionsExists = async () => {
        try {
            if (ethereum) {
                const transactionsContract = await createEthereumContract();
                const currentTransactionCount = await transactionsContract.getTransactionCount();

                window.localStorage.setItem("transactionCount", currentTransactionCount);
            }
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object");
        }
    };

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask.");

            const accounts = await ethereum.request({ method: "eth_requestAccounts", });

            setCurrentAccount(accounts[0]);
            window.location.reload();
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object");
        }
    };

    // Keep all your proposal functions
    const createProposal = async (title: string, description: string) => {
        try {
            if (ethereum) {
                const contract = await createEthereumContract();
                setIsLoading(true);
                
                const proposalTx = await contract.createProposal(title, description);
                await proposalTx.wait();
                
                setIsLoading(false);
                return proposalTx.hash;
            }
        } catch (error) {
            console.error("Error creating proposal:", error);
            setIsLoading(false);
            throw error;
        }
    };

    const voteOnProposal = async (vote: string) => {
        try {
            if (ethereum) {
                const contract = await createEthereumContract();
                setIsLoading(true);
                
                const voteTx = await contract.vote(vote === 'yes');
                await voteTx.wait();
                
                setIsLoading(false);
                return voteTx.hash;
            }
        } catch (error) {
            console.error("Error voting on proposal:", error);
            setIsLoading(false);
            throw error;
        }
    };

    const executeProposal = async () => {
        try {
            if (ethereum) {
                const contract = await createEthereumContract();
                setIsLoading(true);
                
                const executeTx = await contract.executeProposal();
                await executeTx.wait();
                
                setIsLoading(false);
                return executeTx.hash;
            }
        } catch (error) {
            console.error("Error executing proposal:", error);
            setIsLoading(false);
            throw error;
        }
    };

    const approveProposal = async () => {
        try {
            if (ethereum) {
                const contract = await createEthereumContract();
                setIsLoading(true);
                
                const approveTx = await contract.approveProposal();
                await approveTx.wait();
                
                setIsLoading(false);
                return approveTx.hash;
            }
        } catch (error) {
            console.error("Error approving proposal:", error);
            setIsLoading(false);
            throw error;
        }
    };

    const rejectProposal = async () => {
        try {
            if (ethereum) {
                const contract = await createEthereumContract();
                setIsLoading(true);
                
                const rejectTx = await contract.rejectProposal();
                await rejectTx.wait();
                
                setIsLoading(false);
                return rejectTx.hash;
            }
        } catch (error) {
            console.error("Error rejecting proposal:", error);
            setIsLoading(false);
            throw error;
        }
    };

    // Keep your sendDaoTransaction implementation
    const sendDaoTransaction = async (
        transactionData: PaymentTransactions,
        daoData: {
            title: string;
            description: string;
            personName: string;
        },
        safeInfo: SafeInfoType
    ) => {
        try {
            if (ethereum) {
                const {
                    address,
                    amount,
                    comment,
                    receipient,
                    timestamp,
                    USDprice,
                    paymenthash,
                    owneraddress,
                } = transactionData;
                const { title, description, personName } = daoData;
        
                const transactionsContract = await createEthereumContract();
                const parsedAmount = ethers.utils.parseEther(amount.toString());
        
                // If this is a payment transaction, calculate the total amount to send
                let totalAmount;
                const isPayment = true; // assuming this is always true for payment transactions
                if (isPayment) {
                    const paymentAmount = await transactionsContract.payfee(amount.toString());
                    totalAmount = parsedAmount.add(paymentAmount);
                } else {
                    totalAmount = parsedAmount;
                }
        
                // Send the transaction to the blockchain
                await ethereum.request({
                    method: "eth_sendTransaction",
                    params: [
                        {
                            from: currentAccount,
                            to: address,
                            gas: "0x5208",
                            value: ethers.utils.formatEther(totalAmount),
                        },
                    ],
                });
        
                // Add the transaction to the blockchain using the addToBlockchain method
                const transactionHash = await transactionsContract.addToBlockchain(
                    address,
                    parsedAmount,
                    comment,
                    title,
                    description,
                    personName,
                    safeInfo.address,
                    safeInfo.owners,
                    contractAddress,
                    timestamp,
                    USDprice,
                    paymenthash,
                    owneraddress
                );
                console.log(`Loading - ${transactionHash.hash}`);
                await transactionHash.wait();
                console.log(`Success - ${transactionHash.hash}`);
        
                // Update transaction count
                const transactionsCount = await transactionsContract.getTransactionCount();
                setTransactionCount(transactionsCount.toNumber());
            } else {
                console.log("No ethereum object");
            }
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    };
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
    };

    // Add useEffect if you want to run checkIfWalletIsConnect on mount
    useEffect(() => {
        checkIfWalletIsConnect();
        checkIfTransactionsExists();
    }, []);

    // Return all your original values
    return {
        transactionCount,
        connectWallet,
        transactions,
        currentAccount,
        isLoading,
        sendDaoTransaction,
        handleChange,
        formData,
        createProposal,
        voteOnProposal,
        executeProposal,
        approveProposal,
        rejectProposal,
        safeDetails,
        isPaid,
        paymentTransactionReceipt,
        paidTokenAmount
    };
};

export default useDaoContext;