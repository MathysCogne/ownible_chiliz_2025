import { NextResponse } from 'next/server';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { spicyTestnet } from '@/lib/wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { uploadImageToIPFS, uploadMetadataToIPFS, createAssetMetadata } from '@/lib/ipfs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const valuation = formData.get('valuation') as string;
    const totalFragments = parseInt(formData.get('totalFragments') as string);
    const isNFT = formData.get('isNFT') === 'true';
    const isTransferable = formData.get('isTransferable') === 'true';
    const image = formData.get('image') as File;

    // Validation
    if (!name || !category || !description || !valuation || !totalFragments || !image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upload image to IPFS
    console.log('📸 Uploading image to IPFS...');
    const imageUrl = await uploadImageToIPFS(image);
    console.log('✅ Image uploaded:', imageUrl);

    // Create metadata
    const metadata = createAssetMetadata(
      name,
      description,
      imageUrl,
      category,
      valuation,
      totalFragments
    );

    // Upload metadata to IPFS
    console.log('📄 Uploading metadata to IPFS...');
    const metadataUrl = await uploadMetadataToIPFS(metadata);
    console.log('✅ Metadata uploaded:', metadataUrl);

    // Create blockchain transaction
    const rawKey = process.env.PRIVATE_KEY;
    if (!rawKey) {
      return NextResponse.json({ error: 'Private key not configured' }, { status: 500 });
    }

    const formattedKey = rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`;
    const account = privateKeyToAccount(formattedKey as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: spicyTestnet,
      transport: http(),
    });

    // Create the asset with metadata
    console.log('⛓️ Creating asset on blockchain...');
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createAsset',
      args: [
        name,
        category,
        BigInt(valuation),
        BigInt(totalFragments),
        isNFT,
        isTransferable,
        metadataUrl,
        imageUrl
      ],
    });

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      metadataUrl,
      imageUrl,
      metadata,
      message: 'Asset created with IPFS metadata'
    });

  } catch (error) {
    console.error('Create asset with metadata error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create asset with metadata',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}