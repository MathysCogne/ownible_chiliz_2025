import { NextResponse } from 'next/server';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { spicyTestnet } from '@/lib/wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

export async function POST(request: Request) {
  try {
    const { name, category, valuation, totalFragments, isNFT, isTransferable } = await request.json();

    // You'll need to set your private key in environment variables
    const rawKey = process.env.PRIVATE_KEY;
    if (!rawKey) {
      return NextResponse.json(
        { error: 'Private key not configured' },
        { status: 500 }
      );
    }

    // Add 0x prefix if not present - viem expects properly formatted hex string
    const formattedKey = rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`;

    const account = privateKeyToAccount(formattedKey as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: spicyTestnet,
      transport: http(),
    });

    // Create the asset
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createAsset',
      args: [name, category, BigInt(valuation), BigInt(totalFragments), isNFT, isTransferable],
    });

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      message: 'Asset creation transaction sent'
    });

  } catch (error) {
    console.error('Create asset error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create asset',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}