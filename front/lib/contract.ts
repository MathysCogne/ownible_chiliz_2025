import { createPublicClient, http, getContract } from 'viem';
import { spicyTestnet } from './wagmi';

export const CONTRACT_ADDRESS = "0x6F8B7f23B72FAb6a30251bcD531A26800C038B89" as const;

export const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "_baseURI", "type": "string"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "baseURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAssetCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractStats",
    "outputs": [
      {"internalType": "uint256", "name": "totalAssets", "type": "uint256"},
      {"internalType": "uint256", "name": "activeAssets", "type": "uint256"},
      {"internalType": "uint256", "name": "totalOwnerships", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "category", "type": "string"},
      {"internalType": "uint256", "name": "valuation", "type": "uint256"},
      {"internalType": "uint256", "name": "totalFragments", "type": "uint256"},
      {"internalType": "bool", "name": "isNFT", "type": "bool"},
      {"internalType": "bool", "name": "isTransferable", "type": "bool"}
    ],
    "name": "createAsset",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "assetId", "type": "uint256"},
      {"internalType": "uint256", "name": "fragmentAmount", "type": "uint256"}
    ],
    "name": "purchaseFragments",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "assetId", "type": "uint256"}],
    "name": "purchaseFullOwnership",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "issuer", "type": "address"}],
    "name": "addAuthorizedIssuer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "issuer", "type": "address"}],
    "name": "removeAuthorizedIssuer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "authorizedIssuers",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "assets",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "category", "type": "string"},
      {"internalType": "uint256", "name": "valuation", "type": "uint256"},
      {"internalType": "uint256", "name": "totalFragments", "type": "uint256"},
      {"internalType": "uint256", "name": "remainingFragments", "type": "uint256"},
      {"internalType": "bool", "name": "isNFT", "type": "bool"},
      {"internalType": "bool", "name": "isTransferable", "type": "bool"},
      {"internalType": "address", "name": "issuer", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "assetId", "type": "uint256"},
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "assetId", "type": "uint256"},
      {"internalType": "address", "name": "owner", "type": "address"}
    ],
    "name": "getFragmentBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "assetId", "type": "uint256"}],
    "name": "getFragmentInfo",
    "outputs": [
      {"internalType": "uint256", "name": "totalSupply", "type": "uint256"},
      {"internalType": "uint256", "name": "availableSupply", "type": "uint256"},
      {"internalType": "uint256", "name": "pricePerUnit", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const publicClient = createPublicClient({
  chain: spicyTestnet,
  transport: http(),
});

export function getContractInstance() {
  return getContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    client: publicClient,
  });
}

// Updated types based on your actual contract
export interface Asset {
  id: number;
  name: string;
  category: string;
  valuation: string;
  totalFragments: string;
  remainingFragments: string;
  isNFT: boolean;
  isTransferable: boolean;
  issuer: string;
  fragmentInfo?: {
    totalSupply: string;
    availableSupply: string;
    pricePerUnit: string;
    isActive: boolean;
  };
}

export interface ContractStats {
  totalAssets: string;
  activeAssets: string;
  totalOwnerships: string;
}

export interface FragmentInfo {
  totalSupply: string;
  availableSupply: string;
  pricePerUnit: string;
  isActive: boolean;
}