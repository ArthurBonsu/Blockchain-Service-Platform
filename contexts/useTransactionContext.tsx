import React, { useEffect, useState } from "react";
import { ethers, Signer, BigNumberish, Contract } from "ethers";
import { PaymentTransactions, SimpleTransferTranscations, Receipients } from 'types/index';
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Provider, Web3Provider } from "@ethersproject/providers";
import chai from "chai";
import BN from "bn.js";
import "chai-as-promised";
// This is just used as a placeholder
import { TokencontractAddress } from '../constants/constants';

chai.use(require("chai-bn")(BN));

const { ethereum } = window;

let contractABI = "";
let contractAddress = TokencontractAddress;

interface TransactionParams {
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
  newcontract?: Contract;
}

interface SimpleTransferParams {
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
  newcontract?: Contract;
}

interface SendTransactionProps {
  signer: Signer;
  provider:Web3Provider;
  transactionObject?: PaymentTransactions | TransactionParams;
  transactionRequest?: TransactionRequest;
  newcontract?: Contract;
}

const useTransactionContext = () => {
  const createEthereumContract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const SimpleTransfer = new ethers.Contract(contractAddress, contractABI, signer);
    return { SimpleTransfer, signer, provider };
  };

  const [PaymentformData, setPaymentFormData] = useState<TransactionParams>({
    username: "",
    contractaddress: "",
    amount: 0,
    comment: "",
    timestamp: new Date(),
    receipient: "",
    receipients: [],
    txhash: "",
    USDprice: 0,
    paymenthash: "",
    owneraddress: ""
  });

  const [transferformData, setTransferFormData] = useState<TransactionParams>({
    username: "",
    contractaddress: "",
    amount: 0,
    comment: "",
    timestamp: new Date(),
    receipient: "",
    receipients: ["0x"],
    txhash: "",
    USDprice: 0,
    paymenthash: "",
    owneraddress: ""
  });

  const [currentAccount, setCurrentAccount] = useState("");
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount") || "0");
  const [paymentTransactionReceipt, setPayment] = useState({});
  const [transferTransaction, setTransfer] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [tokenTxReceipt, setTokenTxReceipt] = useState({});
  const [transferredTokenAmount, setTransferredTokenAmount] = useState(0);
  const [paidTokenAmount, setPaidTokenAmount] = useState(0);
  const [ourUSDPrice, setUSDPrice] = useState(0);
  const [accountsProvided, setAccountsProvided] = useState<string[]>([]);
  const [paymentTransactionRequest, setPaymentTransactionRequest] = useState<TransactionRequest>({});
  const [transferTransactionRequest, setTransferTransactionRequest] = useState<TransactionRequest>({});
  const [transferobjectAArray, setTransferobjectAArray] = useState([]);
  const [fullpaymentx, setFullpaymentx] = useState(null);
  const [fulltransfertx, setFulltransfertx] = useState(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    setPaymentFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
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
  

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        useTransactionContext();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfTransactionsExist = async () => {
    try {
      if (ethereum) {
        const { SimpleTransfer } = await createEthereumContract();
        const SimpleTransferCount = await SimpleTransfer.getTransactionCount();
        window.localStorage.setItem("transactionCount", SimpleTransferCount.toString());
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
      setAccountsProvided(accounts);
      setCurrentAccount(accounts[0]);
      window.location.reload();
      return accounts;
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  const sendTransaction = async ({ signer, provider, transactionRequest, newcontract }: SendTransactionProps) => {
    try {
      if (ethereum) {
        await connectWallet();
        if (transactionRequest) {
          await signer.sendTransaction(transactionRequest );
        }

        if (newcontract) {
          const transactionsCount = await newcontract.getTransactionCount();
          setTransactionCount(transactionsCount.toNumber());
        }

        window.location.reload();
      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExist();
  }, [transactionCount]);

  return {
    
    sendPayment,
    sendSimpleTransfer,
    transactionCount,
    connectWallet,
    currentAccount,
    isLoading,
    sendTransaction,
    handleChange,
    PaymentformData,
    transferformData,
    paymentTransactionReceipt,
    transferTransaction,
    isPaid,
    tokenTxReceipt,
    transferredTokenAmount,
    paidTokenAmount,
    ourUSDPrice,
    accountsProvided,
    transferobjectAArray,
    fullpaymentx,
    fulltransfertx,
  };
};

export default useTransactionContext;
