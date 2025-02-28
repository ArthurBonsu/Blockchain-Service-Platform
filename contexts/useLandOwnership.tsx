import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { BlockchainTransaction } from "types/ethers";
import { PaymentTransactions } from "types";

const contractABI = "";
const contractAddress = "";

const { ethereum } = window;

const useLandPaymentContext = () => {
  const createEthereumContract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const landPaymentContract = new ethers.Contract(contractAddress, contractABI, signer);
    return landPaymentContract;
  };

  const [formData, setFormData] = useState({
    landAddress: "",
    amount: "",
    message: "",
  });

  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (ethereum) {
        const landPaymentContract = await createEthereumContract();
        const availableTransactions = await landPaymentContract.getAllTransactions();
        const structuredTransactions = availableTransactions.map((transaction: PaymentTransactions) => ({
          landAddress: transaction.landAddress,
          sender: transaction.sender,
          amount: transaction.amount,
          message: transaction.message,
          timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
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
        const landPaymentContract = await createEthereumContract();
        const currentTransactionCount = await landPaymentContract.getTransactionCount();
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
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  const sendTransaction = async (transactionData: PaymentTransactions) => {
      try {
        if (ethereum) {
          const { address, amount, comment, receipient } = transactionData;
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
          // If this is a payment transaction, listen for payment event and update state
          if (isPayment) {
            const filter = transactionsContract.filters.payfeeevent(address, amount.toString());
            const results = await transactionsContract.queryFilter(filter);
            console.log("Payment event results:", results);
          } else {
            // Add the transaction to the blockchain using the addToBlockchain method
            const transactionHash = await transactionsContract.addToBlockchain(
              address,
              parsedAmount,
              comment,
              "" // assuming keyword is not required
            );
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            console.log(`Success - ${transactionHash.hash}`);
          }
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
    

  useEffect(() => {
    checkIfWalletIsConnect();
    checkIfTransactionsExists();
  }, [transactionCount]);

  return {
    transactionCount,
    connectWallet,
    transactions,
    currentAccount,
    isLoading,
    sendTransaction,
    handleChange,
    formData,
  }
}

export default useLandPaymentContext;
