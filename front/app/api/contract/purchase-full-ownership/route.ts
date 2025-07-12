import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, getContract } from 'viem';
import { spicyTestnet } from '@/lib/wagmi';

const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "assetId", "type": "uint256"}],
    "name": "buyFullOwnership",
    "outputs": [],
    "stateMutability": "payable",
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
  }
] as const;

const CONTRACT_ADDRESS = "0x0a28af612331710a3C6227c81fC26e01C6c88B32" as const;

const publicClient = createPublicClient({
  chain: spicyTestnet,
  transport: http(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId } = body;

    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID required' }, { status: 400 });
    }

    // Get asset info to calculate cost
    const contract = getContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      client: publicClient,
    });

    const asset = await contract.read.assets([BigInt(assetId)]);
    const valuation = asset[2]; // asset.valuation
    const remainingFragments = asset[6]; // asset.remainingFragments (new index)
    const isNFT = asset[4]; // asset.isNFT

    if (remainingFragments === BigInt(0)) {
      return NextResponse.json({ error: 'No fragments available for purchase' }, { status: 400 });
    }

    // For full ownership purchase, the cost is the full valuation
    const totalCost = valuation;

    // Return transaction parameters for frontend to execute
    return NextResponse.json({
      contractAddress: CONTRACT_ADDRESS,
      functionName: "buyFullOwnership",
      args: [assetId],
      value: totalCost.toString(),
      gasLimit: 500000,
      gasPrice: "2501000000000", // 2501 gwei
      estimatedCost: totalCost.toString(),
      remainingFragments: remainingFragments.toString(),
      isNFT
    });
  } catch (error) {
    console.error('Purchase full ownership API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}