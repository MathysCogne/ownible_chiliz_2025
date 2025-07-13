import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, getContract } from 'viem';
import { spicyTestnet } from '@/lib/wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

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

    const contract = getContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      client: publicClient,
    });

    // Fetch asset data directly from the public 'assets' mapping
    const assetData = await contract.read.assets([BigInt(assetId)]);
    const valuation = assetData[2];
    const totalFragments = assetData[3];
    const availableSupply = assetData[6];
    const isTransferable = assetData[5];

    if (!isTransferable) {
      return NextResponse.json({ error: 'Asset is not transferable' }, { status: 400 });
    }

    if (BigInt(fragmentAmount) > availableSupply) {
      return NextResponse.json({ error: 'Not enough fragments available' }, { status: 400 });
    }

    // Calculate total cost
    const totalCost = (valuation * BigInt(fragmentAmount)) / totalFragments;

    // Return transaction parameters for frontend to execute
    return NextResponse.json({
      contractAddress: CONTRACT_ADDRESS,
      functionName: "buyFragments",
      args: [assetId, fragmentAmount],
      value: totalCost.toString(),
    });
  } catch (error) {
    console.error('Purchase fragments API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}