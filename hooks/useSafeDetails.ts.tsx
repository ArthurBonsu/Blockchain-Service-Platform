import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { PaymentTransactions } from 'types';

// Define interfaces
export interface SafeInfoParam {
  provider?: Web3Provider;
  signer?: string;
  safeAddress: string;
  contractaddress?: string;
}

export interface executeTransParam {
  provider?: Web3Provider;
  signer?: string;
  safeAddress: string;
  transaction: PaymentTransactions;
  hashtxn?: string;
}



const useSafeDetailsAndSetup = () => {
  // Define the provider
  const provider: Web3Provider = new ethers.providers.Web3Provider(window.ethereum);

  // Define the contract ABI and bytecode
  const contractAbi: ethers.ContractInterface = [
    // Add ABI entries here
  ];

  // Get the signer
  const signer = provider.getSigner();
  const contractBytecode: string = '0x...'; // Replace with actual bytecode

  // Define the addresses array
  const addresses: string[] = [];
  const transactionPull: PaymentTransactions[] = [];

  const removeOwner = async ({ safeAddress, owner }: { safeAddress: string; owner: string }) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const tx = await safeContract.functions.removeOwner(owner);
    await tx.wait();
    return tx;
  };

  const updateThreshold = async ({ safeAddress, threshold }: { safeAddress: string; threshold: number }) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const tx = await safeContract.functions.updateThreshold(threshold);
    await tx.wait();
    return tx;
  };

  const getOwners = async ({ safeAddress }: { safeAddress: string }) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const owners = await safeContract.functions.getOwners();
    return owners;
  };

  const getOwnerDetails = async ({ safeAddress, owner }: { safeAddress: string; owner: string }) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const ownerDetails = await safeContract.functions.getOwnerDetails(owner);
    return ownerDetails;
  };

  const getTransactionCount = async ({ safeAddress }: { safeAddress: string }) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const transactionCount = await safeContract.functions.getTransactionCount();
    return transactionCount;
  };

  const getUserTransactions = async ({ safeAddress, user }: { safeAddress: string; user: string }) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const userTransactions = await safeContract.functions.getUserTransactions(user);
    return userTransactions;
  };

  const setUpMultiSigSafeAddress = async (address: string) => {
    const safeFactory = new ethers.ContractFactory(contractAbi, contractBytecode, signer);
    const safeContract = await safeFactory.deploy(address);
    await safeContract.deployed();
    const deployedAddress = safeContract.address;
    addresses.push(deployedAddress);
    return deployedAddress;
  };

  const addAddressToSafe = async (safeAddress: string, newAddress: string) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const tx = await safeContract.addOwner(newAddress);
    await tx.wait();
    return addresses;
  };

  const getSafeInfo = async ({ safeAddress }: SafeInfoParam) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const tx = await safeContract.functions.getModules();
    const modules = await tx.wait();
    return modules;
  };

  const setPendingAddOwnerData = async ({ safeAddress, owner, timestamp }: { safeAddress: string; owner: string; timestamp: number }) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const tx = await safeContract.functions.setPendingAddOwnerData(owner, timestamp);
    await tx.wait();
    return tx;
  };

  const setIsPendingAddOwner = async ({ safeAddress, owner, status }: { safeAddress: string; owner: string; status: boolean }) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const tx = await safeContract.functions.setIsPendingAddOwner(owner, status);
    await tx.wait();
    return tx;
  };

  const userAddToSafe = async ({ safeAddress, user }: { safeAddress: string; user: string }) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const tx = await safeContract.functions.userAddToSafe(user);
    await tx.wait();
    return tx;
  };

  const updateTransactionStatus = async (transaction: PaymentTransactions, status: string) => {
    const safeContract = new ethers.Contract(transaction.safeAddress, contractAbi, provider);
    const tx = await safeContract.functions.updateTransactionStatus(transaction.txhash, status);
    await tx.wait();
    return tx;
  };
  

  const getSafeInfoUsed = async ({ safeAddress }: { safeAddress: string }) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const safeInfoUsed = await safeContract.functions.getSafeInfoUsed();
    return safeInfoUsed;
  };

  const getSafeOwners = async ({ safeAddress }: { safeAddress: string }) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const safeOwners = await safeContract.functions.getSafeOwners();
    return safeOwners;
  };

  const getTransactionDetails = async ({ safeAddress, transactionId }: { safeAddress: string; transactionId: number }) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const transactionDetails = await safeContract.functions.getTransactionDetails(transactionId);
    return transactionDetails;
  };

  const isOwnerAddress = async ({ safeAddress, owner }: { safeAddress: string; owner: string }) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const isOwner = await safeContract.functions.isOwnerAddress(owner);
    return isOwner;
  };

  const getTotalWeight = async ({ safeAddress }: { safeAddress: string }) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const totalWeight = await safeContract.functions.getTotalWeight();
    return totalWeight;
  };

  const getThreshold = async ({ safeAddress }: { safeAddress: string }) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const threshold = await safeContract.functions.getThreshold();
    return threshold;
  };

  const executeTransaction = async ({ safeAddress, transaction }: executeTransParam) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const tx = {
      to: safeAddress,
      value: 0,
      data: transaction.data,
      gasLimit: ethers.utils.hexlify(1000000),
      nonce: await provider.getTransactionCount(safeAddress),
    };
    const receipt = await provider.sendTransaction(tx);
    await safeContract.functions.storeTransaction(safeAddress, receipt.timestamp, transaction.data, true, receipt.hash);
    return receipt;
  };

  const getAllTransactions = async ({ safeAddress }: SafeInfoParam) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const transactions = await safeContract.functions.getMultiSigTransactions();
    transactionPull.push(transactions);
    return transactions;
  };

  const isTxnExecutable = async ({ safeAddress, transaction }: executeTransParam) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const executable = await safeContract.functions.isTransactionExecutable(transaction);
    return executable;
  };

  const proposeTransaction = async (safeAddress: string, transaction: PaymentTransactions, { safeAddress, transaction }: executeTransParam) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const tx = await safeContract.functions.proposeTransaction(transaction);
    await tx.wait();
    return tx;
  };

  const approveTransfer = async ({ safeAddress, transaction }: executeTransParam) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const tx = await safeContract.functions.approveTransaction(transaction);
    await tx.wait();
    return tx;
  };

  const rejectTransfer = async ({ safeAddress, transaction }: executeTransParam) => {
    const safeContract = new ethers.Contract(safeAddress, contractAbi, provider);
    const tx = await safeContract.functions.rejectTransaction(transaction);
    await tx.wait();
    return tx;
  };

  return {
    setUpMultiSigSafeAddress,
    addAddressToSafe,
    getSafeInfo,
    executeTransaction,
    getAllTransactions,
    isTxnExecutable,
    proposeTransaction,
    approveTransfer,
    rejectTransfer,
    transactionPull,
    removeOwner,
    updateThreshold,
    getOwners,
    getOwnerDetails,
    getTransactionCount,
    getUserTransactions,
    setPendingAddOwnerData,
    setIsPendingAddOwner,
    userAddToSafe,
    updateTransactionStatus,
    getSafeInfoUsed,
    getSafeOwners,
    getTransactionDetails,
    isOwnerAddress,
    getTotalWeight,
    getThreshold,
  };
};

export default useSafeDetailsAndSetup;