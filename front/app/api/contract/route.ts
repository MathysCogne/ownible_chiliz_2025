import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, getContract, parseEther, formatEther } from 'viem';
import { spicyTestnet } from '@/lib/wagmi';

// Update the contract address to match your latest deployment
const CONTRACT_ADDRESS = "0x0a28af612331710a3C6227c81fC26e01C6c88B32" as const;

// Complete ABI based on your contract
const CONTRACT_ABI = [
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
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "authorizedIssuers",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
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
  }
] as const;

const publicClient = createPublicClient({
  chain: spicyTestnet,
  transport: http(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const assetId = searchParams.get('assetId');
    const address = searchParams.get('address');

    const contract = getContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      client: publicClient,
    });

    switch (action) {
      case 'getAssetCount':
        const count = await contract.read.getAssetCount();
        return NextResponse.json({ count: count.toString() });

      case 'getContractStats':
        const stats = await contract.read.getContractStats();
        return NextResponse.json({
          totalAssets: stats[0].toString(),
          activeAssets: stats[1].toString(),
          totalOwnerships: stats[2].toString()
        });

      case 'getAsset':
        if (!assetId) {
          return NextResponse.json({ error: 'Asset ID required' }, { status: 400 });
        }
        const asset = await contract.read.assets([BigInt(assetId)]);
        return NextResponse.json({
          name: asset[0],
          category: asset[1],
          valuation: formatEther(asset[2]),
          totalFragments: asset[3].toString(),
          remainingFragments: asset[6].toString(),
          isNFT: asset[4],
          isTransferable: asset[5],
          owner: asset[7],
          metadataURI: asset[8],
          imageURI: asset[9]
        });

      case 'getFragmentInfo':
        if (!assetId) {
          return NextResponse.json({ error: 'Asset ID required' }, { status: 400 });
        }
        const fragmentInfo = await contract.read.getFragmentInfo([BigInt(assetId)]);
        return NextResponse.json({
          totalSupply: fragmentInfo[0].toString(),
          availableSupply: fragmentInfo[1].toString(),
          pricePerUnit: formatEther(fragmentInfo[2]),
          isActive: fragmentInfo[3]
        });

      case 'getFragmentBalance':
        if (!assetId || !address) {
          return NextResponse.json({ error: 'Asset ID and address required' }, { status: 400 });
        }
        const balance = await contract.read.getFragmentBalance([BigInt(assetId), address as `0x${string}`]);
        return NextResponse.json({ balance: balance.toString() });

      case 'getBalanceOf':
        if (!assetId || !address) {
          return NextResponse.json({ error: 'Asset ID and address required' }, { status: 400 });
        }
        const tokenBalance = await contract.read.balanceOf([BigInt(assetId), address as `0x${string}`]);
        return NextResponse.json({ balance: tokenBalance.toString() });

      case 'getAdmin':
        const admin = await contract.read.admin();
        return NextResponse.json({ admin });

      case 'getBaseURI':
        const baseURI = await contract.read.baseURI();
        return NextResponse.json({ baseURI });

      case 'isAuthorizedIssuer':
        if (!address) {
          return NextResponse.json({ error: 'Address required' }, { status: 400 });
        }
        const isAuthorized = await contract.read.authorizedIssuers([address as `0x${string}`]);
        return NextResponse.json({ isAuthorized });

      case 'getAllAssets':
        const assetCount = await contract.read.getAssetCount();
        const assets = [];
        
        for (let i = 1; i <= Number(assetCount); i++) {
          try {
            const asset = await contract.read.assets([BigInt(i)]);
            const fragmentInfo = await contract.read.getFragmentInfo([BigInt(i)]);
            
            assets.push({
              id: i,
              name: asset[0],
              category: asset[1],
              valuation: formatEther(asset[2]),
              totalFragments: asset[3].toString(),
              remainingFragments: asset[6].toString(),
              isNFT: asset[4],
              isTransferable: asset[5],
              owner: asset[7],
              metadataURI: asset[8],
              imageURI: asset[9],
              fragmentInfo: {
                totalSupply: fragmentInfo[0].toString(),
                availableSupply: fragmentInfo[1].toString(),
                pricePerUnit: formatEther(fragmentInfo[2]),
                isActive: fragmentInfo[3]
              }
            });
          } catch (error) {
            console.error(`Error fetching asset ${i}:`, error);
          }
        }
        
        return NextResponse.json({ assets });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Contract API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}