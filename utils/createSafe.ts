// C:\Users\Admin\Documents\peeapp\EVPricerBuild\utils\createSafe.ts

// WE WONT USE THIS ONE
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

// Define the contract ABI and bytecode
const contractAbi: any[] = [];
const contractBytecode: any = '';

// Define the provider
const provider: Web3Provider = new ethers.providers.Web3Provider(window.ethereum);

// Get the signer
const signer: ethers.Signer = provider.getSigner();

interface CreateSafeResponse {
  newSafeAddress: string;
  safeContract: ethers.Contract;
}

interface CreateSafeParams {
  threshold: number;
  extraUserAddresses?: string[];
}

// Define the function to create a new Safe
export const createSafe = async ({ threshold, extraUserAddresses }: CreateSafeParams): Promise<CreateSafeResponse> => {
  // Deploy the Safe contract instance
  const safeFactory: ethers.ContractFactory = new ethers.ContractFactory(contractAbi, contractBytecode, signer);
  const safeContract: ethers.Contract = await safeFactory.deploy();

  // Wait for the contract to be deployed
  await safeContract.deployed();

  // Get the deployed contract address
  const newSafeAddress: string = safeContract.address;

  // Add extra user addresses to the Safe contract
  if (extraUserAddresses) {
    for (const address of extraUserAddresses) {
      const tx = await safeContract.addOwner(address);
      await tx.wait();
    }
  }

  return {
    newSafeAddress,
    safeContract,
  };
};

export default createSafe;