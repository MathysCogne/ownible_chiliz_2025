import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, getContract } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { spicyTestnet } from '@/lib/wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

// Utility function to format private key correctly
function formatPrivateKey(raw: string | undefined): `0x${string}` {
  if (!raw) throw new Error('Missing PRIVATE_KEY env var');
  return raw.startsWith('0x') ? raw as `0x${string}` : `0x${raw}` as `0x${string}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, fragmentAmount, buyerAddress } = body;

    if (!assetId || !fragmentAmount || !buyerAddress) {
      return NextResponse.json({ 
        error: 'Missing required parameters: assetId, fragmentAmount, buyerAddress' 
      }, { status: 400 });
    }

    // Create public client to read contract data
    const publicClient = createPublicClient({
      chain: spicyTestnet,
      transport: http('https://spicy-rpc.chiliz.com'),
    });

    // Get contract instance for reading
    const readContract = getContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      client: publicClient,
    });

    // Get asset info to calculate the correct price
    const asset = await readContract.read.assets([BigInt(assetId)]);
    const valuation = asset[2]; // asset.valuation
    const totalFragments = asset[3]; // asset.totalFragments
    const remainingFragments = asset[6]; // asset.remainingFragments
    const isTransferable = asset[5]; // asset.isTransferable

    // Validate asset
    if (!isTransferable) {
      return NextResponse.json({ 
        error: 'Asset is not transferable' 
      }, { status: 400 });
    }

    if (BigInt(fragmentAmount) > remainingFragments) {
      return NextResponse.json({ 
        error: `Not enough fragments available. Available: ${remainingFragments.toString()}, Requested: ${fragmentAmount}` 
      }, { status: 400 });
    }

    // Calculate the correct total cost based on asset valuation
    const totalCost = (valuation * BigInt(fragmentAmount)) / totalFragments;

    // Create wallet client with properly formatted private key
    const account = privateKeyToAccount(formatPrivateKey(process.env.PRIVATE_KEY));
    const walletClient = createWalletClient({
      account,
      chain: spicyTestnet,
      transport: http('https://spicy-rpc.chiliz.com'),
    });

    // Get contract instance for writing
    const writeContract = getContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      client: walletClient,
    });

    // Execute the purchase using the correct function name
    const hash = await writeContract.write.buyFragments(
      [BigInt(assetId), BigInt(fragmentAmount)],
      { value: totalCost }
    );

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      message: 'Fragment purchase transaction sent',
      details: {
        assetId,
        fragmentAmount,
        buyerAddress,
        totalCost: totalCost.toString(),
        pricePerFragment: ((valuation / totalFragments).toString()),
        remainingFragments: remainingFragments.toString()
      }
    });

  } catch (error) {
    console.error('Buy fragments API error:', error);
    return NextResponse.json({ 
      error: 'Failed to buy fragments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}