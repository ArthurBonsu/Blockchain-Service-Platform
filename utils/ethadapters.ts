
import Web3 from 'web3';
import EthersAdapter from 'ethers';
import * as ethers from 'ethers';

declare let window: any;
let owner :string;
let ethAdapter: EthersAdapter.ethers.providers.Web3Provider;
let  amount: Number;

// Create adapter to capture the provider and the signer
export const ethAdaptername = async () => {
  // Initialize Web3 with the provider injected by MetaMask
  const web3Provider = window.ethereum;
  const web3 = new Web3(web3Provider);

  // Get accounts and set the first account as the signer
  const accounts = await web3.eth.getAccounts();
  owner = accounts[0];
 

  // Initialize the EthersAdapter with the Web3 provider and signer
 ethAdapter = new ethers.providers.Web3Provider(web3Provider, {
    name: 'Metamask',
    chainId: 1,
  });

  return { ethAdapter, owner };
};

// Function to sign a transaction
export const signTransactionBrowserProvider = async (
  ethAdapter: ethers.providers.Web3Provider,
  owner: string,
  toAddress: string,
  amount: Number
) => {
  const signer = await ethAdapter.getSigner();
  const txCount = await ethAdapter.getTransactionCount(owner);
  const tx = await signer.sendTransaction({
    from: owner,
    to: toAddress,
    value: ethers.utils.parseEther(amount.toString()),
    nonce: txCount,
  });
  return tx;
// Signing implementation saved just in case we need to sign in the future
  /*
  const txsendbrowser = await signer.signTransaction({
    from: owner,
    to: toAddress,
    value: ethers.parseEther(amount.toString()),
    nonce: txCount,
  });
  return txsendbrowser;
*/
  };

export const signTransactionSigner = async (
  ethAdapter: ethers.providers.JsonRpcProvider,
  owner: string,
  toAddress: string,
  amount: Number
) => {
  const signer = await ethAdapter.getSigner(owner);
  const txCount = await ethAdapter.getTransactionCount(owner);
  /*const tx = await signer.signTransaction({
    from: owner,
    to: toAddress,
    value: ethers.parseEther(amount.toString()),
    nonce: txCount,
  });
  return tx;
*/
  const txsend = await signer.sendTransaction({
    from: owner,
    to: toAddress,
    value: ethers.utils.parseEther(amount.toString()),
    nonce: txCount,
  });
  return txsend;
};

// Function to interact with a smart contract
export const interactWithContract = async (
  ethAdapter: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider,
  contractAddress: string,
  contractABI: string,
  functionName: string,
  ...args: any[]
) => {
  const contract = new ethers.Contract(contractAddress, contractABI, ethAdapter);
  const result = await contract[functionName](...args);
  return result;
};
// Function to get the balance of the owner address
export const getBalance = async (
  ethAdapter: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider,
  owner: string
) => {
  const balance = await ethAdapter.getBalance(owner);
  return ethers.utils.formatEther(balance);
};


export default ethAdaptername ;


//Now you can call each function separately to perform the desired task:


//const { ethAdapter, owner } = await ethAdaptername();

// Sign a transaction
//const tx = await signTransaction(ethAdapter, owner, '0x...', 1.0);

// Interact with a smart contract
//const result = await interactWithContract(ethAdapter, '0x...', [...], 'myFunction', ...args);

// Get the balance of the owner address
//const balance = await getBalance(ethAdapter, owner);