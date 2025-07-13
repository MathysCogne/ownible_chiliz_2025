import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { spicyTestnet } from '@/lib/wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      category, 
      valuation, 
      totalFragments, 
      isNFT, 
      isTransferable, 
      metadataUri,
      imageUri
    } = await request.json();

    if (!name || !category || !valuation || !totalFragments || !metadataUri) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const rawKey = process.env.ADMIN_PRIVATE_KEY;
    if (!rawKey) {
      return NextResponse.json(
        { error: 'ADMIN_PRIVATE_KEY not configured' },
        { status: 500 }
      );
    }

    const formattedKey = rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`;
    const account = privateKeyToAccount(formattedKey as `0x${string}`);
    
    const walletClient = createWalletClient({
      account,
      chain: spicyTestnet,
      transport: http(),
    });

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createAsset',
      args: [
        name, 
        category, 
        parseEther(valuation),
        BigInt(totalFragments), 
        isNFT || false, 
        isTransferable !== false,
        metadataUri,
        imageUri || ""
      ],
      account,
    });

    return NextResponse.json({
      success: true,
      txHash: hash,
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