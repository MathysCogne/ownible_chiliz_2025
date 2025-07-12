import { createPublicClient, http, getContract } from 'viem';
import { spicyTestnet } from './wagmi';

export const CONTRACT_ADDRESS = "0x0a28af612331710a3C6227c81fC26e01C6c88B32" as const;

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
      {"internalType": "bool", "name": "isTransferable", "type": "bool"},
      {"internalType": "string", "name": "metadataURI", "type": "string"},
      {"internalType": "string", "name": "imageURI", "type": "string"}
    ],
    "name": "createAsset",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "uri",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "assetId", "type": "uint256"},
      {"internalType": "string", "name": "newMetadataURI", "type": "string"}
    ],
    "name": "updateMetadata",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "assetId", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "buyFragments",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "assetId", "type": "uint256"}],
    "name": "buyFullOwnership",
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
      {"internalType": "bool", "name": "isNFT", "type": "bool"},
      {"internalType": "bool", "name": "isTransferable", "type": "bool"},
      {"internalType": "uint256", "name": "remainingFragments", "type": "uint256"},
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "string", "name": "metadataURI", "type": "string"},
      {"internalType": "string", "name": "imageURI", "type": "string"}
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
  metadataURI: string;
  imageURI: string;
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