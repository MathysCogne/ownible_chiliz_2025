import { NextRequest, NextResponse } from 'next/server';
import { getContractInstance } from '@/lib/contract';
import { isAddress } from 'viem';

export async function GET(
  request: NextRequest,
  { params }: { params: { address?: string } }
) {
  try {
    const { address: userAddress } = await params;

    if (!userAddress || !isAddress(userAddress)) {
      return NextResponse.json({ error: 'Valid user address is required' }, { status: 400 });
    }

    const contract = getContractInstance();
    const assetCount = await contract.read.getAssetCount();
    const ownedAssets = [];

    for (let i = 1; i <= Number(assetCount); i++) {
      try {
        const balance = await contract.read.getFragmentBalance([
          BigInt(i),
          userAddress as `0x${string}`
        ]);

        if (balance > 0) {
          const asset = await contract.read.assets([BigInt(i)]);
          ownedAssets.push({
            id: i,
            name: asset[0],
            category: asset[1],
            valuation: asset[2].toString(),
            totalFragments: asset[3].toString(),
            remainingFragments: asset[6].toString(),
            isNFT: asset[4],
            isTransferable: asset[5],
            owner: asset[7],
            metadataURI: asset[8],
            imageURI: asset[9],
            quantity: balance.toString(), // The amount of fragments the user owns
          });
        }
      } catch (error) {
        console.error(`Error fetching portfolio asset ${i} for ${userAddress}:`, error);
      }
    }
    
    return NextResponse.json({ assets: ownedAssets });
  } catch (error) {
    console.error(`Portfolio fetch error:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 