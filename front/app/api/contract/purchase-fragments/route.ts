import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, getContract, parseEther } from 'viem';
import { spicyTestnet } from '@/lib/wagmi';

const CONTRACT_ABI = [
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

const CONTRACT_ADDRESS = "0x6F8B7f23B72FAb6a30251bcD531A26800C038B89" as const;

const publicClient = createPublicClient({
  chain: spicyTestnet,
  transport: http(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, fragmentAmount } = body;

    if (!assetId || !fragmentAmount) {
      return NextResponse.json({ error: 'Asset ID and fragment amount required' }, { status: 400 });
    }

    // Get fragment info to calculate cost
    const contract = getContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      client: publicClient,
    });

    const fragmentInfo = await contract.read.getFragmentInfo([BigInt(assetId)]);
    const pricePerUnit = fragmentInfo[2]; // pricePerUnit
    const availableSupply = fragmentInfo[1]; // availableSupply
    const isActive = fragmentInfo[3]; // isActive

    if (!isActive) {
      return NextResponse.json({ error: 'Asset is not active' }, { status: 400 });
    }

    if (BigInt(fragmentAmount) > availableSupply) {
      return NextResponse.json({ error: 'Not enough fragments available' }, { status: 400 });
    }

    // Calculate total cost
    const totalCost = pricePerUnit * BigInt(fragmentAmount);

    // Return transaction parameters for frontend to execute
    return NextResponse.json({
      contractAddress: CONTRACT_ADDRESS,
      functionName: "purchaseFragments",
      args: [assetId, fragmentAmount],
      value: totalCost.toString(),
      gasLimit: 400000,
      gasPrice: "2501000000000", // 2501 gwei
      estimatedCost: totalCost.toString(),
      pricePerUnit: pricePerUnit.toString(),
      availableSupply: availableSupply.toString()
    });
  } catch (error) {
    console.error('Purchase fragments API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}