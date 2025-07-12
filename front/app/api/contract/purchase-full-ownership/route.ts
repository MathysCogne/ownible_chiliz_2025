import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, getContract } from 'viem';
import { spicyTestnet } from '@/lib/wagmi';

const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "assetId", "type": "uint256"}],
    "name": "purchaseFullOwnership",
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
      {"internalType": "uint256", "name": "remainingFragments", "type": "uint256"},
      {"internalType": "bool", "name": "isNFT", "type": "bool"},
      {"internalType": "bool", "name": "isTransferable", "type": "bool"},
      {"internalType": "address", "name": "issuer", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const CONTRACT_ADDRESS = "0x6F8B7f23B72FAb6a30251bcD531A26800C038B89" as const;

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
    const remainingFragments = asset[4]; // asset.remainingFragments
    const isNFT = asset[5]; // asset.isNFT

    if (remainingFragments === BigInt(0)) {
      return NextResponse.json({ error: 'No fragments available for purchase' }, { status: 400 });
    }

    // For full ownership purchase, the cost is the full valuation
    const totalCost = valuation;

    // Return transaction parameters for frontend to execute
    return NextResponse.json({
      contractAddress: CONTRACT_ADDRESS,
      functionName: "purchaseFullOwnership",
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